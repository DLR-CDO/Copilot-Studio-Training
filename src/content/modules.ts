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
  /** Set for steps added after launch, so saved progress on positional ids stays aligned. */
  id?: string
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
  let position = 0
  return steps.map((step) => {
    const def = Array.isArray(step) ? { tokens: step } : step
    const id = def.id ?? `m${moduleNum}-step-${(position += 1)}`
    return { ...def, id }
  })
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
  lede: "A step-by-step path for business users. You'll build one practice agent step by step, and by the last module you'll publish it for real. Every source is official Microsoft documentation.",
}

// ---------------------------------------------------------------------------
// Screenshots. `authorNotes` and `screenshotsToCapture` are for course authors and are never
// rendered. A screenshot is only listed once its image exists under public/.
// ---------------------------------------------------------------------------

const m1Screenshots: Screenshot[] = [
  {
    id: 'm1-shot-1',
    src: 'screenshots/1-1.png',
    width: 1024,
    height: 463,
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
    width: 936,
    height: 528,
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
    width: 1024,
    height: 463,
    alt: 'The Add knowledge dialog with a file upload area and tiles for featured sources such as Public websites, SharePoint and Dataverse.',
    caption:
      'The Add knowledge dialog for AI Enablement Assistant (CDO - DEV), showing upload, SharePoint, and featured source options.',
    authorNotes: 'Annotate: highlight SharePoint / file upload as the everyday starting sources',
    capturedAt: '2026-08-04',
  },
  {
    id: 'm3-shot-2',
    src: 'images/03-test-pane-sources.png',
    width: 936,
    height: 546,
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
    width: 1024,
    height: 463,
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
    width: 936,
    height: 532,
    alt: 'A connector tool’s Details page with the Description field highlighted and labeled “this is how the agent decides”.',
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
    width: 936,
    height: 522,
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
    width: 936,
    height: 534,
    alt: 'The agent Overview page with the “Select your agent’s model” dropdown below the description.',
    caption: 'The model dropdown on the Overview page, under "Select your agent’s model".',
    authorNotes: "Annotate: model choice sits next to instructions — this is the agent's brain",
    capturedAt: '2026-11-16',
  },
  {
    id: 'm7-shot-2',
    src: 'images/07-model-dropdown-2.png',
    width: 936,
    height: 534,
    alt: 'The model dropdown open, listing models with Preview and Experimental tags circled and labeled “not for production”.',
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

const m10ScreenshotsToCapture: ScreenshotRequest[] = [
  {
    id: 'm10-shot-1',
    caption:
      'The Monitor page of a published agent, showing sessions, engagement, resolution, and escalation.',
    authorNotes:
      'Capture: the Monitor summary for the last 7 days of a published agent. Annotate: circle the resolution rate and the escalation rate.',
  },
]

const m9ScreenshotsToCapture: ScreenshotRequest[] = [
  {
    id: 'm9-shot-1',
    caption:
      'The Channels page after publishing, showing the Demo website tile alongside Teams + Microsoft 365 and the other channel tiles.',
    authorNotes:
      'Capture: the full Channels page of your published practice agent. Annotate: circle the Demo website tile with "start here for stakeholder review". public/screenshots/10-1.png exists but shows a colleague’s name in “Published by”; recapture or blur before use.',
  },
  {
    id: 'm9-shot-2',
    caption: 'The demo website open in a browser, with the agent answering a test question.',
    authorNotes:
      'Capture: the demo website after you ask one question. Annotate: point to the browser address bar with "share this demo link for feedback before going live".',
  },
]

/** Access to request before Module 1, so a business user does not get stuck mid-course. */
export const BEFORE_YOU_START: { item: string; neededFor: string }[] = [
  {
    item: 'A Copilot Studio user license. A trial lets you build and test, but it cannot publish an agent.',
    neededFor: 'All modules; publishing in Module 9',
  },
  {
    item: 'Access to a DEV environment where you can create agents.',
    neededFor: 'Module 1 onwards',
  },
  {
    item: 'Permission to create solutions in that DEV environment, in Power Apps under Solutions. Your Power Platform admin knows which security role gives this.',
    neededFor: 'Module 1',
  },
  {
    item: 'The Office 365 Outlook connector allowed by the data policy for DEV.',
    neededFor: 'Module 5',
  },
  {
    item: 'Publishing and the Demo website channel allowed in DEV. The demo website needs the No authentication sign-in option, which some data policies turn off.',
    neededFor: 'Modules 9 and 10',
  },
]

/** What must never go into a practice agent's instructions, knowledge, or test questions. */
export const PRACTICE_DATA_RULE =
  'Never put confidential data into a practice agent: no customer or employee personal data, financial results, contracts, passwords or keys, or anything labeled confidential. Use made-up or already-public content in instructions, knowledge files, and test questions.'

/** In dependency order: each check relies on the one before it. */
export const PRE_PUBLISH_CHECKS = [
  'Right environment: you are publishing the right agent, from the right environment',
  'Knowledge verified: the sources are current and citations point where you expect',
  'Evaluation passed: your test set runs clean on the latest version',
  'Sign-in checked: you know who will be able to chat with the agent, and nothing in it is unsafe for them to see',
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
    estimatedMinutes: 60,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t(' + '),
          kw('instructions', 'instructions'),
          t(' + knowledge + '),
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
        [
          t('Licensing basics and '),
          kw('Copilot Credits', 'copilot-credits'),
          t(', the billing unit for agents (awareness only)'),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [
          t(
            'On September 1, 2025, Copilot Credits replaced messages as the billing unit for agents. Prepaid pack quantities and the pay-as-you-go rate did not change.',
          ),
        ],
      ]),
    ],
    buildSteps: buildSteps(1, [
      // VERIFY IN UI
      {
        id: 'm1-step-harness',
        verify: true,
        tokens: [
          t('Check which '),
          kw('harness', 'harness'),
          t(
            ' you are on. This course teaches the standard harness, which follows the topics and rules you define. Agents on the Microsoft Copilot harness look and work differently, so if your screens do not match the steps here, check the harness first.',
          ),
        ],
      },
      [
        t(
          'Before you do anything, make sure you are in the correct environment, which is the DEV environment. Do not do anything until it is selected. To change it, click the ',
        ),
        ui('globe icon'),
        t(' in the bottom left corner, above your name, and select the DEV environment.'),
      ],
      {
        id: 'm1-step-solution',
        tokens: [
          t(
            'Create the solution that will store your agent. You do this once, in Power Apps, before you create the agent.',
          ),
        ],
        substeps: [
          sub([
            t('Open a new browser tab, go to '),
            ui('make.powerapps.com'),
            t(', and sign in with your work account.'),
          ]),
          sub(
            [
              t(
                'Check that the environment name in the top right corner shows DEV. If not, select it and switch to DEV.',
              ),
            ],
            true,
          ),
          sub([
            t('In the left navigation, select '),
            ui('Solutions'),
            t(', then select '),
            ui('+ New solution'),
            t('.'),
          ]),
          sub([
            t('Enter a '),
            ui('Display name'),
            t(', pick a '),
            ui('Publisher'),
            t(', and leave the other fields as they are.'),
          ]),
          sub([t('Select '), ui('Create'), t(', then go back to the Copilot Studio tab.')]),
        ],
      },
      // VERIFY IN UI
      verifyStep([
        t('On the home screen, select '),
        ui('Other ways to build'),
        t(', then select '),
        ui('Agent (standard)'),
        t('.'),
      ]),
      {
        tokens: [t('Name your agent and put it in your solution.')],
        substeps: [
          sub([t('In the '), ui('Name'), t(' box, enter a name for your agent.')]),
          sub([
            t(
              'Expand the agent settings below the name, and select the language your agent will speak. Leave the schema name as it is.',
            ),
          ]),
          sub([t('Under '), ui('Solution'), t(', select the solution you just created.')], true),
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
              ' and drag one small practice file into the pop-up, for example a made-up FAQ document. Use only made-up or already-public content (see Watch out). Module 3 covers SharePoint and OneDrive.',
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
    watchOuts: [PRACTICE_DATA_RULE],
    tips: [
      'One agent, built progressively: every module adds a layer to the same practice agent. You publish it in Module 9 and watch how it is used in Module 10.',
      'Licensing and Copilot Credits are awareness only for now. There is nothing to configure yet.',
      'Ask early, ask often: if a step does not match your screen, email the agent support team (see Help at the top of the page). Screens change, and your question helps fix the course for the next group.',
    ],
    screenshots: m1Screenshots,
    tryIt:
      "Create your first agent in the DEV environment, inside a new solution. Add a description, instructions, and one practice knowledge file, then ask it three questions in the test pane. That's it, you've built an agent.",
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
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview',
        label: 'Harnesses overview',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions',
        label: 'Licensing and subscriptions',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing',
        label: 'Billing and Copilot Credits',
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
    estimatedMinutes: 15,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t(': '),
          kw('data policies (DLP)', 'data-policy'),
          t(', and whether preview AI '),
          kw('models', 'model'),
          t(' are allowed'),
        ],
        [
          t(
            'Which knowledge sources makers can add, and whether people must sign in to use agents',
          ),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [
          t(
            'Since October 2026, admins can restrict file uploads, SharePoint and OneDrive, or public websites as knowledge sources in the Power Platform admin center, separately or together. If an option is missing from your Add knowledge pop-up, this is the likely reason.',
          ),
        ],
        [
          t(
            'When a data policy requires authentication, your agents cannot use the No authentication option.',
          ),
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
          'Note what your admin controls here: data policies, whether preview AI models are allowed, which knowledge source types you can add, and whether sign-in is required.',
        ),
      ],
    ]),
    watchOuts: [
      "Environments come first: always confirm you're in DEV before touching anything. It's the check that prevents the most painful mistakes.",
    ],
    tips: [
      'Work flows one direction: DEV, then Test, then Production. You never build directly in Production.',
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
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication',
        label: 'Authentication and data policies',
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
    estimatedMinutes: 40,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
        [
          t(
            'Allow ungrounded responses (older screens: use general knowledge): whether the agent may answer from the AI model’s general knowledge when your sources have no answer, and when to switch it off',
          ),
        ],
        [
          t(
            'Web search is a different feature from a public website source: web search looks across the whole public web, while a public website source searches only the sites you name',
          ),
        ],
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
            'Answer from specific public sites you name, such as a vendor’s help pages. The agent searches only those sites.',
          ],
        ],
      },
    ],
    goodToKnow: [
      list([
        [
          t(
            'Other sources are available too: Dataverse tables, Azure SQL tables, Bing Custom Search, and enterprise data through connectors. Use them when the data your agent needs already lives there.',
          ),
        ],
        [t('OneDrive for Business supports Microsoft Purview sensitivity labels (October 2026).')],
        [
          t(
            'Limits apply: the agent searches a limited number of sources of each type, files have size limits, and in Teams an answer shows at most 20 citations. See the knowledge limits page in Go deeper before you plan a large agent.',
          ),
        ],
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
        t(
          '. You uploaded a file in Module 1; this time connect a source your team already uses, with content that is safe for a practice agent.',
        ),
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
      // VERIFY IN UI
      verifyStep([
        t('Select '),
        ui('Settings'),
        t(' in the top right corner, then select '),
        ui('Generative AI'),
        t(' and scroll to the '),
        ui('Knowledge'),
        t(' section.'),
      ]),
      // VERIFY IN UI
      verifyStep([
        t('Turn off '),
        ui('Allow ungrounded responses'),
        t(' (older screens: '),
        ui('Use general knowledge'),
        t(') so the agent answers only from your sources. Check that '),
        ui('Use information from the web'),
        t(' (web search) is off too, then select '),
        ui('Save'),
        t('.'),
      ]),
      [
        t(
          'Close Settings and ask the test pane a question your sources do not cover. The agent should say it does not know, instead of guessing.',
        ),
      ],
    ]),
    watchOuts: [
      'Always check the source: verify a citation actually backs up the answer before you trust it.',
      'Leave web search off for agents that handle internal information. It searches the whole public web, not just the sites you add.',
    ],
    tips: [
      'Descriptions are a skill: the agent picks a knowledge source by reading your description of it, so write it like you mean it.',
    ],
    screenshots: m3Screenshots,
    tryIt:
      'Add one SharePoint site or OneDrive file to your practice agent. Ask five questions and verify the citations point where you expect. Then turn off ungrounded responses and ask something your sources do not cover.',
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
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-unstructured-data#limits-and-limitations',
        label: 'Knowledge limits and limitations',
      },
    ]),
    checklist: [
      'Added one SharePoint site or OneDrive file as a knowledge source',
      'Wrote a clear description for the source',
      'Asked five questions and got answers with citations',
      'Checked that each citation points where I expect',
      'Turned off Allow ungrounded responses and saw the agent decline a question my sources do not cover',
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
    estimatedMinutes: 50,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
    goodToKnow: [
      list([
        [
          t(
            'Condition groups (June 2026) keep several conditions inside one Message, Question, or prompt node, so a topic needs fewer branches. Useful once your topics grow.',
          ),
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
      // VERIFY IN UI
      verifyStep([
        t('Go back to the '),
        ui('Topics'),
        t(' tab and select the '),
        ui('System'),
        t(
          ' filter. These built-in topics, like Conversation Start, Fallback, and Escalate, handle moments every agent has.',
        ),
      ]),
      [
        t('Open '),
        ui('Fallback'),
        t(
          ' and read what the agent says when it does not understand. Do not change it for now; customize system topics only when the default message does not fit your users.',
        ),
      ],
    ]),
    watchOuts: [],
    tips: [
      'Descriptions are a skill: write trigger phrases and topic descriptions like you mean it, since the agent routes by reading them.',
    ],
    screenshots: m4Screenshots,
    tryIt:
      'Build one topic that asks "Which system do you need help with?", answers when the user picks Outlook, and hands everything else to the Escalate topic.',
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
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-condition-groups',
        label: 'Use condition groups (advanced)',
      },
    ]),
    checklist: [
      'Built one topic with a question node',
      'Added a condition node that branches two ways',
      'Tested the topic end-to-end in the test pane',
      'Looked at the system topics, like Fallback and Escalate',
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
    estimatedMinutes: 35,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
        [
          t('Prompts as reusable AI instructions, and adding a prompt as a '),
          kw('tool', 'tool'),
          t(' (awareness only, no hands-on step)'),
        ],
        [
          kw('Agent', 'agent'),
          t(' flows for multi-step automation (awareness only, no hands-on step)'),
        ],
        [
          t(
            'Whose access a tool uses: each user’s own (End user credentials, the default) or yours (Maker-provided credentials)',
          ),
        ],
        [
          t('Why the '),
          kw('tool', 'tool'),
          t("'s description decides whether the "),
          kw('agent', 'agent'),
          t(' picks it at the right moment'),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [t('MCP servers can be added as tools: a standard plug for external services.')],
        [
          t(
            'Computer use (generally available since May 2026) lets the agent operate websites and desktop apps the way a person would, by clicking and typing in them. It acts in real apps on someone’s behalf, so try it only in DEV, with test accounts and test data.',
          ),
        ],
        [
          t(
            'On the Microsoft Copilot harness, workflows can also be added as tools (preview). This course uses the standard harness.',
          ),
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
      // VERIFY IN UI
      verifyStep([
        t('On the same page, check that '),
        ui('Authentication'),
        t(' is set to '),
        ui('End user credentials'),
        t(
          ' (the default). Maker-provided credentials would let anyone who chats with your agent act with your access.',
        ),
      ]),
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
      'Keep tools on End user credentials in a practice agent. With Maker-provided credentials, everyone who chats with the agent uses your access.',
    ],
    tips: [
      "The tool's description decides whether the agent picks it at the right moment. A vague description means a missed tool.",
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
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp',
        label: 'MCP servers as tools',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use',
        label: 'Computer use',
      },
    ]),
    checklist: [
      'Added one connector-based tool to my practice agent',
      'Wrote a clear description so the agent knows when to use it',
      'Checked that the tool uses End user credentials',
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
    estimatedMinutes: 45,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t(' someone else built (awareness only, no hands-on step)'),
        ],
        [t('Writing descriptions so the parent always routes to the right specialist')],
        [
          kw('MCP', 'mcp'),
          t(' servers as '),
          kw('tools', 'tool'),
          t(' (awareness only): a standard plug for external services, see Module 5'),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [
          t(
            'Connected agents can also be agents in Microsoft Foundry or agents built with the Microsoft 365 Agents SDK.',
          ),
        ],
        [
          t(
            'Agent2Agent (A2A) is a protocol for agents built outside Copilot Studio. It is generally available (April 2026); adding an A2A agent as a connected agent is in preview.',
          ),
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
    watchOuts: [],
    tips: [
      'Write descriptions so the parent always routes to the right specialist. A vague description means the wrong child agent answers.',
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
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-foundry-agent',
        label: 'Connect a Microsoft Foundry agent',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent',
        label: 'Connect an Agent2Agent (A2A) agent',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp',
        label: 'MCP servers as tools',
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
    estimatedMinutes: 25,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t(
            ' from the dropdown: the trade-off is reasoning depth vs speed vs cost. The list changes often, so check the dropdown instead of memorizing model names',
          ),
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
        [t('Content moderation, and the Allow ungrounded responses setting you met in Module 3')],
        [
          kw('Authentication', 'authentication'),
          t(': who is allowed to chat with the '),
          kw('agent', 'agent'),
          t('. You check it before sharing in Module 9'),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [
          t(
            'When Copilot Studio upgrades the default model, you can keep your current one for up to 30 days to test and migrate (October 2026).',
          ),
        ],
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
      'Preview means not for production: preview and experimental model tags are fine to explore, but stay out of anything real.',
    ],
    tips: [
      'Your admin controls whether preview models appear at all, so do not assume they are available everywhere.',
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
    estimatedMinutes: 50,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t('Reading the '),
          kw('activity map', 'activity-map'),
          t(': which knowledge, '),
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
        [
          t(
            'A test set is either single response (one question, one answer) or conversation (several turns)',
          ),
        ],
        [
          t(
            'Choosing test methods: start with General quality, and add Compare meaning when you have expected answers',
          ),
        ],
        [t('The improvement loop: fix descriptions and instructions, re-run, compare')],
      ]),
    ],
    goodToKnow: [
      para([
        t('Evaluation is generally available. These are all the test methods you can choose from:'),
      ]),
      {
        type: 'table',
        caption: 'Test methods',
        headers: ['Test method', 'What it checks', 'Test set type'],
        rows: [
          [
            'General quality',
            'How good the response is overall. Every test set starts with it.',
            'Single response or conversation',
          ],
          [
            'Compare meaning',
            'How closely the meaning matches your expected answer',
            'Single response',
          ],
          [
            'Text similarity',
            'How closely the wording matches your expected answer',
            'Single response',
          ],
          [
            'Exact match',
            'Whether the answer matches your expected answer exactly',
            'Single response',
          ],
          [
            'Keyword match',
            'Whether the answer uses the keywords or phrases you expect',
            'Single response or conversation',
          ],
          [
            'Tool use',
            'Whether the agent used the tools and resources you expect',
            'Single response',
          ],
          [
            'Content safety',
            'Whether the response contains harmful content',
            'Single response or conversation',
          ],
          [
            'Custom',
            'Whether the response meets criteria you write yourself',
            'Single response or conversation',
          ],
        ],
      },
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
        t('Select '),
        ui('Add test method'),
        t(
          '. Keep General quality, which scores how good each answer is overall, and add Compare meaning, which checks each answer against the one you expect. Set a pass score if a method asks for one, then select ',
        ),
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
    watchOuts: [],
    tips: [
      'Nothing ships untested: evaluation before publishing, every time. A 10-question test set is the minimum bar.',
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
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-multi-turn',
        label: 'Conversation (multi-turn) tests',
      },
    ]),
    checklist: [
      'Wrote a 10-question test set from real user questions',
      'Ran an evaluation with General quality and Compare meaning, and read the results',
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
    slug: 'channels-and-publishing',
    title: 'Channels & publishing',
    whyItMatters:
      "Nothing is live until you press Publish. That's a feature: it means you decide exactly when users see changes.",
    estimatedMinutes: 35,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
        [kw('Channels', 'channel'), t(': demo website, live website, Teams + Microsoft 365')],
        [t('Using the demo website for stakeholder review before broad rollout')],
        [
          kw('Sign-in', 'authentication'),
          t(
            ': the demo website only works with No authentication, which means anyone who has the link can chat with your agent. Check what your agent can reveal before you share the link',
          ),
        ],
        [
          t(
            'Teams + Microsoft 365: use Authenticate with Microsoft for sign-in, and submit the agent for admin approval to reach the whole organization',
          ),
        ],
        [t('Single sign-on, awareness level')],
        [
          t('The pre-publish checklist, in order: right '),
          kw('environment', 'environment'),
          t(', knowledge verified, '),
          kw('evaluation', 'evaluation'),
          t(' passed, sign-in checked, right '),
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
            'Teams + Microsoft 365',
            'Deploy where people already work. Use Authenticate with Microsoft, so people sign in with their work account. Organization-wide availability goes through admin approval.',
          ],
        ],
      },
    ],
    goodToKnow: [
      list([
        [
          t(
            'After admin approval, the agent appears under Built for your org in the Teams app store and Built by your org in the Microsoft 365 Agent Store.',
          ),
        ],
        [
          t(
            'Since October 23, 2026, new agents can no longer connect to WhatsApp through the Azure Communication Services channel. Agents connected before then keep working.',
          ),
        ],
        [t('MCP and Agent2Agent (A2A) channels let other tools and agents call yours (preview).')],
        [
          t(
            'A display name suffix tells the DEV, TEST, and production copies of an agent apart in Teams (preview).',
          ),
        ],
        [t('A privacy statement link can appear at the start of conversations (preview).')],
      ]),
    ],
    buildSteps: buildSteps(9, [
      [
        t(
          'Run through the pre-publish checklist, in order: right environment, knowledge verified, evaluation passed, sign-in checked, right channel.',
        ),
      ],
      openPracticeAgent(),
      verifyStep(
        [
          t('Check who will be able to chat with your agent. Select '),
          ui('Settings'),
          t(', then '),
          ui('Security'),
          t(', then '),
          ui('Authentication'),
          t('. The demo website needs '),
          ui('No authentication'),
          t(', so anyone who has the link can chat with your agent.'),
        ],
        [
          sub([
            t('Open the '),
            ui('Knowledge'),
            t(
              ' tab and remove any uploaded file that not everyone may read. Uploaded files answer anyone who chats. SharePoint and OneDrive sources only answer signed-in people, so they stay quiet on the demo website.',
            ),
          ]),
          sub([
            t('Open the '),
            ui('Tools'),
            t(
              ' tab and check every tool uses End user credentials, never Maker-provided. Otherwise people using your link act with your access.',
            ),
          ]),
          sub([t('Check the instructions and test questions too: '), t(PRACTICE_DATA_RULE)]),
          sub(
            [
              t('If all of that is safe, select '),
              ui('No authentication'),
              t(' and '),
              ui('Save'),
              t(
                '. If the option is grayed out, a data policy requires sign-in: skip the demo website and ask the agent support team how to share instead (see Help).',
              ),
            ],
            true,
          ),
        ],
      ),
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
        t('Select '),
        ui('Channels'),
        t(
          ' in the row of tabs along the top of the page. On a narrow screen it may be under the overflow menu at the right end.',
        ),
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
      [
        t(
          'Send the demo website link to one classmate at Digital Realty for feedback. Never share it outside the company. Leave it on until you finish Module 10, which uses these chats.',
        ),
      ],
    ]),
    watchOuts: [
      'Never share an agent link before checking its sign-in setting. With No authentication, anyone who has the link can chat with the agent and get answers from its uploaded files.',
      PRACTICE_DATA_RULE,
    ],
    tips: [
      'Nothing is live until you press Publish. Changes stay in draft on purpose, so you decide exactly when users see them.',
      'Run the pre-publish checklist first, in order: right environment, knowledge verified, evaluation passed, sign-in checked, right channel.',
      'Use the demo website for stakeholder review before broad rollout. It is not meant for production.',
    ],
    screenshots: [],
    screenshotsToCapture: m9ScreenshotsToCapture,
    tryIt:
      "Check your agent's sign-in setting, publish it to the demo website, and send the link to one classmate at Digital Realty for feedback. Congratulations, you've shipped an agent.",
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
        label: 'Connect an agent to Teams + Microsoft 365',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/microsoft-365-copilot-extend-with-agents',
        label: 'Extend Microsoft 365 Copilot with agents',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/publication-channels-mcp-agent-to-agent',
        label: 'MCP and A2A channels (preview)',
      },
    ]),
    checklist: [
      'Completed the pre-publish checklist',
      'Checked the sign-in setting, uploaded files, and tool credentials before sharing',
      'Published my practice agent',
      'Opened the Demo website channel and copied its link',
      'Sent the demo link to a classmate for feedback',
    ],
  },

  // -------------------------------------------------------------------------
  // Module 10
  // -------------------------------------------------------------------------
  {
    id: 10,
    harness: 'standard',
    slug: 'monitor-and-improve',
    title: 'Monitor & improve',
    whyItMatters:
      "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy and improving.",
    estimatedMinutes: 25,
    lastReviewed: '2026-11-21',
    verifiedAgainst: '2026-11',
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
          t('Reading the '),
          kw('Monitor', 'monitor'),
          t(' page summary: sessions, engagement, resolution, '),
          kw('escalation', 'escalation'),
        ],
        [t('Turning analytics into fixes for conversational '), kw('agents', 'agent')],
        [t('Autonomous '), kw('agent', 'agent'), t(' health, where it applies')],
        [t('A simple weekly ritual: what to check, what "bad" looks like, who to tell')],
        [
          t(
            'Analytics only count real conversations with a published agent. Chats in the test pane never show up',
          ),
        ],
      ]),
    ],
    goodToKnow: [
      list([
        [t('User question and reaction lists can be filtered and downloaded as a CSV file.')],
        [t('Session transcripts are available to people with the transcript viewer privilege.')],
        [
          t(
            'The Analytics Viewer role (April 2026) shares analytics with colleagues without giving them maker rights.',
          ),
        ],
        [t('Custom metrics (preview): describe a business outcome and Copilot Studio scores it.')],
      ]),
    ],
    buildSteps: buildSteps(10, [
      [
        t(
          'Chat with the practice agent you published in Module 9 three or four times on the demo website, or ask your classmate to. Only real conversations count; test pane chats never show up. New conversations can take a while to appear, so if the numbers are empty, come back later.',
        ),
      ],
      openPracticeAgent(),
      // VERIFY IN UI
      verifyStep([
        t('Find '),
        ui('Monitor'),
        t(
          ' in the row of tabs along the top of the page (older screens call it Analytics). On a narrow screen it may be under the overflow menu at the right end.',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([t('Select '), ui('Monitor'), t('. The analytics summary opens.')]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Use the date range picker in the top right corner of the Monitor page to choose the last 7 days.',
        ),
      ]),
      // VERIFY IN UI
      verifyStep([
        t(
          'Review the sessions, engagement, resolution, and escalation numbers in the summary cards.',
        ),
      ]),
      [t('Name one thing you would improve based on what you see.')],
      // VERIFY IN UI
      verifyStep([
        t('Finished? Close the demo website to everyone: select '),
        ui('Settings'),
        t(', then '),
        ui('Security'),
        t(', then '),
        ui('Authentication'),
        t(', choose '),
        ui('Authenticate with Microsoft'),
        t(', select '),
        ui('Save'),
        t(', and publish again. Sign-in changes only take effect after you publish.'),
      ]),
    ]),
    watchOuts: [],
    tips: [
      "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy.",
    ],
    screenshots: [],
    screenshotsToCapture: m10ScreenshotsToCapture,
    tryIt:
      "Chat with your published agent a few times on the demo website, open its Monitor page, and name one thing you'd improve based on what you see.",
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
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-question-reaction-lists',
        label: 'User question and reaction lists',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-transcripts-studio',
        label: 'Session transcripts',
      },
      {
        url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-custom-metrics',
        label: 'Custom metrics (preview)',
      },
    ]),
    checklist: [
      'Opened the Monitor page of my published practice agent',
      'Read sessions, engagement, resolution, and escalation numbers',
      "Named one thing I'd improve based on the data",
      'Turned sign-in back on and published again',
      'Know what a 15-minute weekly review should cover',
    ],
  },
]

export function getModuleById(id: number): Module | undefined {
  return modules.find((m) => m.id === id)
}
