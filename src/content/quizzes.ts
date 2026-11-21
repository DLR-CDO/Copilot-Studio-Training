/**
 * Quiz banks, 20+ questions per module. The server draws 10 per attempt (see
 * `server/quizEngine.ts`) and 2 per module for the final assessment.
 *
 * Server only: this file holds the answers. Browser code must never import it; a test enforces
 * that. Every question needs an explanation and a learn.microsoft.com `sourceUrl`.
 */
import type { QuizQuestion } from './types'

const LEARN = 'https://learn.microsoft.com/en-us/microsoft-copilot-studio'
const src = {
  whatIs: `${LEARN}/fundamentals-what-is-copilot-studio`,
  getStarted: `${LEARN}/fundamentals-get-started`,
  licensing: `${LEARN}/requirements-licensing-subscriptions`,
  harnesses: `${LEARN}/harnesses-overview`,
  environments: `${LEARN}/environments-first-run-experience`,
  dataPolicies: `${LEARN}/admin-data-loss-prevention`,
  solutions: `${LEARN}/authoring-solutions-overview`,
  knowledge: `${LEARN}/knowledge-copilot-studio`,
  sharePoint: `${LEARN}/knowledge-add-sharepoint`,
  fileUpload: `${LEARN}/knowledge-add-file-upload`,
  publicWebsite: `${LEARN}/knowledge-add-public-website`,
  knowledgeTest: `${LEARN}/knowledge-test`,
  topics: `${LEARN}/authoring-create-edit-topics`,
  systemTopics: `${LEARN}/authoring-system-topics`,
  triggers: `${LEARN}/authoring-triggers`,
  variables: `${LEARN}/authoring-variables`,
  tools: `${LEARN}/add-tools-custom-agent`,
  connectors: `${LEARN}/advanced-connectors`,
  promptTool: `${LEARN}/nlu-prompt-node`,
  agentFlows: `${LEARN}/flow-nl`,
  otherAgents: `${LEARN}/authoring-add-other-agents`,
  childAgent: `${LEARN}/add-agent-child-agent`,
  connectedAgent: `${LEARN}/add-agent-copilot-studio-agent`,
  mcp: `${LEARN}/agent-extend-action-mcp`,
  orchestration: `${LEARN}/advanced-generative-actions`,
  selectModel: `${LEARN}/authoring-select-agent-model`,
  previewModels: `${LEARN}/nlu-preview-model`,
  promptModels: `${LEARN}/prompt-model-settings`,
  authentication: `${LEARN}/configuration-end-user-authentication`,
  testPane: `${LEARN}/authoring-test-bot`,
  evalCreate: `${LEARN}/analytics-agent-evaluation-create`,
  evalOverview: `${LEARN}/analytics-agent-evaluation-overview`,
  evalResults: `${LEARN}/analytics-agent-evaluation-results`,
  analytics: `${LEARN}/analytics-summary`,
  effectiveness: `${LEARN}/analytics-improve-agent-effectiveness`,
  health: `${LEARN}/analytics-improve-agent-health`,
  publish: `${LEARN}/publication-fundamentals-publish-channels`,
  webChannels: `${LEARN}/publication-connect-bot-to-web-channels`,
  teams: `${LEARN}/publication-add-bot-to-microsoft-teams`,
  billing: `${LEARN}/billing-licensing`,
  whatsNew: `${LEARN}/whats-new`,
  multiTurn: `${LEARN}/analytics-agent-evaluation-multi-turn`,
  computerUse: `${LEARN}/computer-use`,
  a2a: `${LEARN}/add-agent-agent-to-agent`,
  foundry: `${LEARN}/add-agent-foundry-agent`,
  retiredModel: `${LEARN}/authoring-retired-model`,
  modelLifecycle: `${LEARN}/guidance/plan-agent-model-lifecycle`,
  shareAnalytics: `${LEARN}/admin-share-bots`,
  monitorOverview: `${LEARN}/analytics-overview`,
}

export const quizzesByModule: Record<number, QuizQuestion[]> = {
  // ---------------------------------------------------------------------
  // Module 1 — What is an agent?
  // ---------------------------------------------------------------------
  1: [
    {
      id: 'm1-q1',
      type: 'multiple-choice',
      prompt: 'Which list names parts of an agent that you set up on its Overview page?',
      options: [
        'Description, instructions, knowledge, tools, triggers, agents, topics, and suggested prompts',
        'Environment, solution, license type, Copilot Credits, data policies, and admin approvals',
        'Variables, conditions, citations, evaluations, test sets, and the activity map for each answer',
        'Channels, sessions, escalations, resolution rate, engagement, and the weekly review notes',
      ],
      correctIndex: 0,
      explanation:
        'The Overview page walks through the description, model, instructions, knowledge, tools, triggers, agents, topics, and suggested prompts. Channels are where people use the agent once it is published.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q2',
      type: 'true-false',
      prompt: 'Conversational agents chat with people, while autonomous agents act on triggers.',
      correct: true,
      explanation:
        'Conversational agents are the ones people chat with. Autonomous agents act on triggers, such as an email arriving, without anyone starting a chat.',
      sourceUrl: src.whatIs,
    },
    {
      id: 'm1-q3',
      type: 'multiple-choice',
      prompt: 'In Copilot Studio, where do you try out a new agent by asking it questions?',
      options: ['The left navigation', 'The test pane', 'The Overview page', 'The Channels page'],
      correctIndex: 1,
      explanation:
        'The test pane, on the right of the screen, is where you chat with your agent while you build it.',
      sourceUrl: src.testPane,
    },
    {
      id: 'm1-q4',
      type: 'true-false',
      prompt:
        'Licensing and Copilot Credits require you to configure billing settings in Module 1.',
      correct: false,
      explanation:
        "Licensing and Copilot Credits are awareness level only in this course. There's nothing to configure in Module 1.",
      sourceUrl: src.licensing,
    },
    {
      id: 'm1-q5',
      type: 'multiple-choice',
      prompt: "What's the very first step in creating your practice agent?",
      options: [
        'Open Settings and pick a model for the agent',
        'Make sure the DEV environment is selected',
        'Add a knowledge source so it has content',
        'Publish it to the demo website to test it',
      ],
      correctIndex: 1,
      explanation:
        'Before you do anything, make sure you are in the DEV environment. To change it, select the environment name in the bottom left corner.',
      sourceUrl: src.environments,
    },
    {
      id: 'm1-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your team wants an agent that answers urgent questions arriving by email, without anyone opening a chat. What kind of agent is that?',
      options: [
        'An autonomous agent that acts on a trigger',
        'A conversational agent that people chat with',
        'A topic with trigger phrases for urgent emails',
        'A suggested prompt shown at the top of the chat',
      ],
      correctIndex: 0,
      explanation:
        'Autonomous agents act on triggers, such as an email arriving. Conversational agents wait for someone to chat with them.',
      sourceUrl: src.whatIs,
    },
    {
      id: 'm1-q7',
      type: 'multiple-choice',
      prompt: 'Why is every practice agent created inside a solution?',
      options: [
        'The solution stores all the work you do on the agent',
        'The solution makes the agent visible to everyone at once',
        'The solution picks the best model for the agent automatically',
        "The solution turns on web search for the agent's answers",
      ],
      correctIndex: 0,
      explanation:
        'A solution is the container that stores your agent and its parts, which is also how the agent later moves from Dev to Test to Production.',
      sourceUrl: src.solutions,
    },
    {
      id: 'm1-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Other agents keep handing your agent requests it was never meant to handle. What should you rewrite first?',
      options: [
        'Its description, which others read to decide when to use it',
        'Its greeting topic, which is the first message users see',
        'Its suggested prompts, which list the questions people can ask',
        'Its knowledge files, which decide what it is allowed to answer',
      ],
      correctIndex: 0,
      explanation:
        'The description says what your agent does. People and other agents read it to decide when to use your agent, so a vague description attracts the wrong requests.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q9',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Priya opens Copilot Studio to start her practice agent and sees a Production environment name above her name. What should she do first?',
      options: [
        'Switch to the DEV environment before doing anything else',
        'Create the agent here and move it to DEV once it works',
        'Build it in Production so users can try it straight away',
        'Carry on; environments only matter when you publish',
      ],
      correctIndex: 0,
      explanation:
        'Agents are built in DEV. Check the environment name in the bottom left corner and switch to DEV before you create anything.',
      sourceUrl: src.environments,
    },
    {
      id: 'm1-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You have just added knowledge to a new agent. Which questions should you ask first in the test pane?',
      options: [
        'Questions your knowledge files are certain to answer',
        'Questions about subjects that none of your files cover yet',
        'Trick questions designed to confuse the agent',
        'Questions copied from another agent at random',
      ],
      correctIndex: 0,
      explanation:
        "Start with questions your files definitely answer. Then a wrong answer points to the agent's setup, not to missing knowledge.",
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q11',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'You need a knowledge file for your practice agent. Which one is fine to upload?',
      options: [
        'A made-up FAQ you wrote for the exercise',
        "Last quarter's sales figures for your region",
        "A spreadsheet of your team's names and salaries",
        'A customer contract, with the names removed by hand',
      ],
      correctIndex: 0,
      explanation:
        'Practice agents only get made-up or already-public content. Customer and employee data, financial results, and contracts never go in, even with names removed.',
      sourceUrl: src.fileUpload,
    },
    {
      id: 'm1-q12',
      type: 'multiple-choice',
      prompt: 'Where do people actually use an agent once it is published?',
      options: ['In channels', 'In the test pane', 'In the solution', 'In the Overview page'],
      correctIndex: 0,
      explanation:
        'Channels, such as a website or Teams + Microsoft 365, are where people use a published agent. The test pane is only for building.',
      sourceUrl: src.publish,
    },
    {
      id: 'm1-q13',
      type: 'multiple-choice',
      prompt: 'Which harness does this course teach?',
      options: [
        'The standard harness',
        'The Microsoft Copilot harness',
        'The Customer Conversation harness',
        'All three equally',
      ],
      correctIndex: 0,
      explanation:
        'The course covers topics, rules, and agent flows, which is how agents on the standard harness work. The other harnesses have different screens and features.',
      sourceUrl: src.harnesses,
    },
    {
      id: 'm1-q14',
      type: 'order',
      prompt: 'Put these steps for building your practice agent in the order they have to happen.',
      steps: [
        'Create a solution, then the agent inside it',
        'Confirm the DEV environment is selected',
        'Ask three questions in the test pane',
        'Add a description, instructions, and knowledge',
      ],
      correctOrder: [1, 0, 3, 2],
      explanation:
        'Each step needs the one before it: the right environment, then a solution to hold the agent, then the agent’s content, and only then something to test.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q15',
      type: 'multiple-choice',
      prompt: 'What are suggested prompts?',
      options: [
        'Starter prompts, each with a title, that show users what to ask',
        'Instructions the agent always follows, in every conversation',
        'Questions saved in a test set, each with an expected answer',
        'Messages the agent sends when it cannot find an answer',
      ],
      correctIndex: 0,
      explanation:
        'Suggested prompts are starters, each with a title, that show users the kind of thing they can ask the agent.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q16',
      type: 'multiple-choice',
      prompt: 'What is the billing unit for agents in Copilot Studio?',
      options: [
        'Tokens used by the model',
        'Copilot Credits',
        'Chat sessions per month',
        'User licenses',
      ],
      correctIndex: 1,
      explanation:
        'Agents are billed in Copilot Credits. They replaced messages as the billing unit on September 1, 2025.',
      sourceUrl: src.billing,
    },
    {
      id: 'm1-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'Sam’s HR agent answers well, but nobody knows what to ask it. What helps most?',
      options: [
        'Add suggested prompts that show what to ask',
        'Switch the agent to a preview model',
        'Move the agent to the Production environment',
        'Add trigger phrases to every system topic',
      ],
      correctIndex: 0,
      explanation:
        'Suggested prompts are starters that show users the kind of thing they can ask the agent.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q18',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Copilot Studio just created your agent from a plain-English description. What do you do before trusting it?',
      options: [
        'Ask it real questions in the test pane and check the answers',
        'Publish it to Teams so colleagues can try it out first',
        'Delete the description, since the agent no longer needs it',
        'Turn on web search so it can answer any question at all',
      ],
      correctIndex: 0,
      explanation:
        'Always try a new agent in the test pane first, and check its answers before anyone else uses it.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q19',
      type: 'multiple-choice',
      prompt: 'What does an agent’s description mainly do?',
      options: [
        'Says what the agent is for, so requests can be matched to it',
        'Sets the colors and icon users see in Microsoft Teams',
        'Lists the people who are allowed to chat with the agent',
        'Stores the expected answers that are used for testing',
      ],
      correctIndex: 0,
      explanation:
        'The description says what the agent does. Orchestration and other agents use it to decide when to send requests to it.',
      sourceUrl: src.getStarted,
    },
    {
      id: 'm1-q20',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A teammate wants to put real customer contract data into a practice agent "just to see if it works". What do you say?',
      options: [
        'Use made-up practice data, never real confidential data',
        'Fine, as long as the agent stays in the DEV environment',
        'Fine, if the file is uploaded rather than linked',
        'Fine, once web search has been turned off for the agent',
      ],
      correctIndex: 0,
      explanation:
        'Uploaded files need no sign-in, so anyone who can chat with the agent can get answers from them. Practice agents use made-up data only.',
      sourceUrl: src.fileUpload,
    },
    {
      id: 'm1-q21',
      type: 'multiple-choice',
      prompt: 'Which of these could start an autonomous agent?',
      options: [
        'A new email arriving in a shared mailbox',
        'A user typing a question in Teams',
        'A maker selecting Test in Copilot Studio',
        'A colleague opening the demo website',
      ],
      correctIndex: 0,
      explanation:
        'Autonomous agents act on triggers, such as a new email arriving, without anyone opening a chat.',
      sourceUrl: src.whatIs,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 2 — Pick the right environment
  // ---------------------------------------------------------------------
  2: [
    {
      id: 'm2-q1',
      type: 'multiple-choice',
      scenario: true,
      prompt: "You built an agent but can't find it after switching environments. What happened?",
      options: [
        'The agent was deleted automatically when you switched',
        'Agents live only in the environment where they were created',
        'The agent was moved to Production when you switched',
        'Your license expired, so your agents are hidden from you',
      ],
      correctIndex: 1,
      explanation:
        'An environment is a container for agents, data, and permissions. Switch environments and you are looking in a different container.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q2',
      type: 'true-false',
      prompt: 'You should build and test new ideas directly in Production.',
      correct: false,
      explanation:
        'Work flows one direction, Dev → Test → Production. You never build directly in Production.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q3',
      type: 'multiple-choice',
      prompt: 'Where do you check and switch your current environment in Copilot Studio?',
      options: [
        'The Channels page, in the row of tabs along the top',
        'The environment name in the bottom left corner',
        'The Settings page, under Security, next to Authentication',
        'The Overview page, in the Details card at the top',
      ],
      correctIndex: 1,
      explanation:
        'Select the environment name in the bottom left corner to open the Switch environment menu.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q4',
      type: 'true-false',
      prompt: 'Admins can control whether preview AI models are allowed in an environment.',
      correct: true,
      explanation:
        'Admins control data policies per environment, and whether preview AI models are allowed.',
      sourceUrl: src.previewModels,
    },
    {
      id: 'm2-q5',
      type: 'order',
      prompt: 'Put these environments in the order work is meant to flow through them.',
      steps: ['Test', 'Production', 'Dev'],
      correctOrder: [2, 0, 1],
      explanation:
        'Work flows one direction: Dev → Test → Production. You never build directly in Production.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A teammate edited a live agent directly in Production "just to try something". What is the main risk?',
      options: [
        'Real users can see unfinished changes, and real data is involved',
        'The agent will run more slowly until the change is undone',
        'The agent will lose its model and fall back to the default',
        'None, as long as the change is small and you undo it straight after',
      ],
      correctIndex: 0,
      explanation:
        'Production is where real users and real data are. Try ideas in Dev, check them in Test, and only then move them to Production.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q7',
      type: 'multiple-choice',
      prompt: 'What does an environment hold?',
      options: [
        'Agents, data, and permissions',
        'Only agents, nothing else',
        'Only the model settings for agents',
        'Only published channels and links',
      ],
      correctIndex: 0,
      explanation: 'An environment is a container for agents, data, and permissions.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A colleague can pick a model tagged Preview, but in your environment it does not appear. What is the most likely reason?',
      options: [
        'Your admin has not allowed preview models in your environment',
        'Your agent has too many topics for preview models to load',
        'Preview models only appear after the agent has been published',
        'Your browser cached an old model list, so you need to clear it',
      ],
      correctIndex: 0,
      explanation:
        'Admins control whether preview models are allowed in each environment, so they can appear in one and not another.',
      sourceUrl: src.previewModels,
    },
    {
      id: 'm2-q9',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You try to add a connector and get a message that a policy blocks it. Who can explain why?',
      options: [
        'Your environment admin, who manages data policies',
        'The person who built the connector, through its support page',
        'The users of your agent, who agreed to the policy',
        'Nobody; these blocks happen at random and clear by themselves',
      ],
      correctIndex: 0,
      explanation:
        'Data policies are set by admins and decide which connectors agents in an environment can use.',
      sourceUrl: src.dataPolicies,
    },
    {
      id: 'm2-q10',
      type: 'multiple-choice',
      prompt: 'What do data policies control for agents?',
      options: [
        'Which connectors and capabilities agents may use there',
        'How long each conversation can last before the agent ends it',
        'Which model every agent in the environment uses by default',
        'The colors and icon the agent shows when it appears in Teams',
      ],
      correctIndex: 0,
      explanation:
        'Admins use data policies to control which connectors and capabilities makers can use in agents, which protects company data.',
      sourceUrl: src.dataPolicies,
    },
    {
      id: 'm2-q11',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You come back to Copilot Studio after a long weekend to keep working on your practice agent. What do you check before editing anything?',
      options: [
        'That the environment name shows DEV',
        'That the agent was published since your last visit',
        'That analytics show new sessions from the weekend',
        'That the test pane is empty before you start',
      ],
      correctIndex: 0,
      explanation:
        "Environments come first. Confirming you're in Dev is the check that prevents the most painful mistakes.",
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q12',
      type: 'multiple-choice',
      prompt: 'What is the Test environment for?',
      options: [
        'Checking the agent before real users see it',
        'Building new ideas from scratch before anyone sees them',
        'Storing old agents you no longer need, as an archive',
        'Hosting the demo website so stakeholders can review it',
      ],
      correctIndex: 0,
      explanation:
        'Test sits between Dev and Production. It is where you check that the agent works before it reaches real users.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q13',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'Your agent works well in DEV. How should it reach Production?',
      options: [
        'Move its solution through Test, then into Production',
        'Rebuild it by hand in Production',
        'Copy and paste its instructions into a new agent in Production',
        'Publish it from DEV and tell users to switch environments',
      ],
      correctIndex: 0,
      explanation:
        'The solution holds the agent and its parts, so it can be moved from Dev to Test to Production without rebuilding.',
      sourceUrl: src.solutions,
    },
    {
      id: 'm2-q14',
      type: 'true-false',
      prompt:
        'The environment name in the bottom left corner shows the environment you are in right now.',
      correct: true,
      explanation:
        'The environment name in the bottom left corner shows your current environment, and selecting it lets you switch.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q15',
      type: 'true-false',
      prompt: 'Switching environments moves the agent you have open into the new environment.',
      correct: false,
      explanation:
        'Agents stay in the environment where they were created. Switching only changes which environment you are looking at.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q16',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        "Your Add knowledge pop-up has no 'Public websites' option. What is the most likely reason?",
      options: [
        'Your trial license has ended, so only file uploads are offered',
        'An admin restricted that source type for your environment',
        'The agent is already published, so new source types are locked',
        'Your agent uses a model that cannot read public websites',
      ],
      correctIndex: 1,
      explanation:
        'Since October 2026, admins can restrict file uploads, SharePoint and OneDrive, or public websites as knowledge sources, separately or together.',
      sourceUrl: src.whatsNew,
    },
    {
      id: 'm2-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Two teammates built practice agents, but one can’t see the other’s, even though both are in Copilot Studio. What do you check first?',
      options: [
        'Whether both are in the same environment',
        'Whether both used the same model',
        'Whether both agents are published to Teams',
        'Whether both turned on web search',
      ],
      correctIndex: 0,
      explanation:
        'Each environment holds its own agents. If two people are in different environments, they can’t see each other’s agents.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q18',
      type: 'multiple-choice',
      prompt: 'What is the Dev environment for?',
      options: [
        'Building and trying out changes safely',
        'Hosting the agent your users rely on',
        'Storing Copilot Credits for billing',
        'Final sign-off right before go-live',
      ],
      correctIndex: 0,
      explanation:
        'Dev is where you build and try ideas. Test is for checking before go-live, and Production is what users rely on.',
      sourceUrl: src.environments,
    },
    {
      id: 'm2-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You want to move your finished practice agent from DEV to Test. What makes that possible?',
      options: [
        'Building it inside a solution',
        'Copying its instructions into a new agent',
        'Publishing it to the demo website',
        'Switching the environment to Test',
      ],
      correctIndex: 0,
      explanation:
        'Solutions package an agent and its parts so it can be moved between environments.',
      sourceUrl: src.solutions,
    },
    {
      id: 'm2-q20',
      type: 'multiple-choice',
      prompt: 'Who sets the data policies for an environment?',
      options: [
        'Your Power Platform admin',
        'Each maker, separately for each agent',
        'Microsoft, the same for every company',
        'The first person who builds an agent',
      ],
      correctIndex: 0,
      explanation: 'Admins set data policies (DLP) for an environment. Makers work within them.',
      sourceUrl: src.dataPolicies,
    },
    {
      id: 'm2-q21',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent works in DEV, but a connector it uses is blocked in Test. What is a likely cause?',
      options: [
        'Test has different data policies than DEV',
        'Test environments always use older models',
        'Agents forget their tools when they are moved',
        'Connectors only work in the environment they were added in',
      ],
      correctIndex: 0,
      explanation:
        'Each environment can have its own data policies, so a connector allowed in one can be blocked in another.',
      sourceUrl: src.dataPolicies,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 3 — Add knowledge
  // ---------------------------------------------------------------------
  3: [
    {
      id: 'm3-q1',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A colleague asks the agent a policy question and wants to be sure the answer is trustworthy, not just generated. What should they check?',
      options: [
        'Nothing; generative answers are checked by Microsoft first',
        'The citation, to confirm the answer came from its knowledge',
        'The model name, to confirm a trusted model wrote it',
        'The number of knowledge sources connected to the agent',
      ],
      correctIndex: 1,
      explanation:
        'Always check the source. A citation lets you confirm an answer came from your knowledge before you trust it.',
      sourceUrl: src.knowledgeTest,
    },
    {
      id: 'm3-q2',
      type: 'true-false',
      prompt:
        'Turning off Allow ungrounded responses (older screens: use general knowledge) stops the agent from answering when it used no knowledge source or tool.',
      correct: true,
      explanation:
        'With Allow ungrounded responses off, the agent blocks a response in any turn where it did not use a knowledge source or tool, instead of falling back on the model’s general knowledge.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q3',
      type: 'multiple-choice',
      prompt: 'Which of these is NOT a knowledge source?',
      options: [
        'A SharePoint site',
        'An uploaded PDF file',
        'A public website',
        'A connected agent',
      ],
      correctIndex: 3,
      explanation:
        'SharePoint, OneDrive, uploaded files, and public websites are the everyday knowledge sources. A connected agent is another agent your agent can hand work to, not a source of documents.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q4',
      type: 'multiple-choice',
      prompt: 'What is the main thing that helps the agent pick the right knowledge source?',
      options: [
        'A clear, well-written description of the source',
        'The order in which the sources were added to the agent',
        'The file size of each source, with bigger files first',
        'The environment the agent is built in, DEV or Test',
      ],
      correctIndex: 0,
      explanation:
        'Writing a good description for each source is how the agent picks the right one.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q5',
      type: 'true-false',
      prompt:
        'You should check a citation to confirm an answer actually came from your knowledge, rather than assuming it is correct.',
      correct: true,
      explanation:
        'Check the citation. It shows whether an answer actually came from your knowledge sources.',
      sourceUrl: src.knowledgeTest,
    },
    {
      id: 'm3-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your HR agent keeps giving generic internet-style advice instead of quoting your policy documents. Which setting should you review first?',
      options: [
        'Allow ungrounded responses (general knowledge)',
        'The environment the agent was created in',
        'The demo website channel and its welcome message',
        'The suggested prompts on the Overview page',
      ],
      correctIndex: 0,
      explanation:
        'When Allow ungrounded responses is on, the agent can answer from the model’s general knowledge instead of your documents. Turn it off when answers must come from your sources.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q7',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You added two SharePoint libraries, "Benefits" and "IT how-to", and the agent often searches the wrong one. What is the best fix?',
      options: [
        'Write a clearer description for each source',
        'Delete one of the libraries so only one is left',
        'Rename the agent so it sounds more specific',
        'Add more suggested prompts that mention each one',
      ],
      correctIndex: 0,
      explanation:
        'The agent picks a source by reading its description, so a clear description of what each library covers fixes the routing.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q8',
      type: 'multiple-choice',
      prompt: 'What does selecting the reference link under an answer let you do?',
      options: [
        'Open the source the answer came from',
        'Rate the answer so it counts in analytics',
        'Send the answer to yourself by email',
        'Publish the answer to a Teams channel',
      ],
      correctIndex: 0,
      explanation:
        'The reference link opens the cited source, so you can confirm the answer really came from your knowledge.',
      sourceUrl: src.knowledgeTest,
    },
    {
      id: 'm3-q9',
      type: 'multiple-choice',
      prompt:
        'You have a PDF on your laptop that is not stored on SharePoint or OneDrive. How do you add it as knowledge?',
      options: [
        'Upload the file in the Add knowledge pop-up',
        'Add it as a tool so the agent can open it',
        "Paste its text into the agent's description",
        'Add it as a child agent with its own instructions',
      ],
      correctIndex: 0,
      explanation:
        'You can drag and drop a file such as a PDF or Word document straight into the Add knowledge pop-up.',
      sourceUrl: src.fileUpload,
    },
    {
      id: 'm3-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'The agent gives a confident answer with no citation underneath. What does that suggest?',
      options: [
        'It may not have come from your sources, so check it first',
        'It is guaranteed correct, because the agent was confident',
        'It came from the published version, not your draft',
        'The knowledge source has too many files to show citations',
      ],
      correctIndex: 0,
      explanation:
        'Answers grounded in your knowledge come with citations. Without one, you cannot tell where the answer came from.',
      sourceUrl: src.knowledgeTest,
    },
    {
      id: 'm3-q11',
      type: 'true-false',
      prompt:
        "Web search should only be turned on for broad agents that don't handle confidential information.",
      correct: true,
      explanation:
        'Public web content is fine for broad agents, but keep it away from agents that deal with confidential information.',
      sourceUrl: src.publicWebsite,
    },
    {
      id: 'm3-q12',
      type: 'order',
      prompt: 'Put the steps for adding and checking a knowledge source in the order they happen.',
      steps: [
        'Write a clear description of the source',
        'Pick a SharePoint site or file',
        'Ask test questions and check the citations',
        'Select Add knowledge',
      ],
      correctOrder: [3, 1, 0, 2],
      explanation:
        'Open Add knowledge, pick the source, describe it so the agent can choose it, then test and check the citations.',
      sourceUrl: src.sharePoint,
    },
    {
      id: 'm3-q13',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        "You add a vendor's public help site as a knowledge source, and web search is off. Where does the agent look on the web?",
      options: [
        "Only on the vendor's site that you added",
        'On every public website that Bing has indexed',
        "On the vendor's site and any site it links to",
        "On your SharePoint sites, then on the vendor's site",
      ],
      correctIndex: 0,
      explanation:
        'A public website source searches only the sites you name. Web search is a separate setting that searches all public websites Bing has indexed; with it off, the agent stays on your listed sites.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q14',
      type: 'true-false',
      prompt: 'Adding more knowledge sources always makes answers better.',
      correct: false,
      explanation:
        'More sources only help if the agent can tell them apart. Each source needs a clear description so the agent picks the right one.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q15',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Answers must come only from the policies library, never from general model knowledge. What do you do?',
      options: [
        'Add the library as knowledge and turn off Allow ungrounded responses',
        'Add the library as a tool, so the agent opens it on request',
        'Turn on web search, so the agent can double-check each policy',
        'Paste the policies into the suggested prompts on the Overview page',
      ],
      correctIndex: 0,
      explanation:
        'Add the library as a knowledge source, then turn off Allow ungrounded responses so the agent does not fall back on the model’s general knowledge.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q16',
      type: 'multiple-choice',
      prompt:
        'Which knowledge sources need the user to sign in with their work account to give answers?',
      options: [
        'SharePoint, OneDrive, and Dataverse',
        'Uploaded files and public websites',
        'Only public websites',
        'None, knowledge never needs sign-in',
      ],
      correctIndex: 0,
      explanation:
        'SharePoint, OneDrive, and Dataverse answer using the user’s own access, so the user must sign in. Uploaded files and public websites need no sign-in.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your SharePoint source answers in the test pane, but people on the demo website (set to No authentication) get nothing. Why?',
      options: [
        'SharePoint needs users to sign in, and the demo site has no sign-in',
        'SharePoint sources only work after a month of indexing data',
        'The demo website always uses a different model than the test pane',
        'Knowledge sources are removed each time the agent is published',
      ],
      correctIndex: 0,
      explanation:
        'SharePoint answers use the signed-in user’s access. With No authentication, nobody is signed in, so the agent can’t search SharePoint for them.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm3-q18',
      type: 'multiple-choice',
      prompt: 'What does web search ("Use information from the web") search?',
      options: [
        'All of Bing, not just the sites you added',
        'Only the public websites you added as knowledge',
        'Only SharePoint sites in your organization',
        'Only Microsoft Learn and other Microsoft sites',
      ],
      correctIndex: 0,
      explanation:
        'Web search uses all of Bing. Public website knowledge sources only search the sites you add.',
      sourceUrl: src.publicWebsite,
    },
    {
      id: 'm3-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent quotes last year’s travel policy. The new one is in a different SharePoint folder. What do you do?',
      options: [
        'Point the knowledge at the current file and remove the old one',
        'Turn on web search so it can find newer versions online',
        'Switch to classic orchestration to stop it guessing',
        'Add a system topic that tells users to ignore any outdated answers',
      ],
      correctIndex: 0,
      explanation:
        'The agent answers from the knowledge you give it. Keep sources current and remove outdated ones.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q20',
      type: 'multiple-choice',
      prompt: 'You uploaded a file as knowledge. Who can get answers from it?',
      options: [
        'Anyone who can chat with the agent',
        'Only people who can open it in SharePoint',
        'Only the maker who uploaded it',
        'Only people with an admin role',
      ],
      correctIndex: 0,
      explanation:
        'Uploaded files need no sign-in, so everyone who can chat with the agent can get answers from them. Never upload confidential files to a practice agent.',
      sourceUrl: src.fileUpload,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 4 — Build topics
  // ---------------------------------------------------------------------
  4: [
    {
      id: 'm4-q1',
      type: 'multiple-choice',
      prompt: 'What is a topic, in plain terms?',
      options: [
        'A scripted conversation path with a trigger',
        'A connector that links the agent to another system',
        "The AI model that writes each of the agent's answers",
        'A knowledge source made of scripted answers',
      ],
      correctIndex: 0,
      explanation:
        'A topic is a scripted conversation path with a trigger, used when a conversation must follow a script.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q2',
      type: 'true-false',
      prompt:
        'In generative orchestration, topics can be routed to based on their descriptions, not only trigger phrases.',
      correct: true,
      explanation:
        'Trigger phrases are the classic approach. Generative orchestration picks topics by reading their descriptions.',
      sourceUrl: src.orchestration,
    },
    {
      id: 'm4-q3',
      type: 'multiple-choice',
      prompt: "Which three nodes are the 'everyday' building blocks of a topic?",
      options: [
        'Message, question, condition',
        'Trigger, tool, channel',
        'Knowledge, instructions, tools',
        'Escalate, fallback, greeting',
      ],
      correctIndex: 0,
      explanation:
        'Message, question, and condition are the three everyday nodes for building a topic.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q4',
      type: 'multiple-choice',
      prompt: 'What does a variable do, in plain terms?',
      options: [
        'It lets the agent remember what the user told it',
        "It stores the agent's model and orchestration settings",
        'It connects the agent to a SharePoint site',
        "It publishes the agent's answers to a channel",
      ],
      correctIndex: 0,
      explanation: 'A variable is the agent remembering what the user told it.',
      sourceUrl: src.variables,
    },
    {
      id: 'm4-q5',
      type: 'true-false',
      prompt: 'System topics like greeting, fallback, and escalate can be customized.',
      correct: true,
      explanation:
        'System topics such as greeting, fallback, and escalate come with every agent, and you can customize them.',
      sourceUrl: src.systemTopics,
    },
    {
      id: 'm4-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        "A request must collect the user's site, ticket type, and urgency in a fixed order. What should you build?",
      options: ['A topic', 'A knowledge source', 'A suggested prompt', 'A new environment'],
      correctIndex: 0,
      explanation:
        'When a conversation must follow a script, like collecting details for a request, topics give you full control.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q7',
      type: 'multiple-choice',
      prompt: 'Which node asks the user something and saves the answer?',
      options: ['Question', 'Message', 'Condition', 'Trigger'],
      correctIndex: 0,
      explanation:
        'A Question node asks the user something and saves the response in a variable for later.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q8',
      type: 'multiple-choice',
      prompt: 'Which node lets a conversation go different ways depending on an answer?',
      options: ['Condition', 'Message', 'Question', 'Trigger'],
      correctIndex: 0,
      explanation:
        'A Condition node checks a value, such as a saved answer, and splits the conversation into branches.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q9',
      type: 'multiple-choice',
      prompt: 'When does the "All other conditions" branch run?',
      options: [
        'When none of the other conditions match',
        'Always, after every other branch has finished',
        'Only when the user types the word "other"',
        'Only in the test pane, never for real users',
      ],
      correctIndex: 0,
      explanation:
        '"All other conditions" catches every case the conditions above it do not match.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent uses generative orchestration, and your new topic rarely starts even though users ask about it. What should you improve first?',
      options: [
        "The topic's description",
        'The number of nodes in the topic',
        "The agent's environment",
        'The demo website settings',
      ],
      correctIndex: 0,
      explanation:
        'With generative orchestration, the agent decides which topic to use by reading topic descriptions, so a vague description means a missed topic.',
      sourceUrl: src.orchestration,
    },
    {
      id: 'm4-q11',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A user types something the agent cannot match to any topic or answer. Which system topic runs?',
      options: ['Fallback', 'Greeting', 'Escalate', 'Conversation start'],
      correctIndex: 0,
      explanation:
        'The Fallback system topic runs when the agent cannot understand what the user wants.',
      sourceUrl: src.systemTopics,
    },
    {
      id: 'm4-q12',
      type: 'multiple-choice',
      prompt: 'Which system topic hands the conversation over to a person?',
      options: ['Escalate', 'Fallback', 'Greeting', 'Goodbye'],
      correctIndex: 0,
      explanation: 'The Escalate system topic is used when the user needs a human.',
      sourceUrl: src.systemTopics,
    },
    {
      id: 'm4-q13',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'After asking "Which system do you need help with?", you want to use the answer later in the same topic. What do you do?',
      options: [
        'Save it in a clearly named variable, like SystemName',
        'Ask the same question again at the point you need the answer',
        "Add the answer to the agent's knowledge sources for later",
        'Write the answer into the agent description so it remembers',
      ],
      correctIndex: 0,
      explanation:
        'Saving the answer in a well-named variable lets later nodes, like a condition, use it.',
      sourceUrl: src.variables,
    },
    {
      id: 'm4-q14',
      type: 'order',
      prompt: 'Put the parts of a simple help topic in the order the conversation runs.',
      steps: [
        'Send a message with the answer for that choice',
        'Ask a question and save the answer',
        'Check the saved answer with a condition',
        'The trigger starts the topic',
      ],
      correctOrder: [3, 1, 2, 0],
      explanation:
        'The trigger starts the topic, the question collects the answer, the condition checks it, and the message replies for that branch.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q15',
      type: 'true-false',
      prompt: "A topic's trigger decides when the topic starts.",
      correct: true,
      explanation:
        'Every topic has a trigger. You can change the trigger type to control when the topic starts.',
      sourceUrl: src.triggers,
    },
    {
      id: 'm4-q16',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Users answer "Which site?" with typos, so your condition never matches. What helps most?',
      options: [
        'Ask the question with a fixed list of options to pick from',
        'Add many more trigger phrases so the topic starts more often',
        'Replace the question node with a message node',
        'Turn off generative orchestration for the agent',
      ],
      correctIndex: 0,
      explanation:
        'A question node can offer multiple-choice options, so the answer always matches one of your condition values.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q17',
      type: 'multiple-choice',
      prompt: 'What is a trigger phrase?',
      options: [
        'An example of what a user might say to start a topic',
        'A word that ends the conversation immediately',
        'The message the agent always sends first to greet every user',
        'A password that unlocks admin-only topics',
      ],
      correctIndex: 0,
      explanation:
        'Trigger phrases are examples of what users say. They help the agent decide when to start the topic.',
      sourceUrl: src.triggers,
    },
    {
      id: 'm4-q18',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your topic asks for a laptop model, then for urgency, then branches on urgency. Where does the condition node go?',
      options: [
        'After the urgency question, so it can use the answer',
        'Before any question, at the top of the topic',
        'Inside the trigger, next to the trigger phrases',
        'In a separate system topic called Conditions',
      ],
      correctIndex: 0,
      explanation:
        'A condition can only branch on an answer the topic has already collected, so it goes after that question.',
      sourceUrl: src.topics,
    },
    {
      id: 'm4-q19',
      type: 'multiple-choice',
      prompt: 'Where do you find the Fallback topic to customize it?',
      options: [
        'On the Topics page, with the system topics',
        'In Settings, under Security',
        'On the Channels page, next to the demo website',
        'In the Power Platform admin center',
      ],
      correctIndex: 0,
      explanation:
        'System topics such as Greeting, Fallback, and Escalate are listed on the Topics page, and you can edit them there.',
      sourceUrl: src.systemTopics,
    },
    {
      id: 'm4-q20',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'In the test pane, a question starts the wrong topic. How do you find out why?',
      options: [
        'Check which topic ran, and why, in the activity map',
        'Delete the topic and build it again from scratch',
        'Publish the agent and wait for the analytics',
        'Switch the model to one tagged Preview',
      ],
      correctIndex: 0,
      explanation:
        'The test pane shows which topic is running, and the activity map shows why the agent picked it.',
      sourceUrl: src.testPane,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 5 — Add tools
  // ---------------------------------------------------------------------
  5: [
    {
      id: 'm5-q1',
      type: 'multiple-choice',
      prompt: 'What is a tool, in plain terms?',
      options: [
        'An action the agent can take on your behalf',
        'A scripted conversation path that starts on a trigger',
        'A container that holds agents, data, and permissions',
        'A link back to the knowledge source behind an answer',
      ],
      correctIndex: 0,
      explanation:
        'A tool is an action the agent can take on your behalf, like looking up records or sending emails.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q2',
      type: 'true-false',
      prompt:
        'A connector is a ready-made bridge to systems like Outlook, SharePoint, and Dataverse.',
      correct: true,
      explanation:
        'Connectors are ready-made bridges to systems such as Outlook, SharePoint, and Dataverse.',
      sourceUrl: src.connectors,
    },
    {
      id: 'm5-q3',
      type: 'multiple-choice',
      prompt: 'What decides whether the agent picks the right tool at the right moment?',
      options: [
        "The tool's description",
        'The number of connectors installed',
        'The environment it is built in',
        'The channel it is published to',
      ],
      correctIndex: 0,
      explanation:
        "The tool's description decides whether the agent picks it at the right moment. A vague description means a missed tool.",
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q4',
      type: 'true-false',
      prompt:
        'A tool set to Maker-provided credentials runs with your access for everyone who chats with the agent.',
      correct: true,
      explanation:
        'Maker-provided credentials make the tool use your credentials. End user credentials, the default, mean users only get data they are allowed to see, which is what a practice agent should use.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q5',
      type: 'multiple-choice',
      prompt: 'In Copilot Studio, what is a prompt?',
      options: [
        'Reusable AI instructions that can be added as a tool',
        'A knowledge source made from your saved chat messages',
        'A system topic that runs when the agent is unsure',
        'An environment setting that your admin turns on',
      ],
      correctIndex: 0,
      explanation: 'Prompts are reusable AI instructions, and you can add a prompt as a tool.',
      sourceUrl: src.promptTool,
    },
    {
      id: 'm5-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You want the agent to email the user a summary of the chat. What do you add to the agent?',
      options: [
        'A connector tool, like Outlook "Send an email (V2)"',
        'A knowledge source that holds your email templates',
        'A suggested prompt that asks the agent about email',
        'A topic that tells users how to send the email themselves',
      ],
      correctIndex: 0,
      explanation:
        'Sending an email is an action, so it needs a tool. The Office 365 Outlook connector provides a send email action.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q7',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent has a "Send email" tool, but when users ask it to email them, it never uses the tool. What is the most likely fix?',
      options: [
        'Rewrite its description to say clearly when to use it',
        'Add the same tool a second time so it gets picked more',
        'Move the agent to Production, where tools run properly',
        'Turn on web search so the agent can find the email tool',
      ],
      correctIndex: 0,
      explanation:
        'The agent reads the tool description to decide when to use it. A clear description fixes most missed tools.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q8',
      type: 'multiple-choice',
      prompt: 'What must a connector tool have before it can run?',
      options: [
        'A working connection, signed in with an account',
        'A published demo website where the tool can run',
        'At least three topics that mention the tool by name',
        'A preview model that supports connector actions',
      ],
      correctIndex: 0,
      explanation:
        'A connector acts through a connection. If the connection shows a sign-in prompt instead of a green check mark, sign in first.',
      sourceUrl: src.connectors,
    },
    {
      id: 'm5-q9',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You need the same "summarize this in three bullet points" instructions in several places. What fits best?',
      options: [
        'A prompt, reused as a tool',
        'A new environment',
        'A knowledge source',
        'A child agent for each place',
      ],
      correctIndex: 0,
      explanation:
        'A prompt is a reusable set of AI instructions, and you can add it to an agent as a tool.',
      sourceUrl: src.promptTool,
    },
    {
      id: 'm5-q10',
      type: 'multiple-choice',
      prompt: 'What is an agent flow for?',
      options: [
        'Running a multi-step automation the agent can start',
        'Switching the agent between DEV, Test, and Production',
        "Writing the agent's description and instructions for you",
        'Storing knowledge files outside SharePoint and OneDrive',
      ],
      correctIndex: 0,
      explanation:
        'Agent flows automate multi-step processes, and the agent can run them as a tool.',
      sourceUrl: src.agentFlows,
    },
    {
      id: 'm5-q11',
      type: 'true-false',
      prompt:
        'When you test a connector tool, the test pane may ask for permission to use your connection before the tool runs.',
      correct: true,
      explanation:
        'The test pane can ask you to allow the connection. Select Allow, then confirm the tool ran.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q12',
      type: 'order',
      prompt: 'Put the steps for adding a connector tool in the order they happen.',
      steps: [
        'Write a clear description of when to use it',
        'Search for the connector action and pick it',
        'Sign in so the connection shows a green check mark',
        'Ask the agent to do the task in the test pane',
      ],
      correctOrder: [1, 2, 0, 3],
      explanation:
        'Pick the action, connect it, describe when to use it, then test it. The tool cannot run without a connection, and testing comes last.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q13',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A user asks the agent to send them a reminder email. Which part of the agent does the sending?',
      options: ['A tool', 'A knowledge source', 'A topic description', 'A suggested prompt'],
      correctIndex: 0,
      explanation: 'Knowledge lets an agent answer. Tools let it act, like sending an email.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q14',
      type: 'multiple-choice',
      prompt: 'Which of these can NOT be added to an agent as a tool?',
      options: ['A knowledge source', 'A connector action', 'A prompt', 'An agent flow'],
      correctIndex: 0,
      explanation:
        'Connectors, prompts, and agent flows can all be tools. Knowledge sources are a separate part of the agent.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q15',
      type: 'true-false',
      prompt: 'Connectors only work with Microsoft products.',
      correct: false,
      explanation:
        'There are connectors for many services from other companies too, not only Microsoft products.',
      sourceUrl: src.connectors,
    },
    {
      id: 'm5-q16',
      type: 'multiple-choice',
      prompt: 'What kind of credentials does a new tool use by default?',
      options: [
        'End user: each person signs in as themselves',
        'Maker-provided: your own connection for everyone',
        'Admin: one account shared across the environment',
        'None, because tools never need to sign in',
      ],
      correctIndex: 0,
      explanation:
        'Tools use end user credentials by default, so each person acts with their own access. Maker-provided is a choice you make on purpose.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A tool that reads a shared mailbox is set to Maker-provided credentials. What is the risk?',
      options: [
        'Everyone who chats can act with your access',
        'The tool stops working when you publish',
        'Users have to sign in twice for every message',
        'The agent can no longer use any knowledge',
      ],
      correctIndex: 0,
      explanation:
        'Maker-provided credentials run the tool with your access for everyone who chats with the agent.',
      sourceUrl: src.tools,
    },
    {
      id: 'm5-q18',
      type: 'multiple-choice',
      prompt: 'What is computer use, at an awareness level?',
      options: [
        'A tool that works apps and websites through their screen',
        'A setting that limits how many computers can chat',
        'A report showing which devices used the agent',
        'A way to install Copilot Studio on your own laptop',
      ],
      correctIndex: 0,
      explanation:
        'Computer use lets an agent work with apps and websites through their user interface, the way a person would.',
      sourceUrl: src.computerUse,
    },
    {
      id: 'm5-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You want the agent to create a ticket in a system that has a connector. Where do you start?',
      options: [
        'Add a tool and search for that connector',
        'Add the system’s website as a knowledge source',
        'Write a topic that tells users to email IT',
        'Ask your admin to turn on web search',
      ],
      correctIndex: 0,
      explanation:
        'Connectors are added as tools, which let the agent take actions such as creating a ticket.',
      sourceUrl: src.connectors,
    },
    {
      id: 'm5-q20',
      type: 'multiple-choice',
      prompt: 'Which of these is an example of a connector action?',
      options: [
        'Create an item in a SharePoint list',
        'Answer from an uploaded PDF file',
        'Greet the user when a chat starts',
        'Score answers against a test set',
      ],
      correctIndex: 0,
      explanation:
        'Connector actions do things in other systems, such as creating a SharePoint list item.',
      sourceUrl: src.connectors,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 6 — Work with multiple agents
  // ---------------------------------------------------------------------
  6: [
    {
      id: 'm6-q1',
      type: 'multiple-choice',
      prompt: 'What is a child agent?',
      options: [
        'A specialist agent that lives inside your agent',
        'A copy of your agent that you keep for testing',
        'A smaller agent that only works on the demo website',
        'A separate agent that answers from websites only',
      ],
      correctIndex: 0,
      explanation:
        'Child agents are specialists that live inside your agent, each with one narrow job.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q2',
      type: 'true-false',
      prompt:
        'You can connect to an existing Copilot Studio agent someone else built, instead of rebuilding it.',
      correct: true,
      explanation:
        'You can connect your agent to an existing Copilot Studio agent so it can hand work to it.',
      sourceUrl: src.connectedAgent,
    },
    {
      id: 'm6-q3',
      type: 'multiple-choice',
      prompt: 'What makes sure the parent agent routes a question to the right child agent?',
      options: [
        "A crisp, one-line description of the child agent's job",
        'The order in which you added the child agents to the parent',
        'The channel the parent is published to, such as Teams',
        'The model the parent uses, chosen in Settings',
      ],
      correctIndex: 0,
      explanation:
        'The parent reads each child agent’s description to route. A vague description means the wrong child agent answers.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q4',
      type: 'true-false',
      prompt:
        'One giant do-everything agent is easier to build, test, and trust than several specialists.',
      correct: false,
      explanation:
        'One giant do-everything agent gets messy. Specialists with clear jobs are easier to build, test, and trust.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q5',
      type: 'multiple-choice',
      prompt: 'What is an MCP server, at the awareness level covered here?',
      options: [
        'A standard plug for external tools',
        'A type of knowledge source for files',
        'A system topic that calls other agents',
        'An environment picker for admins',
      ],
      correctIndex: 0,
      explanation:
        'MCP (Model Context Protocol) servers give an agent tools from outside Copilot Studio through a standard connection.',
      sourceUrl: src.mcp,
    },
    {
      id: 'm6-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'One agent answers IT, HR, and facilities questions and keeps mixing them up. Which structure fixes this?',
      options: [
        'Specialist child agents with narrow jobs and clear descriptions',
        'One much longer set of instructions that covers all three areas',
        'Three copies of the same agent, one published per department',
        'Removing the knowledge sources so it answers from the model only',
      ],
      correctIndex: 0,
      explanation:
        'Split the work into specialists with clear jobs. The parent routes to each one by its description.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q7',
      type: 'multiple-choice',
      prompt: 'What is the difference between a child agent and a connected agent?',
      options: [
        'A child agent lives inside yours; a connected agent is separate, often built by others',
        'A child agent is always published; a connected agent stays in draft until you publish it',
        'They are two names for the same thing, used in different parts of Copilot Studio',
        'A connected agent can only answer from websites; a child agent can use any knowledge',
      ],
      correctIndex: 0,
      explanation:
        'Child agents live inside your agent. Connected agents are separate agents your agent can hand work to.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Another team already runs a Copilot Studio agent for travel policy questions. Your agent needs that expertise. What is the best option?',
      options: [
        'Connect to their existing agent',
        'Rebuild their agent as a child agent',
        'Copy their knowledge files into your agent',
        'Ask users to switch agents themselves',
      ],
      correctIndex: 0,
      explanation:
        'Connecting to an existing agent reuses the other team’s work and keeps one owner for that knowledge.',
      sourceUrl: src.connectedAgent,
    },
    {
      id: 'm6-q9',
      type: 'multiple-choice',
      prompt: 'What must a child agent have before you can save it?',
      options: ['A description', 'A published channel', 'A connector', 'A test set'],
      correctIndex: 0,
      explanation:
        'The description is required. Routing depends on a crisp one-line description of the child agent’s job.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Two child agents have the descriptions "Helps with questions" and "Answers questions". What is likely to happen?',
      options: [
        'The parent cannot tell them apart, so the wrong one may answer',
        'The parent asks the user to choose between them every time',
        'Both child agents answer every question at the same time',
        'Nothing, because descriptions do not affect routing at all',
      ],
      correctIndex: 0,
      explanation:
        'Routing depends on descriptions. Two vague, similar descriptions give the parent nothing to choose between.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q11',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your "Expenses" child agent has the whole HR handbook added as knowledge. What is the problem?',
      options: [
        'It should only have the knowledge its narrow job needs',
        'Child agents cannot have knowledge',
        'The handbook must be uploaded to the parent twice',
        'There is no problem; more knowledge is always better',
      ],
      correctIndex: 0,
      explanation:
        'Give each child agent only the knowledge and tools it needs, so it stays focused on its job.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q12',
      type: 'true-false',
      prompt: 'MCP lets an agent use tools from an external server through a standard connection.',
      correct: true,
      explanation:
        'MCP is a standard way to plug external tools into an agent, so one server can serve many agents.',
      sourceUrl: src.mcp,
    },
    {
      id: 'm6-q13',
      type: 'order',
      prompt: 'Put the steps for adding a child agent in the order they happen.',
      steps: [
        'Write its one-line description',
        'Add only the knowledge and tools it needs',
        'Ask a question that should route to it',
        'Create the child agent from the Agents tab',
      ],
      correctOrder: [3, 0, 1, 2],
      explanation:
        'Create it, give it the required description, add what it needs, then test that questions route to it.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q14',
      type: 'multiple-choice',
      prompt: 'Why are specialist agents easier to trust than one big agent?',
      options: [
        'Each has a clear job you can test on its own',
        'They use a newer model than a single large agent',
        'They do not need descriptions, so there is less to get wrong',
        'They skip evaluation because each one is so small',
      ],
      correctIndex: 0,
      explanation:
        'A specialist with one clear job is easier to test, so you can be confident it does that job well.',
      sourceUrl: src.otherAgents,
    },
    {
      id: 'm6-q15',
      type: 'true-false',
      prompt: "A child agent can only use the parent agent's knowledge, not knowledge of its own.",
      correct: false,
      explanation:
        'A child agent can have its own instructions, knowledge, and tools, chosen for its narrow job.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q16',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your parent agent keeps answering travel questions itself instead of using the Travel child agent. What do you fix first?',
      options: [
        'The child agent’s description, so it says what it handles',
        'The parent’s model, by switching to a preview one',
        'The channel, by moving the agent to Teams',
        'The environment, by moving everything to Test',
      ],
      correctIndex: 0,
      explanation:
        'The parent routes to a child agent based on its description, so make it say clearly what the child handles.',
      sourceUrl: src.childAgent,
    },
    {
      id: 'm6-q17',
      type: 'multiple-choice',
      prompt: 'What is a connected agent?',
      options: [
        'A separate, existing agent yours can call',
        'A child agent that lives inside your agent',
        'An agent that only runs in Microsoft Teams',
        'A backup copy made when you publish',
      ],
      correctIndex: 0,
      explanation:
        'A connected agent is a separate agent, often built and published by someone else, that your agent can hand work to.',
      sourceUrl: src.connectedAgent,
    },
    {
      id: 'm6-q18',
      type: 'multiple-choice',
      prompt: 'What is A2A (Agent2Agent), at an awareness level?',
      options: [
        'A standard way for agents to talk to other agents',
        'A billing plan that shares credits between agents',
        'A test method that compares two agents’ answers',
        'A channel that publishes agents to websites',
      ],
      correctIndex: 0,
      explanation:
        'Agent2Agent (A2A) is an open protocol that lets your agent connect to agents built elsewhere.',
      sourceUrl: src.a2a,
    },
    {
      id: 'm6-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your company already has an agent built in Microsoft Foundry. How can your Copilot Studio agent use it?',
      options: [
        'Connect it as another agent',
        'Rebuild it as a topic',
        'Upload it as a knowledge file',
        'Add it as a suggested prompt',
      ],
      correctIndex: 0,
      explanation:
        'You can connect a Microsoft Foundry agent to your Copilot Studio agent instead of rebuilding it.',
      sourceUrl: src.foundry,
    },
    {
      id: 'm6-q20',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'When does a child agent make more sense than a connected agent?',
      options: [
        'When only your agent needs it and you manage both',
        'When another team owns and publishes it separately',
        'When it has to be shared by many different agents',
        'When it runs in a different environment',
      ],
      correctIndex: 0,
      explanation:
        'Child agents live inside your agent and are managed with it. Connected agents are separate agents that can be reused and managed on their own.',
      sourceUrl: src.otherAgents,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 7 — Settings, orchestration & models
  // ---------------------------------------------------------------------
  7: [
    {
      id: 'm7-q1',
      type: 'multiple-choice',
      scenario: true,
      prompt: "A model is tagged 'preview'. Where can you use it?",
      options: [
        'Anywhere; preview models are fully supported',
        'In exploration only, never in production',
        'Only in the Production environment',
        'Only for autonomous agents',
      ],
      correctIndex: 1,
      explanation: 'Preview and experimental models are fine to explore, but never for production.',
      sourceUrl: src.previewModels,
    },
    {
      id: 'm7-q2',
      type: 'true-false',
      prompt: 'Your admin controls whether preview models appear at all in your environment.',
      correct: true,
      explanation:
        'Whether preview models appear is controlled by your admin, so do not assume they are available everywhere.',
      sourceUrl: src.previewModels,
    },
    {
      id: 'm7-q3',
      type: 'multiple-choice',
      prompt: 'What is the main trade-off when picking a primary model from the dropdown?',
      options: [
        'Reasoning depth vs speed vs cost',
        'Number of channels vs number of topics',
        'Knowledge sources vs tools',
        'Dev vs Test vs Production',
      ],
      correctIndex: 0,
      explanation:
        'Picking a primary model is a trade-off between reasoning depth, speed, and cost.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q4',
      type: 'multiple-choice',
      prompt: 'What are agent instructions, in plain terms?',
      options: [
        'The standing guidance your agent always follows',
        'A one-time setup checklist you follow when creating it',
        'A list of the connectors the agent is allowed to call',
        'The welcome message shown on the demo website',
      ],
      correctIndex: 0,
      explanation: 'Agent instructions are the standing guidance your agent always follows.',
      sourceUrl: src.orchestration,
    },
    {
      id: 'm7-q5',
      type: 'true-false',
      prompt:
        'Orchestration, generative responses, deep reasoning, and prompts can each have separate model settings.',
      correct: true,
      explanation:
        'Each of these can use its own model setting. Models tagged experimental, like preview ones, are for exploring only.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'An agent is switched from generative to classic orchestration. What changes?',
      options: [
        'Topics start from trigger phrases, not from their descriptions',
        'The agent loses its knowledge sources and must be re-grounded',
        'The agent moves to a different environment set up for classic',
        'Nothing changes for users; only the Settings page looks different',
      ],
      correctIndex: 0,
      explanation:
        'With generative orchestration, the agent picks topics, tools, and knowledge by their descriptions. Classic orchestration relies on trigger phrases.',
      sourceUrl: src.orchestration,
    },
    {
      id: 'm7-q7',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your manager wants a model tagged Experimental in the agent your whole department uses. What do you recommend?',
      options: [
        'Try it in DEV only; experimental models are not for production',
        "Switch the department's agent to it straight away, then monitor",
        'Use it in production only for questions that are low risk',
        'Let users vote on it in Teams before switching over',
      ],
      correctIndex: 0,
      explanation:
        'Preview and experimental tags mean not for production. Try them in DEV and keep real agents on a supported model.',
      sourceUrl: src.previewModels,
    },
    {
      id: 'm7-q8',
      type: 'multiple-choice',
      prompt: 'Why write down the current orchestration mode and model before changing anything?',
      options: [
        'It is a safe baseline to compare against or go back to',
        'Copilot Studio asks for it before it lets you save changes',
        'Writing it down turns on analytics for the old settings',
        'It is needed to publish the agent after you change the model',
      ],
      correctIndex: 0,
      explanation:
        'Recording the current settings gives you a known-good baseline, so a change is a choice you can undo, not an accident.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q9',
      type: 'multiple-choice',
      prompt: 'Which setting decides who is allowed to use the agent?',
      options: ['Authentication', 'Orchestration', 'Suggested prompts', 'Topics'],
      correctIndex: 0,
      explanation: 'Authentication settings control who can use the agent and how they sign in.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm7-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent answers simple FAQ lookups well but slowly. Which trade-off might you revisit, after testing in DEV?',
      options: [
        'A faster model, accepting less reasoning depth',
        'More knowledge sources, so it finds answers sooner',
        'A different environment with more capacity',
        'Turning off authentication to skip the sign-in step',
      ],
      correctIndex: 0,
      explanation:
        'Model choice trades reasoning depth against speed and cost. Simple lookups may not need the deepest reasoning.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q11',
      type: 'true-false',
      prompt:
        'The models in the dropdown change over time, so check the dropdown instead of memorizing a list.',
      correct: true,
      explanation:
        'Microsoft adds and retires models regularly. The dropdown always shows what is available to you now.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q12',
      type: 'multiple-choice',
      prompt: "Where do you choose the agent's primary model?",
      options: [
        'In the model dropdown on the Overview page',
        'On the Channels page, next to the Teams tile',
        'In the test pane, before you ask a question',
        "In Power Apps, on the agent's solution page",
      ],
      correctIndex: 0,
      explanation:
        'The model dropdown sits on the Overview page under "Select your agent’s model".',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q13',
      type: 'multiple-choice',
      prompt: 'What does the Allow ungrounded responses setting affect?',
      options: [
        "Whether it may answer from the model's own knowledge alone",
        'Which environment the agent is allowed to publish from',
        'Who is allowed to chat with the agent once it is shared',
        'How many topics the agent can run in one conversation',
      ],
      correctIndex: 0,
      explanation:
        'Allow ungrounded responses (older screens: use general knowledge) decides whether the agent may answer from the model’s general knowledge when it used no knowledge source or tool.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm7-q14',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        "Your prompt tool works better with a different model from the agent's main one. Can you do that?",
      options: [
        'Yes, prompts have their own model setting',
        'No, every part of an agent must use one model',
        'Only after publishing',
        'Only in the Production environment',
      ],
      correctIndex: 0,
      explanation:
        'Prompts have their own model settings, separate from the agent’s primary model.',
      sourceUrl: src.promptModels,
    },
    {
      id: 'm7-q15',
      type: 'order',
      prompt: 'Put the steps for safely trying a new model in order.',
      steps: [
        'Compare the results against your baseline',
        'Write down the current model and orchestration mode',
        'Try the new model on your practice agent in DEV',
        'Decide whether to keep it before anything reaches production',
      ],
      correctOrder: [1, 2, 0, 3],
      explanation:
        'Record the baseline, try the change in DEV, compare against the baseline, and only then decide.',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q16',
      type: 'multiple-choice',
      prompt:
        'Copilot Studio upgraded your agent from a retired model. How long can "Continue using retired models" keep the old one?',
      options: ['Up to 30 days', 'Up to 7 days', 'Up to 1 year', 'Forever, until you change it'],
      correctIndex: 0,
      explanation:
        'Continue using retired models keeps the old model for up to 30 days after an automatic upgrade, for models that offer the extension.',
      sourceUrl: src.retiredModel,
    },
    {
      id: 'm7-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'A model your agent uses retires next month. What is the safest plan?',
      options: [
        'Test the replacement model with your test set before the date',
        'Do nothing, because the 30-day setting keeps the old model forever',
        'Pick a preview model so the agent never has to change',
        'Turn off orchestration until the retirement date passes',
      ],
      correctIndex: 0,
      explanation:
        'Treat a model change like a release: evaluate the new model, adjust instructions, and only then rely on it.',
      sourceUrl: src.modelLifecycle,
    },
    {
      id: 'm7-q18',
      type: 'multiple-choice',
      prompt: 'Where do you set content moderation for the whole agent?',
      options: [
        'Settings > Generative AI',
        'Settings > Security',
        'The Channels page',
        'Power Platform admin center',
      ],
      correctIndex: 0,
      explanation:
        'Agent-level content moderation is in the Generative AI settings. A generative answers node can override it for one topic.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm7-q19',
      type: 'multiple-choice',
      prompt: 'What is the default content moderation level for an agent’s generated answers?',
      options: ['High', 'Lowest', 'Moderate', 'Off'],
      correctIndex: 0,
      explanation:
        'The default is High. Lower levels let more answers through, including potentially harmful ones. (Prompts in prompt builder default to Moderate.)',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm7-q20',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Moderation is High for the agent, but one topic’s generative answers node is set to Moderate. Which applies in that topic?',
      options: [
        'The topic’s setting',
        'The agent’s setting',
        'Whichever is stricter',
        'Neither, moderation turns off',
      ],
      correctIndex: 0,
      explanation:
        'At runtime the topic-level setting takes precedence. Without one, the agent-level setting applies.',
      sourceUrl: src.knowledge,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 8 — Test, activity & evaluation
  // ---------------------------------------------------------------------
  8: [
    {
      id: 'm8-q1',
      type: 'multiple-choice',
      prompt: 'What does the activity map show you?',
      options: [
        'Which knowledge, tools, and topics the agent picked, and why',
        "The agent's licensing tier and the credits each answer used",
        'The list of channels the agent is connected to, with links',
        "The environment's data policy and which connectors it blocks",
      ],
      correctIndex: 0,
      explanation:
        'The activity map shows which knowledge, tools, and topics the agent picked for an answer, and why.',
      sourceUrl: src.testPane,
    },
    {
      id: 'm8-q2',
      type: 'true-false',
      prompt: "'It seemed fine when I tried it' counts as testing an agent.",
      correct: false,
      explanation:
        "'It seemed fine when I tried it' is not testing. A repeatable test set is how you know the agent works.",
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q3',
      type: 'multiple-choice',
      prompt: 'What is a test set?',
      options: [
        'Realistic questions paired with expected answers',
        'A list of connectors the agent is allowed to use',
        'A group of child agents that are tested together',
        'The pre-publish checklist, written as questions',
      ],
      correctIndex: 0,
      explanation:
        'A test set pairs realistic, made-up questions with expected answers so you can check the agent the same way every time.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q4',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your new test set has an expected answer for every question. Which test methods fit best?',
      options: [
        'Answer quality plus Meaning match',
        'Exact match only, so wording must be identical',
        'Content safety only, since it checks every answer',
        'Tool use only, because it covers knowledge too',
      ],
      correctIndex: 0,
      explanation:
        'Answer quality scores how good each answer is overall, and every test set starts with it. Meaning match checks each answer against the one you expect, which fits when you have expected answers.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q5',
      type: 'order',
      prompt: 'Put the improvement loop in the correct order.',
      steps: [
        'Re-run the evaluation and compare results',
        'Fix the description or instructions behind your worst-scoring answer',
        'Find your worst-scoring answer in the results',
        'Run an evaluation on your test set',
      ],
      correctOrder: [3, 2, 1, 0],
      explanation:
        'Run an evaluation, find the worst-scoring answer, fix what is behind it, then re-run and compare.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm8-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'The test pane gave a wrong answer. Where do you see which knowledge, tool, or topic the agent used for it?',
      options: ['The activity map', 'The Channels page', 'The environment menu', 'The solution'],
      correctIndex: 0,
      explanation:
        'The activity map traces each step behind an answer, so you can see what the agent picked and why.',
      sourceUrl: src.testPane,
    },
    {
      id: 'm8-q7',
      type: 'multiple-choice',
      prompt: 'What makes a good test set question?',
      options: [
        'A realistic question users would ask, with its answer',
        'A question only you would ask, to catch edge cases',
        'A question with no right answer, to see how it copes',
        'The same question repeated ten times to check consistency',
      ],
      correctIndex: 0,
      explanation:
        'Realistic, made-up questions like the ones users would ask test what people will actually ask, without using real data.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        "You changed the instructions to fix one bad answer. How do you check you didn't break the others?",
      options: [
        'Re-run the whole test set and compare with the last run',
        'Ask the fixed question once in the test pane and move on',
        'Publish it and wait to see whether anyone complains',
        'Check the environment name, then publish the change',
      ],
      correctIndex: 0,
      explanation:
        'Re-running the full test set and comparing shows whether the fix helped without hurting other answers.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm8-q9',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'Your evaluation run finished with mixed results. Which answer do you open first?',
      options: [
        'The worst-scoring answer',
        'The best-scoring answer',
        'The first answer in the list',
        'None; mixed results are fine',
      ],
      correctIndex: 0,
      explanation: 'Start with the worst-scoring answer. It shows you the biggest thing to fix.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm8-q10',
      type: 'true-false',
      prompt: 'You should run an evaluation before every publish.',
      correct: true,
      explanation: 'Nothing ships untested: evaluation before publishing, every time.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q11',
      type: 'multiple-choice',
      prompt: 'Why use a saved test set instead of chatting with the agent each time?',
      options: [
        'The same questions every run let you compare results',
        'Test sets make the agent answer faster once published',
        'Chatting with the agent in the test pane is not allowed',
        'Test sets publish the agent automatically when they pass',
      ],
      correctIndex: 0,
      explanation:
        'A repeatable test set asks the same questions every run, so you can see whether a change made things better or worse.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q12',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'Your test set has three questions, all written by you. What is wrong with it?',
      options: [
        'It is too small and may not reflect what users ask',
        'Nothing; three questions are enough if you wrote them',
        'It should only contain questions with yes or no answers',
        'Test sets must be written by an admin, not by makers',
      ],
      correctIndex: 0,
      explanation:
        'The minimum bar is 10 questions, written to sound like what users really ask. Make them up; never paste real customer or employee data.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q13',
      type: 'multiple-choice',
      prompt: 'What is the test pane for?',
      options: [
        'Chatting with the agent as you build, and seeing which topic runs',
        'Publishing the agent to the demo website once it is ready',
        'Switching between DEV, Test, and Production while you work',
        'Viewing the weekly analytics for sessions and escalation',
      ],
      correctIndex: 0,
      explanation:
        'The test pane lets you try the agent as you build and track which topic is running.',
      sourceUrl: src.testPane,
    },
    {
      id: 'm8-q14',
      type: 'true-false',
      prompt: 'A failed test case is useful because it shows you what to fix.',
      correct: true,
      explanation:
        'Failures point straight at the knowledge, description, or instruction that needs work.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm8-q15',
      type: 'order',
      prompt: 'Put the steps for creating and running a test set in order.',
      steps: [
        'Run the evaluation',
        'Add 10 realistic questions with expected answers',
        'Create a new test set with a name and description',
        'Read the results question by question',
      ],
      correctOrder: [2, 1, 0, 3],
      explanation:
        'Create the test set, fill it with realistic questions and expected answers, run it, then read the results.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q16',
      type: 'multiple-choice',
      prompt: 'What two kinds of test set can you create for an evaluation?',
      options: [
        'Single response and conversation (multi-turn)',
        "Draft and published, matching the agent's state",
        'Manual and automatic, depending on who runs them',
        'Internal and external, depending on the audience',
      ],
      correctIndex: 0,
      explanation:
        'A single response test checks one question and answer. A conversation test checks how the agent handles several turns.',
      sourceUrl: src.multiTurn,
    },
    {
      id: 'm8-q17',
      type: 'multiple-choice',
      prompt: 'Which four things does Answer quality check?',
      options: [
        'Relevance, groundedness, completeness, and abstention',
        'Speed, cost, answer length, and tone of voice',
        'Spelling, grammar, formatting, and politeness',
        'Citations, keywords, exact wording, and tools used',
      ],
      correctIndex: 0,
      explanation:
        'Answer quality checks relevance, groundedness, completeness, and abstention. An answer must pass all four to be high quality.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q18',
      type: 'multiple-choice',
      prompt: 'What does the Content safety test method check?',
      options: [
        'Whether answers contain the harmful content you pick',
        'Whether answers quote your knowledge sources correctly',
        'Whether the agent is safe to publish to Teams',
        'Whether users are signed in before chatting',
      ],
      correctIndex: 0,
      explanation:
        'Content safety fails any answer with harmful content of the selected type: violent, hateful, self-harm, or sexual.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your agent should politely refuse salary questions, but Answer quality keeps flagging those refusals. What do you do?',
      options: [
        'Add a Custom test method that describes the expected refusal',
        'Delete those questions so the test set always passes',
        'Turn content moderation down to Lowest for those answers',
        'Switch every question in the test set to Exact match',
      ],
      correctIndex: 0,
      explanation:
        'Answer quality checks whether the agent tried to answer, so it can flag a correct refusal. A Custom method with your own criteria can treat the refusal as a pass.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q20',
      type: 'multiple-choice',
      prompt: 'What is the difference between content safety and content moderation?',
      options: [
        'Safety is a test; moderation filters live answers',
        'They are two names for exactly the same setting',
        'Safety is for Teams; moderation is for websites',
        'Moderation is a test; safety filters live answers',
      ],
      correctIndex: 0,
      explanation:
        'Content safety is a test method in evaluation. Content moderation is the setting that filters answers while people chat.',
      sourceUrl: src.evalOverview,
    },
    {
      id: 'm8-q21',
      type: 'multiple-choice',
      prompt: 'Which test methods need an expected answer on every question?',
      options: [
        'Meaning match, Text match, and Exact match',
        'Answer quality, Content safety, and Custom',
        'Keyword match, Tool use, Answer quality, and Custom',
        'Only Answer quality',
      ],
      correctIndex: 0,
      explanation:
        'Meaning match, Text match, and Exact match compare the agent’s answer with the one you expect, so each question needs one.',
      sourceUrl: src.evalOverview,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 9 — Channels & publishing
  // ---------------------------------------------------------------------
  9: [
    {
      id: 'm9-q1',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'You fixed a typo in the instructions but users still see old behavior. Why?',
      options: [
        "The fix didn't save",
        'Changes stay in draft until you publish again',
        'The agent needs to be rebuilt from scratch to pick it up',
        "Typos can't be fixed after publishing",
      ],
      correctIndex: 1,
      explanation:
        'Nothing is live until you publish. Changes stay in draft on purpose, so a fix needs a new publish before users see it.',
      sourceUrl: src.publish,
    },
    {
      id: 'm9-q2',
      type: 'true-false',
      prompt: 'The demo website channel is meant for stakeholder review before broad rollout.',
      correct: true,
      explanation: 'Use the demo website for stakeholder review before broad rollout.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm9-q3',
      type: 'multiple-choice',
      prompt:
        "What does deploying to Teams + Microsoft 365 for your whole organization need that the demo website doesn't?",
      options: [
        'An admin approval step',
        'A new environment',
        'A separate knowledge source',
        'A different model',
      ],
      correctIndex: 0,
      explanation:
        'To make the agent available to your organization, submit it for admin approval so it appears under Built for your org in the Teams app store.',
      sourceUrl: src.teams,
    },
    {
      id: 'm9-q4',
      type: 'true-false',
      prompt:
        'The pre-publish checklist includes checking the sign-in setting before you share the agent.',
      correct: true,
      explanation:
        'The pre-publish checklist is: right environment, knowledge verified, evaluation passed, sign-in checked, right channel.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q5',
      type: 'order',
      prompt:
        'Put the pre-publish checks in the order you would do them. Each check depends on the one before it.',
      steps: [
        'Right channel',
        'Evaluation passed',
        'Sign-in checked',
        'Right environment',
        'Knowledge verified',
      ],
      correctOrder: [3, 4, 1, 2, 0],
      explanation:
        'First make sure you are publishing the right agent from the right environment. Verify its knowledge, because the evaluation depends on it. Pass the evaluation, check who will be able to chat with the agent, then choose the channel.',
      sourceUrl: src.publish,
    },
    {
      id: 'm9-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You published yesterday, then edited the instructions today without publishing. What do users see?',
      options: [
        "Yesterday's published version",
        "Today's edits, as soon as you save",
        "A mix of yesterday's and today's changes",
        'Nothing; the agent goes offline',
      ],
      correctIndex: 0,
      explanation:
        'Users see the last published version. Your edits stay in draft until you publish again.',
      sourceUrl: src.publish,
    },
    {
      id: 'm9-q7',
      type: 'multiple-choice',
      prompt: 'Which channel puts the agent where people already work every day?',
      options: [
        'Teams + Microsoft 365',
        'The demo website you share',
        'The test pane',
        'The Overview page',
      ],
      correctIndex: 0,
      explanation:
        'Teams + Microsoft 365 bring the agent into the apps people already use at work.',
      sourceUrl: src.teams,
    },
    {
      id: 'm9-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'After publishing, the Demo website tile is still missing from the Channels page. What should you do?',
      options: [
        'Ask your admin; the channel may be off in your environment',
        'Delete the agent and start again in a new solution',
        'Switch to a preview model, which enables more channels',
        'Add more knowledge so the channel has something to show',
      ],
      correctIndex: 0,
      explanation:
        'If a channel is missing after publishing, it may be turned off in your environment. Your admin can check.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm9-q9',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Before sharing your demo website link, you find an uploaded file with a customer price list in your practice agent. What do you do?',
      options: [
        'Remove the file before you switch to No authentication',
        'Keep it; uploaded files only answer signed-in people',
        'Keep it; the demo website never shows file content',
        'Rename the file so nobody recognizes what it holds',
      ],
      correctIndex: 0,
      explanation:
        'Uploaded files need no sign-in, so with No authentication anyone who has the link can get answers from them. Confidential files never belong in a practice agent: remove it first.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm9-q10',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You set your practice agent to No authentication so the demo website works. Who can chat with it?',
      options: [
        'Anyone who has the link, inside or outside the company',
        "Only people in your DEV environment's security group",
        'Only colleagues signed in with a Digital Realty account',
        'Only the people you shared the agent with in Copilot Studio',
      ],
      correctIndex: 0,
      explanation:
        "With No authentication, anyone who has the link can chat with the agent, and you can't control which users do. Check what the agent can reveal before you share the link.",
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q11',
      type: 'multiple-choice',
      prompt: 'What does single sign-on give users of an agent in Teams?',
      options: [
        'They do not have to sign in again separately to use the agent',
        'They can edit the agent from inside Teams without a license',
        'They see your draft changes before you publish them',
        'They skip the admin approval step for organization-wide use',
      ],
      correctIndex: 0,
      explanation:
        'Single sign-on uses the account people are already signed in with, so they are not asked to sign in again.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q12',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'On launch day, your evaluation still fails two test cases. What do you do?',
      options: [
        'Fix them and re-run the evaluation before publishing',
        'Publish anyway and fix the two failures in the next update',
        'Delete the two failing test cases so the run passes',
        'Publish only to Teams, where fewer people will notice',
      ],
      correctIndex: 0,
      explanation:
        '"Evaluation passed" is on the pre-publish checklist. Fix the failures, re-run, then publish.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm9-q13',
      type: 'multiple-choice',
      prompt: 'What is the difference between the demo website and a live website?',
      options: [
        'Demo is for review; a live website is the real channel once ready',
        'There is no difference; they are two names for the same page',
        'The live website is only for admins; the demo is for everyone',
        'The demo website runs a different agent, built just for demos',
      ],
      correctIndex: 0,
      explanation:
        'Share the demo website for feedback first. A live website is where the finished agent meets its users.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm9-q14',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You want your agent to appear in the Teams app store for everyone in your organization. What extra step is needed?',
      options: [
        'Submit it for admin approval',
        'Publish it twice, a day apart',
        'Move it to the Default environment',
        'Share the demo website link',
      ],
      correctIndex: 0,
      explanation:
        'After an admin approves it, the agent appears under Built for your org in the Teams app store and Built by your org in the Microsoft 365 Agent Store.',
      sourceUrl: src.teams,
    },
    {
      id: 'm9-q15',
      type: 'multiple-choice',
      prompt: 'Why is it helpful that publishing is a separate, deliberate step?',
      options: [
        'You decide exactly when users see changes',
        'It makes the agent run faster for users',
        'It removes the need to test before release',
        'It lets users edit the agent while it is live',
      ],
      correctIndex: 0,
      explanation:
        "Nothing is live until you publish. That's a feature: you decide exactly when users see changes.",
      sourceUrl: src.publish,
    },
    {
      id: 'm9-q16',
      type: 'multiple-choice',
      prompt: 'Which authentication option should you use for the Teams + Microsoft 365 channel?',
      options: [
        'Authenticate with Microsoft',
        'No authentication',
        'A shared password',
        'Manual authentication with a personal account',
      ],
      correctIndex: 0,
      explanation:
        'For publishing through the built-in Teams + Microsoft 365 channel, Learn recommends Authenticate with Microsoft.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You switched sign-in to Authenticate with Microsoft and saved, but the demo site still lets anyone chat. Why?',
      options: [
        'Sign-in changes apply only after you publish',
        'Sign-in takes a week to reach the demo site',
        'The demo site ignores every sign-in setting',
        'You must also turn off web search first',
      ],
      correctIndex: 0,
      explanation: 'Authentication changes take effect only after you publish the agent again.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q18',
      type: 'multiple-choice',
      prompt: 'Which channel lets a classmate try your agent from a link before a wide rollout?',
      options: [
        'The demo website',
        'Teams + Microsoft 365',
        'A custom live website',
        'The test pane',
      ],
      correctIndex: 0,
      explanation:
        'The demo website gives you a link for quick reviews. It isn’t meant for production use.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm9-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your demo site link, with No authentication on, was posted in a public forum by mistake. What is the quickest fix?',
      options: [
        'Turn on Authenticate with Microsoft and publish again',
        'Delete the forum post and change nothing else',
        'Rename the agent so the old link stops working',
        'Switch the agent to classic orchestration',
      ],
      correctIndex: 0,
      explanation:
        'With No authentication, anyone with the link can chat. Requiring sign-in, then publishing, closes it.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm9-q20',
      type: 'multiple-choice',
      prompt: 'What should you check about tools before sharing an agent?',
      options: [
        'Whether any use Maker-provided credentials',
        'Whether each tool has its own custom icon',
        'Whether tools are listed in alphabetical order',
        'Whether every tool was added on the same day',
      ],
      correctIndex: 0,
      explanation:
        'Maker-provided credentials let everyone who chats act with your access, so check them before sharing.',
      sourceUrl: src.tools,
    },
    {
      id: 'm9-q21',
      type: 'multiple-choice',
      prompt: 'Which three things does the sign-in check before sharing cover?',
      options: [
        'Sign-in setting, uploaded files, and tool credentials',
        'Model, orchestration mode, and moderation level',
        'Channels, analytics, and weekly review owner',
        'Topic names, trigger phrases, and variables',
      ],
      correctIndex: 0,
      explanation:
        'Before sharing, check who can chat (sign-in), what they could reach (uploaded files), and whose access tools use (credentials).',
      sourceUrl: src.authentication,
    },
  ],
  // ---------------------------------------------------------------------
  // Module 10 — Monitor & improve
  // ---------------------------------------------------------------------
  10: [
    {
      id: 'm10-q1',
      type: 'multiple-choice',
      prompt: 'Which numbers does the Monitor page summary track?',
      options: [
        'Sessions, engagement, resolution, and escalation',
        'Licensing tier, Copilot Credits used, and remaining quota',
        'Usage in DEV, Test, and Production, side by side',
        'Knowledge sources, connectors, and their error counts',
      ],
      correctIndex: 0,
      explanation:
        'The Monitor page summary covers sessions, engagement, resolution, and escalation.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q2',
      type: 'true-false',
      prompt: 'Publishing an agent is the finish line; no further review is needed.',
      correct: false,
      explanation:
        "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy and improving.",
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q3',
      type: 'multiple-choice',
      prompt: 'About how long should the simple weekly review take?',
      options: [
        'About 15 minutes',
        'A full working day',
        'About 3 hours',
        "It isn't necessary weekly",
      ],
      correctIndex: 0,
      explanation: 'The weekly review is a short ritual of about 15 minutes.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q4',
      type: 'true-false',
      prompt: 'Autonomous agents have their own health view, separate from chat analytics.',
      correct: true,
      explanation:
        'Autonomous agents run on triggers rather than chats, so their health is analyzed separately.',
      sourceUrl: src.health,
    },
    {
      id: 'm10-q5',
      type: 'multiple-choice',
      prompt: 'What should the weekly ritual cover?',
      options: [
        "What to check, what 'bad' looks like, and who to tell",
        'Rewriting every topic from scratch with fresh wording',
        'Switching environments to compare DEV with Production',
        'Re-licensing the agent and checking Copilot Credits',
      ],
      correctIndex: 0,
      explanation:
        "The weekly ritual covers what to check, what 'bad' looks like, and who to tell.",
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt: "Your agent's escalation rate jumped this week. What is a good first step?",
      options: [
        'Review the escalated conversations to see what is failing',
        'Turn off escalation so conversations stay with the agent',
        'Switch to a preview model that escalates less often',
        'Wait a month and see whether the rate settles by itself',
      ],
      correctIndex: 0,
      explanation:
        'Escalations show where the agent could not help. The conversations behind them tell you what to fix.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q7',
      type: 'multiple-choice',
      prompt: 'What does the resolution number tell you?',
      options: [
        'How often conversations ended with the question resolved',
        'How many knowledge sources the agent searched per answer',
        'How fast the model responds, averaged over the week',
        'How many makers edited the agent during the period',
      ],
      correctIndex: 0,
      explanation:
        'Resolution shows how often the agent resolved what the user came for, which is a core health signal.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your weekly review shows that answers from one SharePoint library are out of date. Who do you tell?',
      options: [
        'The owner of that content, so the source gets fixed',
        'Nobody; the agent updates its own sources over time',
        'Every user of the agent, so they know to double-check',
        'Only the Copilot Studio support team at Microsoft',
      ],
      correctIndex: 0,
      explanation:
        'Part of the weekly ritual is knowing who to tell. Out-of-date answers need the content owner to update the source.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q9',
      type: 'multiple-choice',
      prompt: 'For a weekly review, which period of analytics should you look at?',
      options: ['The last 7 days', 'Since the agent was created', 'Today only', 'The last year'],
      correctIndex: 0,
      explanation: 'A weekly review looks at the last 7 days, so each week builds on the last.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q10',
      type: 'true-false',
      prompt: 'Analytics are only useful for agents with problems.',
      correct: false,
      explanation:
        'Analytics also show what is working well and where to improve next, even for healthy agents.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q11',
      type: 'multiple-choice',
      prompt: 'What is the purpose of the weekly review?',
      options: [
        'Catch problems early and keep improving a live agent',
        'Rebuild the agent each week with the latest features',
        'Move the agent to a new environment once a week',
        'Reset the analytics so each week starts clean',
      ],
      correctIndex: 0,
      explanation:
        'A short, regular review catches problems before they grow and keeps the agent improving.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q12',
      type: 'order',
      prompt: 'Put the steps of the weekly review in order.',
      steps: [
        'Name one thing to improve',
        "Open the agent's Monitor page",
        'Set the date range to the last 7 days',
        'Read sessions, engagement, resolution, and escalation',
      ],
      correctOrder: [1, 2, 3, 0],
      explanation:
        'Open the Monitor page, set the week, read the numbers, then decide on one improvement.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q13',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You fixed a topic after this week’s review. What must happen before users see the fix?',
      options: [
        'Publish the agent again',
        'Nothing; edits go live immediately',
        'Create a new environment',
        'Delete the old topic',
      ],
      correctIndex: 0,
      explanation:
        'Changes stay in draft until you publish, so the fix reaches users only after you publish again.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q14',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A live agent shows no sessions at all in the last 7 days. What is a sensible first question?',
      options: [
        'Is it published to a channel people actually use?',
        'Does it need a preview model to record sessions?',
        'Should it have more child agents to share the load?',
        'Is the test pane open while people are chatting?',
      ],
      correctIndex: 0,
      explanation:
        'No sessions usually means people cannot reach the agent. Check where it is published and whether users know about it.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q15',
      type: 'true-false',
      prompt: 'The weekly review should include who to tell when something looks bad.',
      correct: true,
      explanation:
        'Knowing who to tell turns a finding into a fix, which is why it is part of the ritual.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm10-q16',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You chatted with your practice agent in the test pane 20 times, but the Monitor page shows no sessions. Why?',
      options: [
        'Test pane conversations are not included in analytics',
        'Analytics take a full month before anything appears',
        'You need a preview model before analytics are recorded',
        'The agent has too much knowledge for analytics to load',
      ],
      correctIndex: 0,
      explanation:
        'The Monitor page only covers real conversations. Activity in the test pane never shows up, so review a published agent.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm10-q17',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your manager wants to watch your agent’s numbers each week but must not change anything. What do you do?',
      options: [
        'Share it with the Analytics Viewer role',
        'Share it with them as an editor',
        'Send screenshots of the Monitor page',
        'Give them your Copilot Studio login',
      ],
      correctIndex: 0,
      explanation:
        'The Analytics Viewer role gives read-only access to the agent’s analytics, without edit rights. Never share your own login.',
      sourceUrl: src.shareAnalytics,
    },
    {
      id: 'm10-q18',
      type: 'multiple-choice',
      prompt: 'What can someone with the Analytics Viewer role do?',
      options: [
        'See the Monitor page only',
        'Edit topics but not publish',
        'Publish but not edit topics',
        'Share the agent with others',
      ],
      correctIndex: 0,
      explanation:
        'Analytics Viewers see the agent’s analytics only. They can’t edit, test, publish, or share it.',
      sourceUrl: src.shareAnalytics,
    },
    {
      id: 'm10-q19',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your analyst has Analytics Viewer but can’t open the transcripts behind a metric. What else do they need?',
      options: [
        'The Bot Transcript Viewer security role',
        'The Environment Maker security role',
        'Editor rights on the agent',
        'A second Analytics Viewer role',
      ],
      correctIndex: 0,
      explanation:
        'Drill-downs into transcripts also need the Bot Transcript Viewer security role, which an admin grants for the environment.',
      sourceUrl: src.shareAnalytics,
    },
    {
      id: 'm10-q20',
      type: 'multiple-choice',
      prompt: 'Can you give the Analytics Viewer role to a group?',
      options: [
        'No, only to individual people',
        'Yes, to any Microsoft 365 group',
        'Yes, but only to admin groups',
        'Only to groups in Production',
      ],
      correctIndex: 0,
      explanation:
        'Agent owners can share the Analytics Viewer role with individuals only, not with groups.',
      sourceUrl: src.shareAnalytics,
    },
    {
      id: 'm10-q21',
      type: 'multiple-choice',
      prompt: 'How long are session details and transcripts available on the Monitor page?',
      options: ['The last 28 days', 'The last 7 days', 'The last 360 days', 'Forever'],
      correctIndex: 0,
      explanation:
        'Monitor data is kept for up to 360 days, but session details and transcripts only for the last 28 days.',
      sourceUrl: src.monitorOverview,
    },
  ],
}
