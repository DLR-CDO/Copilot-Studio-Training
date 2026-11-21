/**
 * Quiz banks, 15+ questions per module. The server draws 8 per attempt (see
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
        'Environments, licensing, Copilot Credits, and data policies',
        'Variables, conditions, citations, and evaluations',
        'Analytics, test sets, sessions, and escalations',
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
        'Open Settings and pick a model',
        'Make sure the DEV environment is selected',
        'Add a knowledge source',
        'Publish to the demo website',
      ],
      correctIndex: 1,
      explanation:
        'Before you do anything, make sure you are in the DEV environment. To change it, select the globe icon in the bottom left corner, above your name.',
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
        'A conversational agent',
        'A suggested prompt',
        'A system topic',
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
        'A solution makes the agent public',
        'A solution picks the best model automatically',
        'A solution turns on web search',
      ],
      correctIndex: 0,
      explanation:
        'A solution is the container that stores your agent and its parts, which is also how the agent later moves from Dev to Test to Production.',
      sourceUrl: src.solutions,
    },
    {
      id: 'm1-q8',
      type: 'multiple-choice',
      prompt: "What is an agent's description for?",
      options: [
        'People and other agents read it to decide when to use the agent',
        'It is the greeting users see first',
        'It sets which environment the agent lives in',
        'It lists the files the agent can search',
      ],
      correctIndex: 0,
      explanation:
        'The description says in one or two sentences what the agent does. People and other agents read it to decide when to use your agent.',
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
        'Create the agent now and move it later',
        'Ask users to test it in Production',
        'Ignore it; environments only matter when publishing',
      ],
      correctIndex: 0,
      explanation:
        'Agents are built in DEV. Check the globe icon in the bottom left corner and switch to DEV before you create anything.',
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
        'Questions about topics none of your files cover',
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
      prompt:
        'You have two agents: a broad company news agent, and an HR agent that handles salary questions. Which one is it reasonable to turn web search on for?',
      options: [
        'Only the company news agent',
        'Only the HR agent',
        'Both agents',
        'Neither; web search is never allowed',
      ],
      correctIndex: 0,
      explanation:
        'Turn on web search only for broad agents that do not handle confidential information. Salary questions are confidential.',
      sourceUrl: src.publicWebsite,
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
        'Instructions the agent always follows',
        'Questions in a test set',
        'Messages the agent sends when it fails',
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
      options: ['Tokens', 'Copilot Credits', 'Sessions', 'Licenses'],
      correctIndex: 1,
      explanation:
        'Agents are billed in Copilot Credits. They replaced messages as the billing unit on 1 September 2025.',
      sourceUrl: src.billing,
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
        'The agent was deleted automatically',
        'Agents live only in the environment where they were created',
        'The agent moved to Production automatically',
        'Your license expired',
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
        'The Channels page',
        'The globe icon in the bottom left corner, above your name',
        'The Settings page',
        'The Overview page',
      ],
      correctIndex: 1,
      explanation:
        'Select the globe icon in the bottom left corner, above your name, to open the Switch environment menu.',
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
        'The agent will run more slowly',
        'The agent will lose its model',
        'There is no risk if the change is small',
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
        'Only agents',
        'Only the model settings',
        'Only published channels',
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
        'Your agent has too many topics',
        'Preview models only appear after publishing',
        'You need to clear your browser cache',
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
        'The person who wrote the connector',
        'The users of your agent',
        'Nobody; the block is random',
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
        'Which connectors and capabilities agents in the environment may use',
        'How long each conversation can last',
        'Which model is the default',
        'The colours of the agent in Teams',
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
        'That the globe icon shows the DEV environment',
        'That the agent has been published',
        'That analytics show new sessions',
        'That the test pane is empty',
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
        'Checking the agent before real users see it in Production',
        'Building new ideas from scratch',
        'Storing old agents you no longer need',
        'Hosting the demo website only',
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
      prompt: 'The globe icon above your name shows the environment you are in right now.',
      correct: true,
      explanation:
        'The globe icon in the bottom left corner shows your current environment, and selecting it lets you switch.',
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
        'Your license expired',
        'An admin restricted that source type in the Power Platform admin center',
        'The agent is already published',
        'You picked the wrong model',
      ],
      correctIndex: 1,
      explanation:
        'Since October 2026, admins can restrict file uploads, SharePoint and OneDrive, or public websites as knowledge sources, separately or together.',
      sourceUrl: src.whatsNew,
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
        'Nothing; generative answers are always correct',
        "The citation, to confirm the answer actually came from the agent's knowledge",
        "The agent's badge name",
        'The number of tools connected',
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
        'The "use general knowledge" toggle controls whether the agent can answer beyond your connected knowledge sources.',
      correct: true,
      explanation: 'With general knowledge switched off, answers stick to your connected sources.',
      sourceUrl: src.knowledge,
    },
    {
      id: 'm3-q3',
      type: 'multiple-choice',
      prompt: 'Which of these is NOT a knowledge source?',
      options: ['SharePoint', 'Uploaded files', 'Public websites', 'A connected agent'],
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
        'The order sources were added',
        'The file size of the source',
        'The environment the agent is built in',
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
        'Checking whether an answer actually came from your knowledge is one of the skills this module builds.',
      sourceUrl: src.knowledgeTest,
    },
    {
      id: 'm3-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your HR agent keeps giving generic internet-style advice instead of quoting your policy documents. Which setting should you review first?',
      options: [
        'The "use general knowledge" toggle',
        'The environment name',
        'The demo website channel',
        'The suggested prompts',
      ],
      correctIndex: 0,
      explanation:
        'With general knowledge on, the agent can answer from the model’s own knowledge. Switch it off when answers must come only from your sources.',
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
        'Delete one of the libraries',
        'Rename the agent',
        'Add more suggested prompts',
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
        'Rate the answer for analytics',
        'Send the answer by email',
        'Publish the answer to Teams',
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
        'Add it as a tool',
        'Paste it into the description',
        'Add it as a child agent',
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
        'The answer may not have come from your knowledge sources, so check it before trusting it',
        'The answer is guaranteed to be correct',
        'The agent has been published',
        'The knowledge source has too many files',
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
      prompt: 'Which four sources does this module treat as the everyday starting points?',
      options: [
        'SharePoint, OneDrive, uploaded files, and public websites',
        'Outlook, Teams, Excel, and Planner',
        'Topics, tools, triggers, and channels',
        'Dev, Test, Production, and Default',
      ],
      correctIndex: 0,
      explanation:
        'SharePoint, OneDrive, uploaded files, and public websites are the everyday four. Other sources exist but are used less often here.',
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
        'Add the library as knowledge and switch off "use general knowledge"',
        'Add the library as a tool',
        'Turn on web search',
        'Write the policies into the suggested prompts',
      ],
      correctIndex: 0,
      explanation:
        'Adding the library grounds answers in it, and switching off general knowledge stops the agent answering from anywhere else.',
      sourceUrl: src.knowledge,
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
        'A connector to an external system',
        'The AI model behind a response',
        'A knowledge source type',
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
      prompt: "Which three nodes does this module call the 'everyday' building blocks of a topic?",
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
        "It stores the agent's model settings",
        'It connects the agent to SharePoint',
        'It publishes the agent to a channel',
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
        'Always, after every other branch',
        'Only when the user types "other"',
        'Only in the test pane',
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
        'Save the response in a clearly named variable, like SystemName',
        'Ask the same question again later',
        'Add the answer to the knowledge sources',
        'Write the answer into the agent description',
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
        'A scripted conversation path',
        'A container for agents and data',
        'A link back to a knowledge source',
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
        'Agent flows for multi-step automation are covered at an awareness level in this module.',
      correct: true,
      explanation: 'Agent flows for multi-step automation are introduced at an awareness level.',
      sourceUrl: src.agentFlows,
    },
    {
      id: 'm5-q5',
      type: 'multiple-choice',
      prompt: 'What is a prompt, as covered in this module?',
      options: [
        'Reusable AI instructions that can be added as a tool',
        'A knowledge source type',
        'A system topic',
        'An environment setting',
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
        'A connector tool, such as the Office 365 Outlook "Send an email" action',
        'A knowledge source with email templates',
        'A suggested prompt about email',
        'A new environment for email',
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
        "Rewrite the tool's description so it clearly says when to use it",
        'Add the tool a second time',
        'Switch to the Production environment',
        'Turn on web search',
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
        'A published demo website',
        'At least three topics',
        'A preview model',
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
        'You need the same "summarise this in three bullet points" instructions in several places. What fits best?',
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
        'Switching between environments',
        'Writing the agent description',
        'Storing knowledge files',
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
      prompt: 'Which of these is NOT a kind of tool covered in this module?',
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
        'A knowledge source type',
        'A channel for publishing',
        'A test set of questions',
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
        'The order the child agents were added',
        'The channel the parent is published to',
        'The model selected in Settings',
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
        'A type of knowledge source',
        'A system topic',
        'An environment picker',
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
        'One agent answers IT, HR, and facilities questions and keeps mixing them up. What structure does this module recommend?',
      options: [
        'Specialist child agents, each with a narrow job and a clear description',
        'One longer set of instructions',
        'Three copies of the same agent',
        'Removing all knowledge sources',
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
        'A child agent lives inside your agent; a connected agent is a separate agent, often built by someone else',
        'A child agent is always published; a connected agent never is',
        'They are two names for the same thing',
        'A connected agent can only answer from websites',
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
        'The parent asks the user to choose every time',
        'Both answer every question together',
        'Nothing; descriptions do not affect routing',
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
        'They use a different model',
        'They never need descriptions',
        'They skip evaluation',
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
        'A one-time setup checklist',
        'A list of connectors',
        'The demo website link',
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
        'Topics start from trigger phrases instead of the agent choosing them by description',
        'The agent loses all its knowledge',
        'The agent moves to a different environment',
        'Nothing changes for users',
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
        'Explore it in DEV only; experimental models are not for production',
        'Switch the production agent to it straight away',
        'Use it only on Fridays',
        'Ask users to vote on it',
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
        'It is a production-safe baseline you can compare against or return to',
        'Copilot Studio requires it before saving',
        'It turns on analytics',
        'It publishes the agent',
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
        'More knowledge sources',
        'A different environment',
        'Turning off authentication',
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
        'The models in the dropdown change over time, so check the dropdown instead of memorising a list.',
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
        'On the Channels page',
        'In the test pane',
        'In Power Apps Solutions',
      ],
      correctIndex: 0,
      explanation:
        'The model dropdown sits on the Overview page under "Select your agent’s model".',
      sourceUrl: src.selectModel,
    },
    {
      id: 'm7-q13',
      type: 'multiple-choice',
      prompt: 'What does the general-knowledge setting affect?',
      options: [
        "Whether the agent can answer from the model's own knowledge, beyond your sources",
        'Which environment the agent is in',
        'Who can use the agent',
        'How many topics the agent can have',
      ],
      correctIndex: 0,
      explanation:
        "With general knowledge on, the agent can answer from the model's own knowledge as well as your sources.",
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
        "The agent's licensing tier",
        'The list of connected channels',
        "The environment's data policy",
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
        'Real questions paired with expected answers',
        'A list of connectors',
        'A group of child agents',
        'The pre-publish checklist',
      ],
      correctIndex: 0,
      explanation:
        'A test set pairs real questions with expected answers so you can check the agent the same way every time.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q4',
      type: 'true-false',
      prompt: 'The minimum bar for a test set in this course is 10 real user questions.',
      correct: true,
      explanation:
        'The course sets a 10-question test set of real user questions as the minimum bar.',
      sourceUrl: src.evalCreate,
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
        'A real user question, with the answer you expect',
        'A question only you would ask',
        'A question with no right answer',
        'The same question repeated ten times',
      ],
      correctIndex: 0,
      explanation: 'Real user questions with expected answers test what people will actually ask.',
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
        'Ask the fixed question once in the test pane',
        'Publish and wait for complaints',
        'Check the environment name',
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
        'The same questions every run let you compare results over time',
        'Test sets make the agent faster',
        'Chatting with the agent is not allowed',
        'Test sets publish the agent automatically',
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
        'It is too small and does not use real user questions',
        'Nothing; three is enough',
        'It should only contain yes or no questions',
        'Test sets must be written by an admin',
      ],
      correctIndex: 0,
      explanation:
        'The minimum bar is 10 questions, and they should come from real users so they reflect what people really ask.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q13',
      type: 'multiple-choice',
      prompt: 'What is the test pane for?',
      options: [
        'Chatting with the agent while you build it, and seeing which topic runs',
        'Publishing the agent',
        'Switching environments',
        'Viewing weekly analytics',
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
        'Add 10 real questions with expected answers',
        'Create a new test set with a name and description',
        'Read the results question by question',
      ],
      correctOrder: [2, 1, 0, 3],
      explanation:
        'Create the test set, fill it with real questions and expected answers, run it, then read the results.',
      sourceUrl: src.evalCreate,
    },
    {
      id: 'm8-q16',
      type: 'multiple-choice',
      prompt: 'What two kinds of test set can you create for an evaluation?',
      options: [
        'Single response and conversation (multi-turn)',
        'Draft and published',
        'Manual and automatic',
        'Internal and external',
      ],
      correctIndex: 0,
      explanation:
        'A single response test checks one question and answer. A conversation test checks how the agent handles several turns.',
      sourceUrl: src.multiTurn,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 9 — Monitor & improve
  // ---------------------------------------------------------------------
  9: [
    {
      id: 'm9-q1',
      type: 'multiple-choice',
      prompt: 'Which numbers does the analytics summary track?',
      options: [
        'Sessions, engagement, resolution, and escalation',
        'Licensing, credits, and quotas',
        'Dev, Test, and Production usage',
        'Knowledge sources and connectors',
      ],
      correctIndex: 0,
      explanation: 'The analytics summary covers sessions, engagement, resolution, and escalation.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q2',
      type: 'true-false',
      prompt: 'Publishing an agent is the finish line; no further review is needed.',
      correct: false,
      explanation:
        "Publishing isn't the finish line. A 15-minute weekly review keeps a live agent healthy and improving.",
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm9-q3',
      type: 'multiple-choice',
      prompt: 'About how long should the simple weekly review take?',
      options: ['About 15 minutes', 'A full day', 'About 3 hours', "It isn't necessary weekly"],
      correctIndex: 0,
      explanation: 'The weekly review is a short ritual of about 15 minutes.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q4',
      type: 'true-false',
      prompt: 'Autonomous agents have their own health view, separate from chat analytics.',
      correct: true,
      explanation:
        'Autonomous agents run on triggers rather than chats, so their health is analysed separately.',
      sourceUrl: src.health,
    },
    {
      id: 'm9-q5',
      type: 'multiple-choice',
      prompt: 'What should the weekly ritual cover?',
      options: [
        "What to check, what 'bad' looks like, and who to tell",
        'Rewriting all topics from scratch',
        'Switching environments',
        'Re-licensing the agent',
      ],
      correctIndex: 0,
      explanation:
        "The weekly ritual covers what to check, what 'bad' looks like, and who to tell.",
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm9-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt: "Your agent's escalation rate jumped this week. What is a good first step?",
      options: [
        'Review the escalated conversations to find which questions or topics are failing',
        'Turn off escalation',
        'Switch to a preview model',
        'Wait a month and see if it settles',
      ],
      correctIndex: 0,
      explanation:
        'Escalations show where the agent could not help. The conversations behind them tell you what to fix.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm9-q7',
      type: 'multiple-choice',
      prompt: 'What does the resolution number tell you?',
      options: [
        "How often conversations ended with the user's question resolved",
        'How many knowledge sources the agent has',
        'How fast the model responds',
        'How many people have edit rights',
      ],
      correctIndex: 0,
      explanation:
        'Resolution shows how often the agent resolved what the user came for, which is a core health signal.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'Your weekly review shows that answers from one SharePoint library are out of date. Who do you tell?',
      options: [
        'The owner of that content, so the source gets fixed',
        'Nobody; the agent will fix itself',
        'Every user of the agent',
        'Only the Copilot Studio support team',
      ],
      correctIndex: 0,
      explanation:
        'Part of the weekly ritual is knowing who to tell. Out-of-date answers need the content owner to update the source.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm9-q9',
      type: 'multiple-choice',
      prompt: 'For a weekly review, which period of analytics should you look at?',
      options: ['The last 7 days', 'Since the agent was created', 'Today only', 'The last year'],
      correctIndex: 0,
      explanation: 'A weekly review looks at the last 7 days, so each week builds on the last.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q10',
      type: 'true-false',
      prompt: 'Analytics are only useful for agents with problems.',
      correct: false,
      explanation:
        'Analytics also show what is working well and where to improve next, even for healthy agents.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q11',
      type: 'multiple-choice',
      prompt: 'What is the purpose of the weekly review?',
      options: [
        'Catch problems early and keep improving a live agent',
        'Rebuild the agent each week',
        'Move the agent to a new environment',
        'Reset the analytics',
      ],
      correctIndex: 0,
      explanation:
        'A short, regular review catches problems before they grow and keeps the agent improving.',
      sourceUrl: src.effectiveness,
    },
    {
      id: 'm9-q12',
      type: 'order',
      prompt: 'Put the steps of the weekly review in order.',
      steps: [
        'Name one thing to improve',
        "Open the agent's Analytics page",
        'Set the date range to the last 7 days',
        'Read sessions, engagement, resolution, and escalation',
      ],
      correctOrder: [1, 2, 3, 0],
      explanation:
        'Open Analytics, set the week, read the numbers, then decide on one improvement.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q13',
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
      id: 'm9-q14',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'A live agent shows no sessions at all in the last 7 days. What is a sensible first question?',
      options: [
        'Is it published to a channel people actually use?',
        'Does it need a preview model?',
        'Should it have more child agents?',
        'Is the test pane open?',
      ],
      correctIndex: 0,
      explanation:
        'No sessions usually means people cannot reach the agent. Check where it is published and whether users know about it.',
      sourceUrl: src.analytics,
    },
    {
      id: 'm9-q15',
      type: 'true-false',
      prompt: 'The weekly review should include who to tell when something looks bad.',
      correct: true,
      explanation:
        'Knowing who to tell turns a finding into a fix, which is why it is part of the ritual.',
      sourceUrl: src.effectiveness,
    },
  ],

  // ---------------------------------------------------------------------
  // Module 10 — Channels & publishing
  // ---------------------------------------------------------------------
  10: [
    {
      id: 'm10-q1',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'You fixed a typo in the instructions but users still see old behavior. Why?',
      options: [
        "The fix didn't save",
        'Changes stay in draft until you publish again',
        'The agent needs to be rebuilt from scratch',
        "Typos can't be fixed after publishing",
      ],
      correctIndex: 1,
      explanation:
        'Nothing is live until you publish. Changes stay in draft on purpose, so a fix needs a new publish before users see it.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q2',
      type: 'true-false',
      prompt: 'The demo website channel is meant for stakeholder review before broad rollout.',
      correct: true,
      explanation: 'Use the demo website for stakeholder review before broad rollout.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm10-q3',
      type: 'multiple-choice',
      prompt:
        "What does deploying to Teams + Microsoft 365 for your whole organisation need that the demo website doesn't?",
      options: [
        'An admin approval step',
        'A new environment',
        'A new knowledge source',
        'A different model',
      ],
      correctIndex: 0,
      explanation:
        'To make the agent available to your organisation, submit it for admin approval so it appears under Built for your org in the Teams app store.',
      sourceUrl: src.teams,
    },
    {
      id: 'm10-q4',
      type: 'true-false',
      prompt:
        'The pre-publish checklist includes confirming knowledge is verified and evaluation has passed.',
      correct: true,
      explanation:
        'The pre-publish checklist is: right environment, knowledge verified, evaluation passed, right channel.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q5',
      type: 'order',
      prompt:
        'Put the pre-publish checks in the order you would do them. Each check depends on the one before it.',
      steps: ['Right channel', 'Evaluation passed', 'Right environment', 'Knowledge verified'],
      correctOrder: [2, 3, 1, 0],
      explanation:
        'First make sure you are publishing the right agent from the right environment. Verify its knowledge, because the evaluation depends on it. Pass the evaluation, then choose the channel.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q6',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You published yesterday, then edited the instructions today without publishing. What do users see?',
      options: [
        "Yesterday's published version",
        "Today's edits",
        'A mix of both',
        'Nothing; the agent goes offline',
      ],
      correctIndex: 0,
      explanation:
        'Users see the last published version. Your edits stay in draft until you publish again.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q7',
      type: 'multiple-choice',
      prompt: 'Which channel puts the agent where people already work every day?',
      options: ['Teams + Microsoft 365', 'The demo website', 'The test pane', 'The Overview page'],
      correctIndex: 0,
      explanation:
        'Teams + Microsoft 365 bring the agent into the apps people already use at work.',
      sourceUrl: src.teams,
    },
    {
      id: 'm10-q8',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'After publishing, the Demo website tile is still missing from the Channels page. What should you do?',
      options: [
        'Ask your admin, because the channel may be turned off in your environment',
        'Delete the agent and start again',
        'Switch to a preview model',
        'Add more knowledge',
      ],
      correctIndex: 0,
      explanation:
        'If a channel is missing after publishing, it may be turned off in your environment. Your admin can check.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm10-q9',
      type: 'multiple-choice',
      prompt: 'Which check comes first in the pre-publish checklist?',
      options: ['Right environment', 'Right channel', 'Evaluation passed', 'Knowledge verified'],
      correctIndex: 0,
      explanation:
        'Everything else depends on publishing the right agent from the right environment, so that check comes first.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q10',
      type: 'true-false',
      prompt: 'Changes to an agent stay in draft until you publish.',
      correct: true,
      explanation:
        'Nothing is live until you publish. That lets you decide exactly when users see changes.',
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q11',
      type: 'multiple-choice',
      prompt: 'What does single sign-on give users of an agent in Teams?',
      options: [
        'They do not have to sign in again separately to use the agent',
        'They can edit the agent',
        'They see draft changes',
        'They skip the admin approval step',
      ],
      correctIndex: 0,
      explanation:
        'Single sign-on uses the account people are already signed in with, so they are not asked to sign in again.',
      sourceUrl: src.authentication,
    },
    {
      id: 'm10-q12',
      type: 'multiple-choice',
      scenario: true,
      prompt: 'On launch day, your evaluation still fails two test cases. What do you do?',
      options: [
        'Fix them and re-run the evaluation before publishing',
        'Publish anyway and fix them later',
        'Delete the two test cases',
        'Publish only to Teams',
      ],
      correctIndex: 0,
      explanation:
        '"Evaluation passed" is on the pre-publish checklist. Fix the failures, re-run, then publish.',
      sourceUrl: src.evalResults,
    },
    {
      id: 'm10-q13',
      type: 'multiple-choice',
      prompt: 'What is the difference between the demo website and a live website?',
      options: [
        'The demo website is for review; a live website is the real channel once the agent is ready',
        'There is no difference',
        'The live website is only for admins',
        'The demo website uses a different agent',
      ],
      correctIndex: 0,
      explanation:
        'Share the demo website for feedback first. A live website is where the finished agent meets its users.',
      sourceUrl: src.webChannels,
    },
    {
      id: 'm10-q14',
      type: 'multiple-choice',
      scenario: true,
      prompt:
        'You want your agent to appear in the Teams app store for everyone in your organisation. What extra step is needed?',
      options: [
        'Submit it for admin approval',
        'Publish it twice',
        'Move it to the Default environment',
        'Share the demo website link',
      ],
      correctIndex: 0,
      explanation:
        'After an admin approves it, the agent appears under Built for your org in the Teams app store and Built by your org in the Microsoft 365 Agent Store.',
      sourceUrl: src.teams,
    },
    {
      id: 'm10-q15',
      type: 'multiple-choice',
      prompt: 'Why is it helpful that publishing is a separate, deliberate step?',
      options: [
        'You decide exactly when users see changes',
        'It makes the agent run faster',
        'It removes the need for testing',
        'It lets users edit the agent',
      ],
      correctIndex: 0,
      explanation:
        "Nothing is live until you publish. That's a feature: you decide exactly when users see changes.",
      sourceUrl: src.publish,
    },
    {
      id: 'm10-q16',
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
  ],
}
