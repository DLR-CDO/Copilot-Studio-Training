# Copilot Studio Fundamentals: Build Your First Agent

Interactive, self-paced training site that teaches non-technical business users how to build agents in **Microsoft Copilot Studio**. Course content is sourced from `copilot-studio-training-guide.html` in the repo root.

## Live site (Azure Static Web Apps)

**https://copilotstudio-academy.azurewebsites.net** (redirects to the generated address https://jolly-smoke-0f957960f.7.azurestaticapps.net)

Static Web App `copilotstudio-training` (Free plan) in resource group `rg-copilotstudio-training` (subscription: SalesGPT Demo). Deploys on every push to `main` via `.github/workflows/deploy-swa.yml` (lint, test, build site and API, deploy).

- **Sign-in:** Static Web Apps' built-in Microsoft sign-in (no app registration needed). Every page except `/verify` and `/signed-out` requires sign-in, and the API only accepts accounts whose email ends in `@digitalrealty.com` (`ALLOWED_EMAIL_DOMAIN`). GitHub sign-in is blocked in `public/staticwebapp.config.json`.
- **Name on the certificate:** Static Web Apps does not pass the account's display name, so learners type it once on **My Certificate**. It is tied to their signed-in email and locks once the certificate is issued (it unlocks again after the certificate expires).
- **API:** `server/` runs as one Azure Function (`server/functions.ts`, bundled to `api-dist/` by `npm run build:api`) behind `/api/*`.
- **Storage:** Azure Table Storage account `stcopilotacademy`, tables `Learners` and `Certificates`.
- **Completion rule:** pass all 10 module quizzes at `PASSING_PERCENT` (80%, `src/content/types.ts`). The final score is the average of best quiz scores. Certificates expire after 12 months; a retake then issues a new ID.
- **Public verification:** `/verify?id=DR-CSA-XXXX-XXXX-XXXX` shows only name, course, completion date, valid/expired, and the final assessment score.
- **Admin export:** `/admin/completions` (CSV of every certificate) for emails listed in `ADMIN_EMAILS`.

App settings (Static Web App → Settings → Environment variables; never commit these):

| Setting | Purpose |
| --- | --- |
| `AZURE_STORAGE_CONNECTION_STRING` | Table Storage connection (secret) |
| `ADMIN_EMAILS` | Comma-separated admin emails for the CSV export |
| `ALLOWED_EMAIL_DOMAIN` | `digitalrealty.com` |
| `PUBLIC_BASE_URL` | Address printed in certificate verification links (`https://copilotstudio-academy.azurewebsites.net`) |

Run the full app locally with mock sign-in and in-memory storage:

```bash
npm run start:mock   # http://localhost:8080 — switch users at /.auth/login/aad
```

Without the API (`npm run dev`, or any static host), progress falls back to `localStorage` and no certificates are issued.

**Address to share:** https://copilotstudio-academy.azurewebsites.net. The App Service `copilotstudio-academy` runs only `redirect/redirect.cjs` (startup command `node /home/site/wwwroot/redirect.cjs`), which sends every path to the Static Web App named in its `REDIRECT_TARGET` app setting. Certificate verification links use this address (`PUBLIC_BASE_URL`), so keep the App Service running while certificates are valid. Relaying the site through the App Service instead does not work: Static Web Apps sign-in only accepts the app's own hostname or a verified custom domain. To get rid of the generated hostname, add a custom domain (one DNS record from IT) and change `REDIRECT_TARGET` to it so old links keep working.

## Stack

- React + TypeScript + Vite
- Tailwind CSS (custom design tokens)
- React Router v6/v7
- FlexSearch (client-side full-text search)
- Vitest + Testing Library

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

### Quality gates

```bash
npm run lint
npm run test
npm run build
```

Preview the production build:

```bash
npm run build && npm run preview
```

## Editing content

**Only edit files under `src/content/`.** Do not hardcode course copy in components.

| File | Purpose |
|---|---|
| `modules.ts` | All 10 modules (why, concept, build steps, watch-outs, try it, screenshots, checklists) |
| `quizzes.ts` | 5 questions per module (50 total) |
| `glossary.ts` | Key terms + plain-language definitions |
| `links.ts` | House rules + Keep learning links |
| `moduleNav.ts` | Sidebar/journey titles |

The original guide `copilot-studio-training-guide.html` remains the wording source of truth. Where structure/behavior differ from the static HTML, the interactive app brief wins.

## Adding real screenshots

Screenshot slots render placeholders until image files are present.

1. Capture UI from your Dev tenant (so learners see the real portal).
2. Drop files into `public/screenshots/` using this name pattern:

```
public/screenshots/{moduleId}-{n}.png
```

Examples:

- `public/screenshots/1-1.png` — Module 1, first slot
- `public/screenshots/3-1.png` and `3-2.png` — Module 3 has two slots
- `public/screenshots/7-1.png` and `7-2.png` — Module 7 has two slots

Annotation captions already live in each module’s `screenshotSlots` in `modules.ts`.

## Deploying the static build

```bash
npm run build
```

Deploy the `dist/` folder to any static host:

- Azure Static Web Apps
- IIS / static file share
- SharePoint (upload or embed the hosted URL)
- GitHub Pages / Netlify / any CDN

No server-side code, API, or environment variables are required.

### Shareable module URLs

Facilitators can deep-link learners to a module, e.g. `/module/3`.

## Learner features

- Sequential module gating (unlock next when previous is complete)
- **Free roam** toggle in Settings (unlocks reading everywhere; quizzes stay disabled while locked unless free roam is on — locked modules still show content with a banner)
- Knowledge checks (pass 4 of 5, unlimited retakes with shuffle)
- Hands-on Build it steppers + Try it checkboxes
- Interactive diagrams (keyboard accessible, respects `prefers-reduced-motion`)
- Search (`Ctrl/Cmd+K`)
- Glossary, cheat sheet (print-friendly), resources, progress + badges
- Per-module notes and print summary
- Reset progress from My progress (with confirm)

## Project layout

```
src/
  content/          Course data (edit here)
  components/
    diagrams/       Interactive SVG figures
    module/         Module page sections (quiz, stepper, …)
    layout/         Shell, sidebar, search
    ui/             Callouts, badges, tables
  pages/            Route pages
  lib/              Storage, progress, quiz, search
  hooks/            Reduced-motion helper
public/
  screenshots/      Optional real UI captures
copilot-studio-training-guide.html   Source guide
```

## Browser support

Current Edge and Chrome. Usable at 1366×768 and mobile ~390px width.
