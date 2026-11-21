/**
 * Phase 2 module content, transcribed from `copilot-studio-training-guide.html`
 * (see `src/content/_extracted.json`) and shaped to match `src/content/types.ts`.
 *
 * Source HTML wins for wording; the course brief wins for structure. The guide has no
 * separate "In plain words / Build it / Watch out" sections, so those are derived here
 * from the guide's why + You'll learn + Try it + house rules content.
 */
import type {
  BuildStep,
  BuildSubStep,
  ConceptBlock,
  InlineToken,
  LinkItem,
  Module,
  Screenshot,
  ScreenshotRequest,
} from './types'

const t = (text: string): InlineToken => ({ type: 'text', text })
const kw = (text: string, termId: string): InlineToken => ({ type: 'kw', text, termId })
const ui = (text: string): InlineToken => ({ type: 'ui', text })

const para = (tokens: InlineToken[]): ConceptBlock => ({ type: 'paragraph', tokens })
const list = (items: InlineToken[][]): ConceptBlock => ({ type: 'list', items })

interface StepDef {
  tokens: InlineToken[]
  substeps?: BuildSubStep[]
  verify?: boolean
}

const sub = (tokens: InlineToken[], verify = false): BuildSubStep =>
  verify ? { tokens, verify } : { tokens }

/** Marks a step whose click path still needs testing in the live Copilot Studio UI. */
const verifyStep = (tokens: InlineToken[], substeps?: BuildSubStep[]): StepDef => ({
  tokens,
  substeps,
  verify: true,
})

function buildSteps(moduleNum: number, steps: (InlineToken[] | StepDef)[]): BuildStep[] {
  return steps.map((step, i) => ({
    id: `m${moduleNum}-step-${i + 1}`,
    ...(Array.isArray(step) ? { tokens: step } : step),
  }))
}

/** First step for every module after Module 1: get from the home screen to the practice agent. */
const openPracticeAgent = (): InlineToken[] => [
  t('Check that the '),
  ui('globe icon'),
  t(' in the bottom left corner shows DEV. Then select '),
  ui('Agents'),
  t(' in the left navigation, and select your practice agent.'),
]

function goDeeper(links: LinkItem[]): LinkItem[] {
  return links
}

/** Course intro copy from the guide's `<header>` hero block. */
export interface CourseTitlePart {
  text: string
  accent?: boolean
}

export interface CourseMeta {
  eyebrow: string
  titleParts: CourseTitlePart[]
  lede: string
}

export const courseMeta: CourseMeta = {
  eyebrow: 'Internal Training · No coding required',
  titleParts: [{ text: 'Build your first agent with ' }, { text: 'Copilot Studio', accent: true }],
  lede: "A 10-module path for business users. You'll build one practice agent step by step, and by the last module you'll publish it for real. Every source is official Microsoft documentation.",
}

// ---------------------------------------------------------------------------
// Screenshots. `authorNotes` and `screenshotsToCapture` are for course authors and are never
// rendered. A screenshot is only listed once its image exists under public/.
// ---------------------------------------------------------------------------

const m1Screenshots: Screenshot[] = [
  {
    id: 'm1-shot-1',
    src: 'screenshots/1-1.png',
    alt: 'Copilot Studio Overview page for an agent, with the instructions box in the middle and the test pane on the right.',
    caption:
      'AI Enablement Assistant Overview in CDO - DEV, with instructions visible and the test pane open on the right.',
    authorNotes: 'Annotate: 1) left navigation, 2) instructions box, 3) test pane',
    capturedAt: '2026-08-04',
  },
]

const m2Screenshots: Screenshot[] = [
  {
    id: 'm2-shot-1',
    src: 'images/02-environment-picker.png',
    alt: 'The Switch environment menu open over the Copilot Studio home page, listing the current environment and other environments.',
    caption: 'Switch environment menu, opened from the globe icon at the bottom left.',
    authorNotes: 'Annotate: circle the current environment name, add "always check this first"',
    capturedAt: '2026-11-16',
  },
]

const m3Screenshots: Screenshot[] = [
  {
    id: 'm3-shot-1',
    src: 'screenshots/3-1.png',
    alt: 'The Add knowledge dialog with a file upload area and tiles for featured sources such as Public websites, SharePoint and Dataverse.',
    caption:
      'The Add knowledge dialog for AI Enablement Assistant (CDO - DEV), showing upload, SharePoint, and featured source options.',
    authorNotes: 'Annotate: highlight SharePoint / file upload as the everyday starting sources',
    capturedAt: '2026-08-04',
  },
  {
    id: 'm3-shot-2',
    src: 'images/03-test-pane-sources.png',
    alt: 'A test pane answer with its reference expanded, and a callout pointing to the cited source document.',
    caption: 'Always check the source the agent cites.',
    authorNotes: 'Annotate: arrow to the citation with "always check the source"',
    capturedAt: '2026-11-16',
  },
]

const m4Screenshots: Screenshot[] = [
  {
    id: 'm4-shot-1',
    src: 'screenshots/4-1.png',
    alt: 'The Topics list with All, Custom and System filters, showing each topic’s type, trigger and Enabled toggle.',
    caption:
      'The Topics list for AI Enablement Assistant showing custom topics (Greeting, Goodbye) and system topics.',
    authorNotes: 'Annotate: Custom vs System filters, and the Enabled toggles',
    capturedAt: '2026-08-04',
  },
]

const m5Screenshots: Screenshot[] = [
  {
    id: 'm5-shot-1',
    src: 'images/05-connector.png',
    alt: 'A connector tool’s Details page with the Description field highlighted and labelled “this is how the agent decides”.',
    caption:
      'A connector tool’s Details page. The Description field is how the agent decides when to use it.',
    authorNotes: 'Annotate: highlight the description field, "this is how the agent decides"',
    capturedAt: '2026-11-16',
  },
]

const m6Screenshots: Screenshot[] = [
  {
    id: 'm6-shot-1',
    src: 'images/06-child-agent.png',
    alt: 'A child agent’s Details page showing the error “Missing required property Description” under an empty Description field.',
    caption: 'Child agent Details: the description is required before the agent can be saved.',
    authorNotes:
      'Annotate: the missing Description error — routing depends on a crisp one-line job description',
    capturedAt: '2026-11-16',
  },
]

const m7Screenshots: Screenshot[] = [
  {
    id: 'm7-shot-1',
    src: 'images/07-model-dropdown-1.png',
    alt: 'The agent Overview page with the “Select your agent’s model” dropdown below the description.',
    caption: 'The model dropdown on the Overview page, under "Select your agent’s model".',
    authorNotes: "Annotate: model choice sits next to instructions — this is the agent's brain",
    capturedAt: '2026-11-16',
  },
  {
    id: 'm7-shot-2',
    src: 'images/07-model-dropdown-2.png',
    alt: 'The model dropdown open, listing models with Preview and Experimental tags circled and labelled “not for production”.',
    caption: 'The model dropdown open. Preview and Experimental tags mean not for production.',
    authorNotes: 'Annotate: circle Preview / Experimental tags — not for production',
    capturedAt: '2026-11-16',
  },
]

const m8ScreenshotsToCapture: ScreenshotRequest[] = [
  {
    id: 'm8-shot-1',
    caption:
      'The activity map for a test conversation, showing which knowledge, tools, and topics the agent used for one answer.',
    authorNotes:
      'Capture: open the Activity tab for a test conversation and expand one answer. Annotate: label each step the agent took, and circle the knowledge source it picked.',
  },
  {
    id: 'm8-shot-2',
    caption:
      'The results of an evaluation run on the Evaluation page, with pass and fail results for each test question.',
    authorNotes:
      'Capture: the finished run with at least one failed question visible. Annotate: point to a failed case with "this is gold, it tells you what to fix".',
  },
]

const m9ScreenshotsToCapture: ScreenshotRequest[] = [
  {
    id: 'm9-shot-1',
    caption:
      'The Analytics page of a published agent, showing sessions, engagement, resolution, and escalation.',
    authorNotes:
      'Capture: the Analytics summary for the last 7 days of a published agent. Annotate: circle the resolution rate and the escalation rate.',
  },
]

const m10ScreenshotsToCapture: ScreenshotRequest[] = [
  {
    id: 'm10-shot-1',
    caption:
      'The Channels page after publishing, showing the Demo website tile alongside Teams and Microsoft 365 and the other channel tiles.',
    authorNotes:
      'Capture: the full Channels page of your published practice agent. Annotate: circle the Demo website tile with "start here for stakeholder review". public/screenshots/10-1.png exists but shows a colleague’s name in “Published by”; recapture or blur before use.',
  },
  {
    id: 'm10-shot-2',
    caption: 'The demo website open in a browser, with the agent answering a test question.',
    authorNotes:
      'Capture: the demo website after you ask one question. Annotate: point to the browser address bar with "share this demo link for feedback before going live".',
  },
]

/** In dependency order: each check relies on the one before it. */
export const PRE_PUBLISH_CHECKS = [
  'Right environment: you are publishing the right agent, from the right environment',
  'Knowledge verified: the sources are current and citations point where you expect',
  'Evaluation passed: your test set runs clean on the latest version',
  'Right channel: the audience you mean to reach, starting with the demo website',
]

export const modules: Module[] = [
  // -------------------------------------------------------------------------
  // Module 1
  // -------------------------------------------------------------------------
  {
    id: 1,
    harness: 'standard',
    slug: 'what-is-an-agent',
    title: 'What is an agent?',
    whyItMatters:
      'Everything in Copilot Studio makes sense once you can picture the parts of an agent.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Agent Architect',
    diagram: 'fig1',
    concept: [
      para([
        t('Everything in Copilot Studio makes sense once you can picture the parts of an '),
        kw('agent', 'agent'),
        t(
          ': description, model, instructions, knowledge, tools, triggers, other agents, topics, and suggested prompts, plus the channels where people use it.',
        ),
      ]),
      list([
        [
          t('What an '),
          kw('agent', 'agent'),
          t(' is, in plain language: a '),
          kw('description', 'agent-description'),
          t(' + a '),
          kw('model', 'model'),
          t(' + instructions + knowledge + '),
          kw('tools', 'tool'),
          t(' + '),
          kw('triggers', 'trigger'),
          t(' + other agents ('),
          kw('child agents', 'child-agent'),
          t(') + '),
          kw('topics', 'topic'),
          t(' + '),
          kw('suggested prompts', 'suggested-prompt'),
          t(', used through '),
          kw('channels', 'channel'),
        ],
        [
          t('Conversational '),
          kw('agents', 'agent'),
          t(' (people chat with them) vs autonomous '),
          kw('agents', 'agent'),
          t(' (they act on '),
          kw('triggers', 'trigger'),
          t(')'),
        ],
        [
          t('Why every agent is created inside a '),
          kw('solution', 'solution'),
          t(' in the DEV environment'),
        ],
        [
          t(
            'A tour of Copilot Studio: the Overview page, the tabs along the top, and the test pane',
          ),
        ],
        [t('Licensing basics and Copilot Credits, awareness level only')],
      ]),
    ],
    buildSteps: buildSteps(1, [
      [
        t(
          'Before you do anything, make sure you are in the correct environment, which is the DEV environment. Do not do anything until it is selected. To change it, click the ',
        ),
        ui('globe icon'),
        t(' in the bottom left corner, above your name, and select the DEV environment.'),
      ],
      [
        t('On the home screen, once logged in, select '),
        ui('Other ways to build'),
        t(', then select '),
        ui('Agent (standard)'),
        t('.'),
      ],
      {
        tokens: [t('Name your agent and create the solution that will store it.')],
        substeps: [
          sub([t('In the '), ui('Name'), t(' box, enter a name for your agent.')]),
          sub([t('Expand the agent settings section below the name.')]),
          sub([t('Leave the schema name as it is.')]),
          sub([t('Select the language your agent will speak.')]),
          sub([
            t('Open a new browser tab and go to Power Apps at '),
            ui('make.powerapps.com'),
            t('.'),
          ]),
          sub([t('Log in with your work account.')]),
          sub([t('In the left navigation, select '), ui('Solutions'), t('.')]),
          sub([
            t('Select '),
            ui('+ New solution'),
            t(' in the top left corner of the Solutions page.'),
          ]),
          sub([t('Enter a '), ui('Display name'), t(' for the solution.')]),
          sub([t('Enter a '), ui('Name'), t(' for the solution.')]),
          sub([t('Select a '), ui('Publisher'), t('.')]),
          sub([t('Leave the '), ui('Version'), t(' as it is.')]),
          sub([t('Leave '), ui('Set as preferred solution'), t(' unchecked.')]),
          sub([
            t('Select '),
            ui('Create'),
            t('. The solution stores all the work you do on this agent.'),
          ]),
          sub([t('Go back to the Copilot Studio browser tab.')]),
          sub([
            t('In the agent settings, select the display name of the solution you just created.'),
          ]),
          sub([t('Select '), ui('Create'), t('.')]),
        ],
      },
      {
        tokens: [
          t('Work through the '),
          ui('Overview'),
          t(' page one section at a time, from top to bottom.'),
        ],
        substeps: [
          sub([
            t('Explore the '),
            ui('Overview'),
            t(' page. The '),
            ui('test pane'),
            t(', where you chat with your agent, sits on the right side of the screen.'),
          ]),
          sub([
            ui('Description'),
            t(
              ': write one or two sentences that say what your agent does. People and other agents read it to decide when to use your agent.',
            ),
          ]),
          sub([
            ui('Model'),
            t(': leave the default model selected. Module 07 covers choosing a model.'),
          ]),
          sub([
            ui('Instructions'),
            t(
              ': use a generative AI tool to help you write structured instructions. Look at the instructions of live agents for examples.',
            ),
          ]),
          sub([
            ui('Knowledge'),
            t(': select '),
            ui('Add knowledge'),
            t(
              '. A pop-up opens where you can drag and drop files, or connect SharePoint or OneDrive.',
            ),
          ]),
          sub([
            t('In the pop-up, select '),
            ui('OneDrive'),
            t(
              ' and pick your file. Turn on web search only for broad agents that do not handle confidential information.',
            ),
          ]),
          sub([
            ui('Tools'),
            t(': select '),
            ui('Add tool'),
            t(' to connect apps like Outlook, Teams, or SharePoint. You can skip this for now.'),
          ]),
          sub([
            ui('Triggers'),
            t(
              ': triggers start the agent automatically. For example, when an urgent question arrives by email, the agent can answer it by email. Leave this for now.',
            ),
          ]),
          sub([
            ui('Agents'),
            t(
              ': you can add agents inside your agent to handle specific steps of a workflow. You will do this later, in Module 06.',
            ),
          ]),
          sub([
            ui('Topics'),
            t(': every agent needs a greeting topic. Leave the default topics for now.'),
          ]),
          sub([
            ui('Suggested prompts'),
            t(
              ': starter prompts, each with a title, that show users what to ask. Leave these for now.',
            ),
          ]),
        ],
      },
      [
        t(
          "Once you've added the description, model, instructions, and knowledge, test your agent by entering three different questions in the ",
        ),
        ui('test pane'),
        t(
          ". Use a generative AI tool to write questions your knowledge files are certain to answer. That way you know the agent works, and a wrong answer isn't caused by missing knowledge.",
        ),
      ],
    ]),
    watchOuts: [
      'One agent, built progressively — every module adds a layer to the same practice agent, and by Module 10 you will have published something real.',
      'Licensing and Copilot Credits are awareness level only for now — nothing to configure yet.',
      'Ask early, ask often — post questions in the shared FAQ so your question improves the course for the next cohort.',
    ],
    screenshots: m1Screenshots,
    tryIt:
      "Create your first agent in the DEV environment, inside a new solution. Add a description, instructions, and knowledge, then ask it three questions in the test pane. That's it, you've built an agent.",
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio',
        label: 'What is Microsoft Copilot Studio?',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started',
        label: 'Build an agent from the ground up',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-gpt-overview',
        label: 'Use generative AI to build agents fast',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions',
        label: 'Licensing and subscriptions',
      },
    ]),
    checklist: [
      'Confirmed the DEV environment is selected before building',
      'Created a solution in Power Apps and created my agent inside it',
      'Added a description, instructions, and knowledge on the Overview page',
      'Asked the agent three questions in the test pane',
      'Can point to the description, model, instructions, knowledge, tools, triggers, agents, topics, and suggested prompts on the Overview page',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 2
  // -------------------------------------------------------------------------
  {
    id: 2,
    harness: 'standard',
    slug: 'pick-the-right-environment',
    title: 'Pick the right environment',
    whyItMatters:
      'The #1 beginner mistake is building in the wrong place. Learn this before you build anything you care about.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Environment Guardian',
    diagram: 'fig2',
    concept: [
      para([
        t(
          'The #1 beginner mistake is building in the wrong place. Learn this before you build anything you care about.',
        ),
      ]),
      para([
        t(
          'Work flows one direction: Dev → Test → Production. Why you never build directly in Production is the first thing to get straight about ',
        ),
        kw('environments', 'environment'),
        t('.'),
      ]),
      list([
        [
          t('What an '),
          kw('environment', 'environment'),
          t(' is: a container for '),
          kw('agents', 'agent'),
          t(', data, and permissions'),
        ],
        [t('Why you never build directly in Production')],
        [
          t('How to check and switch your '),
          kw('environment', 'environment'),
          t(': the globe icon in the bottom left corner, above your name'),
        ],
        [
          t('What admins control per '),
          kw('environment', 'environment'),
          t(': data policies, and whether preview AI '),
          kw('models', 'model'),
          t(' are allowed'),
        ],
      ]),
    ],
    buildSteps: buildSteps(2, [
      [
        t('Look at the bottom left corner of Copilot Studio. The '),
        ui('globe icon'),
        t(' above your name shows the environment you are in.'),
      ],
      [
        t('Click the '),
        ui('globe icon'),
        t(' to open the '),
        ui('Switch environment'),
        t(' menu.'),
      ],
      [t('Read the name under '), ui('Current environment'), t(' and say it out loud.')],
      [
        t('If it is not your DEV environment, select DEV from the list under '),
        ui('All environments'),
        t('.'),
      ],
      [
        t(
          'Note what your admin controls here: data policies, and whether preview AI models are allowed.',
        ),
      ],
    ]),
    watchOuts: [
      'Why you never build directly in Production — work flows one direction: Dev → Test → Production.',
      "Environments come first — always confirm you're in Dev before touching anything. It's the check that prevents the most painful mistakes.",
    ],
    screenshots: m2Screenshots,
    tryIt:
      "Click the globe icon in the bottom left corner, above your name. Say out loud which environment you're in, and switch to DEV if you're not already there.",
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/environments-first-run-experience',
        label: 'Work with environments',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention',
        label: 'Data policies for agents',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing',
        label: 'Licenses and access',
      },
    ]),
    checklist: [
      'Opened the Switch environment menu from the globe icon in the bottom left corner',
      'Confirmed I am in DEV',
      'Confirmed my practice agent lives in Dev',
      'Know who to ask about data policy and preview model questions',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 3
  // -------------------------------------------------------------------------
  {
    id: 3,
    harness: 'standard',
    slug: 'add-knowledge',
    title: 'Add knowledge',
    whyItMatters:
      'Knowledge is what turns a generic chatbot into your expert. Answers come from your content, with citations.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Knowledge Keeper',
    diagram: 'fig3',
    concept: [
      para([
        t(
          'Knowledge is what turns a generic chatbot into your expert. Answers come from your content, with ',
        ),
        kw('citations', 'citation'),
        t('.'),
      ]),
      para([
        t('Generative answers use '),
        kw('knowledge sources', 'knowledge-source'),
        t(', and writing a good description for each source is how the '),
        kw('agent', 'agent'),
        t(' picks the right one.'),
      ]),
      list([
        [t('How generative answers use '), kw('knowledge sources', 'knowledge-source')],
        [t('The main source types: SharePoint, OneDrive, uploaded files, and public websites')],
        [
          t('Writing a good description for each source, this is how the '),
          kw('agent', 'agent'),
          t(' picks the right one'),
        ],
        [t('The "use general knowledge" toggle, and when to switch it off')],
        [t('Checking whether an answer actually came from your knowledge')],
      ]),
      {
        type: 'table',
        caption: 'Main knowledge sources and what they’re for',
        headers: ['Source type', 'What it’s for'],
        rows: [
          ['SharePoint', 'Search a SharePoint site or document library your team already uses.'],
          ['OneDrive', 'Ground answers in files stored in your OneDrive.'],
          [
            'Uploaded files',
            'Ground answers in files you drag and drop in directly, like PDFs or Word docs.',
          ],
          [
            'Public websites',
            'Pull answers from pages on the public web. Use web search only for broad agents that do not handle confidential information.',
          ],
        ],
      },
      para([
        t(
          'Other sources: Copilot Studio also lists other options, such as Dataverse tables and other business systems. They are used less often here.',
        ),
      ]),
    ],
    buildSteps: buildSteps(3, [
      openPracticeAgent(),
      [
        t('Select the '),
        ui('Knowledge'),
        t(' tab in the row of tabs along the top of the page, next to '),
        ui('Overview'),
        t('.'),
      ],
      [t('Select '), ui('Add knowledge'), t('. A pop-up opens with the source options.')],
      [
        t('In the pop-up, select '),
        ui('SharePoint'),
        t(' or '),
        ui('OneDrive'),
        t(', or drag and drop a file into the upload area.'),
      ],
      [t('Pick one site or file, following the prompts in the pop-up.')],
      [
        t('In the '),
        ui('Description'),
        t(' box, write a clear description of the source so the agent picks it correctly.'),
      ],
      [t('Select '), ui('Add'), t(' to finish adding the source.')],
      [
        t('If the '),
        ui('test pane'),
        t(' is closed, select '),
        ui('Test'),
        t(' in the top right corner of the page to open it.'),
      ],
      [t('In the '), ui('test pane'), t(', ask five questions, one at a time.')],
      [
        t('Under each answer, select the reference link to check the '),
        kw('citation', 'citation'),
        t(' and confirm the answer came from your knowledge source.'),
      ],
    ]),
    watchOuts: [
      'Always check the source — verify a citation actually backs up the answer before you trust it.',
      'Descriptions are a skill — the agent routes by reading your description of each knowledge source, so write it like you mean it.',
    ],
    screenshots: m3Screenshots,
    tryIt:
      'Add one SharePoint site or file to your practice agent. Ask five questions and verify the citations point where you expect.',
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio',
        label: 'Knowledge sources overview',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-sharepoint',
        label: 'Add SharePoint',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-file-upload',
        label: 'Upload a file',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-public-website',
        label: 'Add a public website',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-test',
        label: 'Test knowledge sources',
      },
    ]),
    checklist: [
      'Added one SharePoint site or file as a knowledge source',
      'Wrote a clear description for the source',
      'Asked five questions and got answers with citations',
      'Checked that each citation points where I expect',
      'Know when to switch off the "use general knowledge" toggle',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 4
  // -------------------------------------------------------------------------
  {
    id: 4,
    harness: 'standard',
    slug: 'build-topics',
    title: 'Build topics',
    whyItMatters:
      'When a conversation must follow a script, like collecting details for a request, topics give you full control.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Topic Designer',
    diagram: 'fig4',
    concept: [
      para([
        t('When a conversation must follow a script, like collecting details for a request, '),
        kw('topics', 'topic'),
        t(' give you full control.'),
      ]),
      list([
        [t('What a '), kw('topic', 'topic'), t(' is: a scripted conversation path with a trigger')],
        [
          t('Trigger phrases (classic) vs '),
          kw('topic', 'topic'),
          t(' descriptions (generative '),
          kw('orchestration', 'orchestration'),
          t(')'),
        ],
        [t('The three everyday nodes: message, question, condition')],
        [
          kw('Variables', 'variable'),
          t(' in plain terms: the '),
          kw('agent', 'agent'),
          t(' remembering what the user told it'),
        ],
        [
          t('System '),
          kw('topics', 'topic'),
          t(' like greeting, fallback, and escalate, and when to customize them'),
        ],
      ]),
    ],
    buildSteps: buildSteps(4, [
      openPracticeAgent(),
      [t('Select the '), ui('Topics'), t(' tab in the row of tabs along the top of the page.')],
      // VERIFY IN UI
      verifyStep([
        t("Select '"),
        ui('+ New topic'),
        t("', give it a name, and add a short description."),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'The topic opens on the authoring canvas. Find the Trigger node at the top, and the small ',
        ),
        ui('+'),
        t(' (Add node) button on the line just below it.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Select the '),
        ui('+'),
        t(' button below the Trigger node, then select '),
        ui('Ask a question'),
        t('.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'In the new Question node, type your question in the message box, for example "Which system do you need help with?"',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Under '),
        ui('Identify'),
        t(', select the answer type, for example '),
        ui('Multiple choice options'),
        t('.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Select '),
        ui('+ New option'),
        t(' and type each answer the user can pick, for example "Outlook" and "Teams".'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Under '),
        ui('Save user response as'),
        t(', select the variable name and rename it to something clear, like SystemName.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Select the '),
        ui('+'),
        t(' button below the Question node, then select '),
        ui('Add a condition'),
        t('. The canvas splits into two branches.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('In the left branch (Condition), select '),
        ui('Select a variable'),
        t(' and choose the variable you just saved.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Set the comparison to '),
        ui('is equal to'),
        t(' and pick a value, for example "Outlook".'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Under the left branch, select '),
        ui('+'),
        t(', then select '),
        ui('Send a message'),
        t(' and type the answer for that choice.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Under the right branch ('),
        ui('All other conditions'),
        t('), select '),
        ui('+'),
        t(', then select '),
        ui('Topic management'),
        t(' > '),
        ui('Go to another topic'),
        t(' > '),
        ui('Escalate'),
        t('.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'To change how the topic starts, select the Trigger node at the top of the canvas, select its ',
        ),
        ui('…'),
        t(' (More) menu, then select '),
        ui('Change trigger'),
        t(' and pick the trigger type you need.'),
      ]),
      // VERIFY IN UI
      verifyStep([t('Select '), ui('Save'), t(' in the top right corner of the canvas.')]),
      [
        t('Select '),
        ui('Test'),
        t(' in the top right corner to open the '),
        ui('test pane'),
        t(', then type a message that should start your topic, and try both branches.'),
      ],
    ]),
    watchOuts: [
      'Descriptions are a skill — write trigger phrases and topic descriptions like you mean it, since the agent routes by reading them.',
    ],
    screenshots: m4Screenshots,
    tryIt:
      'Build one topic with a question and a two-way branch, for example: answer FAQs from knowledge, or offer to escalate.',
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics',
        label: 'Create and edit topics',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-authoring',
        label: 'Create topics with Copilot',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers',
        label: 'Topic triggers',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables',
        label: 'Work with variables',
      },
    ]),
    checklist: [
      'Built one topic with a question node',
      'Added a condition node that branches two ways',
      'Tested the topic end-to-end in the test pane',
      'Can explain the difference between trigger phrases and topic descriptions',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 5
  // -------------------------------------------------------------------------
  {
    id: 5,
    harness: 'standard',
    slug: 'add-tools',
    title: 'Add tools',
    whyItMatters:
      'Tools let your agent do things, not just talk: look up records, send emails, kick off approvals.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Toolsmith',
    diagram: 'fig5',
    concept: [
      para([
        t('Tools let your '),
        kw('agent', 'agent'),
        t(' do things, not just talk: look up records, send emails, kick off approvals.'),
      ]),
      list([
        [
          t('What a '),
          kw('tool', 'tool'),
          t(' is: an action the '),
          kw('agent', 'agent'),
          t(' can take on your behalf'),
        ],
        [
          kw('Connectors', 'connector'),
          t(': ready-made bridges to systems like Outlook, SharePoint, and Dataverse'),
        ],
        [t('Prompts as reusable AI instructions, and adding a prompt as a '), kw('tool', 'tool')],
        [kw('Agent', 'agent'), t(' flows for multi-step automation, awareness level')],
        [
          t('Why the '),
          kw('tool', 'tool'),
          t("'s description decides whether the "),
          kw('agent', 'agent'),
          t(' picks it at the right moment'),
        ],
      ]),
    ],
    buildSteps: buildSteps(5, [
      openPracticeAgent(),
      [t('Select the '), ui('Tools'), t(' tab in the row of tabs along the top of the page.')],
      [
        t('Select '),
        ui('Add a tool'),
        t('. A pop-up opens with a search box and a list of tools.'),
      ],
      [t('In the search box at the top of the pop-up, type '), ui('Outlook'), t('.')],
      [
        t('Select an Office 365 Outlook action from the results, for example '),
        ui('Send an email (V2)'),
        t('.'),
      ],
      [
        t('Look at the '),
        ui('Connection'),
        t(
          ' area in the pop-up. If it shows a sign-in prompt instead of a green check mark, select ',
        ),
        ui('Sign in'),
        t(' (or '),
        ui('Create new connection'),
        t(').'),
      ],
      [
        t(
          'In the sign-in window that opens, select your work account and accept any permission prompt.',
        ),
      ],
      [
        t('Back in the pop-up, confirm the connection now shows a green check mark, then select '),
        ui('Add and configure'),
        t('.'),
      ],
      // VERIFY IN UI
      verifyStep([
        t("The tool's Details page opens. The "),
        ui('Description'),
        t(
          ' field is in the Details section, just below Name. To get back here later, open the Tools tab and select the tool name.',
        ),
      ]),
      [
        t('In the '),
        ui('Description'),
        t(' field, write a clear description so the agent knows when to use the tool.'),
      ],
      [t('Select '), ui('Save'), t(' in the top right corner of the page.')],
      [
        t('Select '),
        ui('Test'),
        t(
          ' in the top right corner to open the test pane, then ask the agent to do the task, for example "Send me an email with a summary of our chat."',
        ),
      ],
      [
        t('If the '),
        ui('test pane'),
        t(' asks for permission to use your connection, select '),
        ui('Allow'),
        t(', then confirm the tool ran.'),
      ],
    ]),
    watchOuts: [
      "The tool's description decides whether the agent picks it at the right moment — a vague description means a missed tool.",
    ],
    screenshots: m5Screenshots,
    tryIt: 'Add one connector-based tool to your practice agent and trigger it from the test pane.',
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent',
        label: 'Add tools to custom agents',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors',
        label: 'Use connectors',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/draft-with-copilot',
        label: 'Create prompts with Copilot',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-prompt-node',
        label: 'Create a prompt as a tool',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-nl',
        label: 'Build an agent flow with natural language',
      },
    ]),
    checklist: [
      'Added one connector-based tool to my practice agent',
      'Wrote a clear description so the agent knows when to use it',
      'Triggered the tool from the test pane and saw it run',
      'Can explain the difference between a connector, a prompt tool, and an agent flow',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 6
  // -------------------------------------------------------------------------
  {
    id: 6,
    harness: 'standard',
    slug: 'work-with-multiple-agents',
    title: 'Work with multiple agents',
    whyItMatters:
      'One giant do-everything agent gets messy. Specialists with clear jobs are easier to build, test, and trust.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Team Orchestrator',
    diagram: 'fig6',
    concept: [
      para([
        t(
          'One giant do-everything agent gets messy. Specialists with clear jobs are easier to build, test, and trust.',
        ),
      ]),
      list([
        [
          kw('Child agents', 'child-agent'),
          t(': specialists that live inside your '),
          kw('agent', 'agent'),
        ],
        [
          t('Connecting to an existing '),
          kw('Copilot Studio agent', 'connected-agent'),
          t(' someone else built'),
        ],
        [t('Writing descriptions so the parent always routes to the right specialist')],
        [
          kw('MCP', 'mcp'),
          t(' servers, awareness level: a standard plug for external '),
          kw('tools', 'tool'),
        ],
      ]),
    ],
    buildSteps: buildSteps(6, [
      openPracticeAgent(),
      [t('Select the '), ui('Agents'), t(' tab in the row of tabs along the top of the page.')],
      // VERIFY IN UI
      verifyStep([t('Select '), ui('+ New agent'), t(', then select '), ui('Child agent'), t('.')]),
      verifyStep(
        [t('Fill in the Details section at the top of the new child agent page.')],
        [
          // VERIFY IN UI
          sub([t('In '), ui('Name'), t(', enter a short name for the child agent.')], true),
          // VERIFY IN UI
          sub(
            [
              t('Under '),
              ui('When will this be used?'),
              t(', select '),
              ui('The agent chooses - Based on description'),
              t('.'),
            ],
            true,
          ),
          // VERIFY IN UI
          sub(
            [
              t('In '),
              ui('Description'),
              t(', write one crisp line about the child agent’s narrow job. It is required.'),
            ],
            true,
          ),
        ],
      ),
      verifyStep(
        [t('Use the side menu on the left of the child agent page to add the rest.')],
        [
          // VERIFY IN UI
          sub(
            [
              t('Select '),
              ui('Instructions'),
              t(' and describe what this agent does, its tone, and its rules.'),
            ],
            true,
          ),
          // VERIFY IN UI
          sub(
            [
              t('Select '),
              ui('Knowledge'),
              t(', then '),
              ui('+ Add'),
              t(', and add only the knowledge this child agent needs.'),
            ],
            true,
          ),
          // VERIFY IN UI
          sub(
            [
              t('Select '),
              ui('Tools'),
              t(', then '),
              ui('+ Add'),
              t(', and add the tools it needs.'),
            ],
            true,
          ),
          // VERIFY IN UI
          sub(
            [
              t('Select '),
              ui('Inputs'),
              t(
                ' and add any details the child agent needs from the parent, for example the user’s question.',
              ),
            ],
            true,
          ),
          // VERIFY IN UI
          sub(
            [
              t('For each tool, open it and scroll to '),
              ui('Completion'),
              t(' to choose what the agent does when it finishes using the tool.'),
            ],
            true,
          ),
        ],
      ),
      [t('Select '), ui('Save'), t(' in the top right corner of the page.')],
      [
        t('Select '),
        ui('Test'),
        t(' in the top right corner, then ask a question in the '),
        ui('test pane'),
        t(' that should route to the child agent, and watch what happens.'),
      ],
    ]),
    watchOuts: [
      'Write descriptions so the parent always routes to the right specialist — a vague description means the wrong child agent answers.',
    ],
    screenshots: m6Screenshots,
    tryIt:
      'Add one child agent with a narrow job and a crisp description. Ask a question that should route to it and watch what happens.',
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents',
        label: 'Add other agents overview',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-child-agent',
        label: 'Add a child agent',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-copilot-studio-agent',
        label: 'Connect to an existing Copilot Studio agent',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp',
        label: 'MCP in Copilot Studio',
      },
    ]),
    checklist: [
      'Added one child agent with a narrow job',
      'Wrote a crisp, one-line description for the child agent',
      'Asked a question that routed to the child agent',
      'Can explain what an MCP server is, at an awareness level',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 7
  // -------------------------------------------------------------------------
  {
    id: 7,
    harness: 'standard',
    slug: 'settings-orchestration-and-models',
    title: 'Settings, orchestration & models',
    whyItMatters:
      'The Settings page is where the agent\'s "brain" is configured. Understand it so defaults are a choice, not an accident.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Model Steward',
    diagram: 'fig7',
    concept: [
      para([
        t(
          'The Settings page is where the agent\'s "brain" is configured. Understand it so defaults are a choice, not an accident.',
        ),
      ]),
      list([
        [
          t('Generative '),
          kw('orchestration', 'orchestration'),
          t(' vs classic '),
          kw('orchestration', 'orchestration'),
          t(', and what changes when you flip it'),
        ],
        [
          kw('Agent', 'agent'),
          t(' instructions: the standing guidance your '),
          kw('agent', 'agent'),
          t(' always follows'),
        ],
        [
          t('Picking a primary '),
          kw('model', 'model'),
          t(' from the dropdown: the trade-off is reasoning depth vs speed vs cost'),
        ],
        [
          t('Separate '),
          kw('model', 'model'),
          t(' settings for '),
          kw('orchestration', 'orchestration'),
          t(', generative responses, deep reasoning, and prompts'),
        ],
        [
          t('Preview and experimental '),
          kw('model', 'model'),
          t(
            ' tags: fine to explore, never for production, and your admin controls whether they appear at all',
          ),
        ],
        [t('Content moderation and the general-knowledge toggle')],
        [t('Authentication, awareness level: who is allowed to use the '), kw('agent', 'agent')],
      ]),
    ],
    buildSteps: buildSteps(7, [
      openPracticeAgent(),
      [t('Select '), ui('Settings'), t(' in the top right corner of the page, next to Publish.')],
      [
        t('In the Settings menu on the left, select '),
        ui('Generative AI'),
        t(' to find the orchestration section.'),
      ],
      [t('Write down the current orchestration mode (generative vs classic) without changing it.')],
      [
        t('Go back to the Overview page. Close Settings, then select '),
        ui('Overview'),
        t(' in the row of tabs along the top of the page.'),
      ],
      [
        t('Open the model dropdown. It sits under '),
        ui('Select your agent’s model'),
        t(', below the Details card.'),
      ],
      [
        t('Note the primary model and any '),
        ui('Preview'),
        t(' or '),
        ui('Experimental'),
        t(' tags.'),
      ],
      [t('Close the dropdown without changing the model.')],
    ]),
    watchOuts: [
      'Preview means not for production — preview and experimental model tags are fine to explore, but stay out of anything real.',
      'Your admin controls whether preview models appear at all — do not assume they are available everywhere.',
    ],
    screenshots: m7Screenshots,
    tryIt:
      "Open Settings on your practice agent. Write down (don't change) the current orchestration mode and model. That's your production-safe baseline.",
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions',
        label: 'Orchestrate behavior with generative AI',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model',
        label: 'Select a primary AI model',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-preview-model',
        label: 'Preview models for generative responses',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/prompt-model-settings',
        label: 'Prompt builder model settings',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication',
        label: 'Configure end-user authentication',
      },
    ]),
    checklist: [
      'Opened Settings on my practice agent',
      'Wrote down the current orchestration mode without changing it',
      'Wrote down the current primary model without changing it',
      'Can point out any preview or experimental tags',
      'Know who controls whether preview models are allowed',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 8
  // -------------------------------------------------------------------------
  {
    id: 8,
    harness: 'standard',
    slug: 'test-activity-and-evaluation',
    title: 'Test, activity & evaluation',
    whyItMatters:
      '"It seemed fine when I tried it" is not testing. A repeatable test set is how you know the agent actually works.',
    estimatedMinutes: '45–60 min',
    badgeName: 'Test Pilot',
    diagram: 'fig8',
    concept: [
      para([
        t(
          '"It seemed fine when I tried it" is not testing. A repeatable test set is how you know the agent actually works.',
        ),
      ]),
      list([
        [
          t('Using the '),
          ui('test pane'),
          t(', and tracking which '),
          kw('topic', 'topic'),
          t(' is running'),
        ],
        [
          t('Reading the activity map: which knowledge, '),
          kw('tools', 'tool'),
          t(', and '),
          kw('topics', 'topic'),
          t(' the '),
          kw('agent', 'agent'),
          t(' picked and why'),
        ],
        [
          t('Creating a '),
          kw('test set', 'test-set'),
          t(': real questions paired with expected answers'),
        ],
        [t('Choosing '), kw('evaluation', 'evaluation'), t(' methods and reading the results')],
        [t('The improvement loop: fix descriptions and instructions, re-run, compare')],
      ]),
    ],
    buildSteps: buildSteps(8, [
      openPracticeAgent(),
      [
        t('Select '),
        ui('Test'),
        t(' in the top right corner to open the '),
        ui('test pane'),
        t(', and ask your agent one question.'),
      ],
      // VERIFY IN UI
      verifyStep([
        t('Select the '),
        ui('Activity'),
        t(' tab in the row of tabs along the top of the page.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Select your test conversation at the top of the list to open its activity map.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Read the activity map from top to bottom. Each step shows which knowledge, tool, or topic the agent used for the answer, and why.',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Select the '),
        ui('Evaluation'),
        t(' tab in the row of tabs along the top of the page.'),
      ]),
      // VERIFY IN UI
      verifyStep([t('Select '), ui('+ New test set'), t('.')]),
      // VERIFY IN UI
      verifyStep([t('Enter a '), ui('Name'), t(' for the test set.')]),
      // VERIFY IN UI
      verifyStep([t('Enter a '), ui('Description'), t(' that says what the test set checks.')]),
      // VERIFY IN UI
      verifyStep([
        t('Add 10 real user questions, each with the answer you expect, then select '),
        ui('Save'),
        t('.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Choose an evaluation method, then select '),
        ui('Evaluate'),
        t(' to start the run.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Wait until the run shows as complete, then select the run to open its results.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Read the results question by question, and open your worst-scoring answer to see why it failed.',
        ),
      ]),
      [t('Fix the description or instructions behind it, then re-run the test set and compare.')],
    ]),
    watchOuts: [
      'Nothing ships untested — evaluation before publishing, every time. A 10-question test set is the minimum bar.',
    ],
    screenshots: [],
    screenshotsToCapture: m8ScreenshotsToCapture,
    tryIt:
      'Write a 10-question test set from real user questions, run an evaluation, and fix your worst-scoring answer.',
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot',
        label: 'Test your agent',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-create',
        label: 'Create test sets',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-overview',
        label: 'Choose evaluation methods',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-results',
        label: 'Run tests and view results',
      },
    ]),
    checklist: [
      'Wrote a 10-question test set from real user questions',
      'Ran an evaluation and read the results',
      'Found my worst-scoring answer',
      'Fixed a description or instruction and re-ran the test',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 9
  // -------------------------------------------------------------------------
  {
    id: 9,
    harness: 'standard',
    slug: 'monitor-and-improve',
    title: 'Monitor & improve',
    whyItMatters:
      "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy and improving.",
    estimatedMinutes: '45–60 min',
    badgeName: 'Pulse Checker',
    diagram: 'fig9',
    concept: [
      para([
        t(
          "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy and improving.",
        ),
      ]),
      list([
        [
          t('Reading the analytics summary: sessions, engagement, resolution, '),
          kw('escalation', 'escalation'),
        ],
        [t('Turning analytics into fixes for conversational '), kw('agents', 'agent')],
        [t('Autonomous '), kw('agent', 'agent'), t(' health, where it applies')],
        [t('A simple weekly ritual: what to check, what "bad" looks like, who to tell')],
      ]),
    ],
    buildSteps: buildSteps(9, [
      [
        t('Check that the '),
        ui('globe icon'),
        t(' in the bottom left corner shows the environment of a published agent. Then select '),
        ui('Agents'),
        t(' in the left navigation, and select that agent. Its Overview page opens.'),
      ],
      // VERIFY IN UI
      verifyStep([
        t('In the row of tabs along the top of the page, select '),
        ui('+2'),
        t(' at the right end to show the hidden tabs.'),
      ]),
      // VERIFY IN UI
      verifyStep([t('Select '), ui('Analytics'), t('. The analytics summary opens.')]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Use the date range picker in the top right corner of the Analytics page to choose the last 7 days.',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Review the sessions, engagement, resolution, and escalation numbers in the summary cards.',
        ),
      ]),
      [t('Name one thing you would improve based on what you see.')],
    ]),
    watchOuts: [
      "Publishing isn't the finish line — a 15-minute weekly review keeps a live agent healthy.",
    ],
    screenshots: [],
    screenshotsToCapture: m9ScreenshotsToCapture,
    tryIt:
      "Open the analytics page of any live agent and name one thing you'd improve based on what you see.",
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-summary',
        label: 'Analytics summary',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-improve-agent-effectiveness',
        label: 'Improve conversational agent effectiveness',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-improve-agent-health',
        label: 'Analyze autonomous agent health',
      },
    ]),
    checklist: [
      'Opened the Analytics summary page of a live or demo agent',
      'Read sessions, engagement, resolution, and escalation numbers',
      "Named one thing I'd improve based on the data",
      'Know what a 15-minute weekly review should cover',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 10
  // -------------------------------------------------------------------------
  {
    id: 10,
    harness: 'standard',
    slug: 'channels-and-publishing',
    title: 'Channels & publishing',
    whyItMatters:
      "Nothing is live until you press Publish. That's a feature: it means you decide exactly when users see changes.",
    estimatedMinutes: '45–60 min',
    badgeName: 'Ship It',
    diagram: 'fig10',
    concept: [
      para([
        t(
          "Nothing is live until you press Publish. That's a feature: it means you decide exactly when users see changes.",
        ),
      ]),
      list([
        [
          t('The '),
          kw('publish', 'publish'),
          t(' model: changes stay in '),
          kw('draft', 'draft'),
          t(' until you '),
          kw('publish', 'publish'),
          t(', on purpose'),
        ],
        [kw('Channels', 'channel'), t(': demo website, live website, Teams and Microsoft 365')],
        [t('Using the demo website for stakeholder review before broad rollout')],
        [t('Teams and M365 deployment, including the admin approval step')],
        [t('Single sign-on, awareness level')],
        [
          t('The pre-publish checklist, in order: right '),
          kw('environment', 'environment'),
          t(', knowledge verified, '),
          kw('evaluation', 'evaluation'),
          t(' passed, right '),
          kw('channel', 'channel'),
        ],
      ]),
      {
        type: 'table',
        caption: 'Channels and their role in rollout',
        headers: ['Channel', 'Role in rollout'],
        rows: [
          ['Demo website', 'Share with stakeholders for review before broad rollout.'],
          ['Live website', 'The public-facing channel once the agent is ready to go live.'],
          [
            'Teams & Microsoft 365',
            'Deploy where people already work; requires an admin approval step.',
          ],
        ],
      },
    ],
    buildSteps: buildSteps(10, [
      [
        t(
          'Run through the pre-publish checklist, in order: right environment, knowledge verified, evaluation passed, right channel.',
        ),
      ],
      openPracticeAgent(),
      // VERIFY IN UI
      verifyStep([
        t('Select '),
        ui('Publish'),
        t(' in the top right corner of the page, next to Settings.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('In the confirmation box, select '),
        ui('Publish'),
        t(' again, and wait for the message that says publishing finished.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('In the row of tabs along the top of the page, select '),
        ui('+2'),
        t(' at the right end, then select '),
        ui('Channels'),
        t('.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('On the Channels page, select the '),
        ui('Demo website'),
        t(
          ' tile. If it is not listed, publish your agent first. If it is still missing after publishing, the channel may be turned off in your environment, so ask your admin.',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'In the panel that opens on the right, copy the demo website link, then open it in a new browser tab to check it works.',
        ),
      ]),
      [t('Send the demo website link to a classmate for feedback.')],
    ]),
    watchOuts: [
      'Nothing is live until you press Publish — changes stay in draft on purpose, so you decide exactly when users see them.',
      'Run the pre-publish checklist first, in order: right environment, knowledge verified, evaluation passed, right channel.',
      'Use the demo website for stakeholder review before broad rollout.',
    ],
    screenshots: [],
    screenshotsToCapture: m10ScreenshotsToCapture,
    tryIt:
      "Publish your practice agent to the demo website and send the link to a classmate for feedback. Congratulations, you've shipped an agent.",
    goDeeper: goDeeper([
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels',
        label: 'Publish and deploy key concepts',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-web-channels',
        label: 'Publish to a live or demo website',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams',
        label: 'Connect an agent to Teams and Microsoft 365',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/microsoft-365-copilot-extend-with-agents',
        label: 'Extend Microsoft 365 Copilot with agents',
      },
    ]),
    checklist: [
      'Completed the pre-publish checklist',
      'Published my practice agent',
      'Opened the Demo website channel and copied its link',
      'Sent the demo link to a classmate for feedback',
    ],
  },
]

export function getModuleById(id: number): Module | undefined {
  return modules.find((m) => m.id === id)
}
