/**
 * House rules and keep-learning links, transcribed verbatim from
 * `src/content/_extracted.json` (source: `copilot-studio-training-guide.html`).
 */
import type { LinkItem, Module } from './types'

export interface HouseRule {
  title: string
  body: string
}

export const houseRules: HouseRule[] = [
  {
    title: 'One agent, built progressively',
    body: "Every module adds a layer to the same practice agent. By Module 9 you've published something real, and in Module 10 you see how it's used.",
  },
  {
    title: 'Environments come first',
    body: "Always confirm you're in Dev before touching anything. It's the check that prevents the most painful mistakes.",
  },
  {
    title: 'Descriptions are a skill',
    body: 'The agent routes by reading your descriptions of knowledge, tools, topics, and child agents. Write them like you mean it.',
  },
  {
    title: 'Nothing ships untested',
    body: 'Evaluation before publishing, every time. A 10-question test set is the minimum bar.',
  },
  {
    title: 'Practice data only',
    body: "Never put confidential data into a practice agent. Use made-up or already-public content, and check the agent's sign-in setting before you share a link.",
  },
  {
    title: 'Preview means not for production',
    body: 'Preview and experimental features are for exploring. If it has a preview tag, it stays out of anything real.',
  },
  {
    title: 'Ask early, ask often',
    body: 'If a step does not match your screen, email the agent support team (see Help). Screens change, and your question helps fix the course for the next group.',
  },
]

export interface KeepLearningLink extends LinkItem {
  note: string
}

export const keepLearning: KeepLearningLink[] = [
  {
    url: 'https://aka.ms/agent-academy',
    label: 'Microsoft Copilot Studio Agent Academy',
    note: 'free lessons from Microsoft, separate from this course',
  },
  {
    url: 'https://aka.ms/nextAgIAD',
    label: 'Agent in a Day',
    note: 'free instructor-led workshop',
  },
  {
    url: 'https://learn.microsoft.com/en-us/training/browse/?terms=copilot%20studio&products=ms-copilot',
    label: 'Microsoft Learn training modules',
    note: '',
  },
  {
    url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/',
    label: 'Implementation guidance',
    note: '',
  },
  {
    url: 'https://adoption.microsoft.com/ai-agents/copilot-studio/#scenarios',
    label: 'Scenario library',
    note: 'downloadable example agents',
  },
]

export interface ModuleGoDeeper {
  moduleId: number
  slug: string
  title: string
  links: LinkItem[]
}

/** Flattens each module's `goDeeper` links, grouped by module, for the Resources page. */
export function flattenGoDeeperByModule(modules: Module[]): ModuleGoDeeper[] {
  return modules.map((m) => ({
    moduleId: m.id,
    slug: m.slug,
    title: m.title,
    links: m.goDeeper,
  }))
}

/** All `goDeeper` links across every module, deduplicated by URL. */
export function allGoDeeperLinks(modules: Module[]): LinkItem[] {
  const seen = new Set<string>()
  const result: LinkItem[] = []
  for (const m of modules) {
    for (const link of m.goDeeper) {
      if (!seen.has(link.url)) {
        seen.add(link.url)
        result.push(link)
      }
    }
  }
  return result
}
