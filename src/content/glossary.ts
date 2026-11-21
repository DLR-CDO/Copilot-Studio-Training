/**
 * Glossary terms for every termId referenced by `kw` tokens in `modules.ts`.
 * Definitions are grounded in the wording of `copilot-studio-training-guide.html`.
 */
import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  {
    id: 'agent',
    term: 'Agent',
    definition:
      'Built from a description, model, instructions, knowledge, tools, triggers, other agents (child agents), topics, and suggested prompts, and used through channels. Conversational agents chat with people; autonomous agents act on triggers.',
  },
  {
    id: 'environment',
    term: 'Environment',
    definition:
      'A container for agents, data, and permissions. Work flows one direction: Dev → Test → Production — you never build directly in Production.',
  },
  {
    id: 'knowledge-source',
    term: 'Knowledge source',
    definition:
      'Content an agent can search to ground its answers. The main sources are SharePoint, OneDrive, uploaded files, and public websites; Dataverse and other options are used less often. A good description helps the agent pick the right source.',
  },
  {
    id: 'grounding',
    term: 'Grounding',
    definition:
      'Answering from your content instead of guessing. Generative answers use knowledge sources so you can check whether an answer actually came from your knowledge, via its citation.',
  },
  {
    id: 'topic',
    term: 'Topic',
    definition:
      'A scripted conversation path with a trigger. Use topics when a conversation must follow a script, like collecting details for a request.',
  },
  {
    id: 'variable',
    term: 'Variable',
    definition: 'The agent remembering what the user told it, in plain terms.',
  },
  {
    id: 'connector',
    term: 'Connector',
    definition:
      'A ready-made bridge to systems like Outlook, SharePoint, and Dataverse that a tool can use.',
  },
  {
    id: 'tool',
    term: 'Tool',
    definition:
      "An action the agent can take on your behalf: looking up records, sending emails, kicking off approvals. The tool's description decides whether the agent picks it at the right moment.",
  },
  {
    id: 'orchestration',
    term: 'Orchestration',
    definition:
      'How the agent decides what to do next. Generative orchestration works from topic descriptions; classic orchestration relies on trigger phrases.',
  },
  {
    id: 'model',
    term: 'Model',
    definition:
      'The AI model behind a response. Picking a primary model trades off reasoning depth vs speed vs cost, with separate settings for orchestration, generative responses, deep reasoning, and prompts.',
  },
  {
    id: 'child-agent',
    term: 'Child agent',
    definition:
      'A specialist agent that lives inside your agent. Write its description so the parent always routes to it correctly.',
  },
  {
    id: 'connected-agent',
    term: 'Connected agent',
    definition:
      'An existing Copilot Studio agent someone else built, connected into your agent instead of rebuilt from scratch.',
  },
  {
    id: 'mcp',
    term: 'MCP',
    definition:
      'A standard plug for external tools — an MCP server lets your agent use tools built outside Copilot Studio.',
  },
  {
    id: 'test-set',
    term: 'Test set',
    definition:
      'Real questions paired with expected answers, used to repeatably check whether the agent actually works.',
  },
  {
    id: 'evaluation',
    term: 'Evaluation',
    definition:
      'Running a test set and reading the results — the way you know what to fix before publishing, every time.',
  },
  {
    id: 'channel',
    term: 'Channel',
    definition:
      'Where users reach the agent: the demo website, the live website, or Teams and Microsoft 365.',
  },
  {
    id: 'publish',
    term: 'Publish',
    definition:
      "The moment changes go live. Nothing is live until you press Publish — that's on purpose, so you decide exactly when users see changes.",
  },
  {
    id: 'draft',
    term: 'Draft',
    definition:
      'The unpublished state of your agent. Changes stay in draft until you publish, so only you see them until then.',
  },
  {
    id: 'citation',
    term: 'Citation',
    definition:
      'A link back to the knowledge source an answer came from. Always check the source before you trust an answer.',
  },
  {
    id: 'escalation',
    term: 'Escalation',
    definition:
      "Handing a conversation off, for example through a system topic like fallback or escalate. It's one of the numbers analytics tracks, alongside sessions, engagement, and resolution.",
  },
  {
    id: 'trigger',
    term: 'Trigger',
    definition:
      'What starts something. A topic trigger starts a topic, usually from what the user says: trigger phrases in classic orchestration, or the topic description in generative orchestration. An agent trigger starts the agent automatically on an event, for example an urgent email arriving, which an autonomous agent then answers by email.',
  },
  {
    id: 'suggested-prompt',
    term: 'Suggested prompt',
    definition:
      'A starter question shown to users, with a short title, so they know what to ask the agent.',
  },
  {
    id: 'agent-description',
    term: 'Description',
    definition:
      'A short summary of what the agent does. People and other agents read it to decide when to use the agent.',
  },
  {
    id: 'solution',
    term: 'Solution',
    definition:
      'A container in Power Apps that stores all the work for your agent, so it can be moved between environments later.',
  },
  {
    id: 'copilot-credits',
    term: 'Copilot Credits',
    definition:
      'The billing unit for agents in Copilot Studio since September 1, 2025. Your organization buys capacity and agents use credits as they work; your admin manages this, not you.',
  },
  {
    id: 'harness',
    term: 'Harness',
    definition:
      'The engine that runs an agent and shapes how you build it. This course uses the standard harness, which follows the topics and rules you define. Agents on the Microsoft Copilot harness look and work differently.',
  },
  {
    id: 'activity-map',
    term: 'Activity map',
    definition:
      'A step-by-step view of one conversation on the Activity tab. It shows which knowledge, tools, and topics the agent used for each answer, and why.',
  },
  {
    id: 'instructions',
    term: 'Instructions',
    definition:
      'Standing guidance the agent always follows: what it does, its tone, and its rules. You write them on the Overview page.',
  },
  {
    id: 'data-policy',
    term: 'Data policy (DLP)',
    definition:
      'Rules your admin sets for an environment, also called data loss prevention (DLP) policies. They control which connectors, knowledge sources, and channels agents may use, and can require people to sign in.',
  },
  {
    id: 'authentication',
    term: 'Authentication (sign-in)',
    definition:
      'Who must sign in to chat with an agent, set under Settings > Security > Authentication. No authentication lets anyone with the link chat. Authenticate with Microsoft signs people in with their work account, as in Teams and Microsoft 365.',
  },
  {
    id: 'monitor',
    term: 'Monitor (Analytics)',
    definition:
      'The page that shows how a published agent is used: sessions, engagement, resolution, and escalation. Older screens call it Analytics. Chats in the test pane never appear here.',
  },
  {
    id: 'ungrounded-responses',
    term: 'Allow ungrounded responses',
    definition:
      'A setting under Settings > Generative AI > Knowledge (older screens: use general knowledge). When it is off, the agent only answers when it used a knowledge source or tool, instead of falling back on the AI model’s general knowledge.',
  },
  {
    id: 'content-moderation',
    term: 'Content moderation',
    definition:
      'How strictly the agent filters harmful content out of generated answers, from Lowest to Highest. The default is High. Set it for the whole agent in Generative AI settings, or for one topic in its generative answers node, which wins at runtime.',
  },
  {
    id: 'content-safety',
    term: 'Content safety (test method)',
    definition:
      'An evaluation test method that fails any answer containing harmful content of the type you pick: violent, hateful, self-harm, or sexual.',
  },
  {
    id: 'analytics-viewer',
    term: 'Analytics Viewer',
    definition:
      'A sharing role that lets one person see an agent’s Monitor page and nothing else. They can’t edit, test, publish, or share the agent. Only individuals can get it, not groups.',
  },
]

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossary.find((g) => g.id === id)
}
