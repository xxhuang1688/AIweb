import { buildDemoPlanFromContent } from "@/lib/agent/demoContentPlanner";
import { renderDemoSitePages } from "@/lib/agent/renderer/demoHtmlRenderer";
import type { AgentProviderInput, AgentProviderResult, AiProvider, DemoPlanJson } from "@/types/agent";

export function buildDemoPlan(proposal: AgentProviderInput["proposal"]): DemoPlanJson {
  return buildDemoPlanFromContent(proposal);
}

export const mockProvider: AiProvider = {
  name: "mock",
  model: "SyncCraft 多年経験型 自社AIエージェント v1",
  async generateWebsiteSummary({ proposal, prompt }: AgentProviderInput): Promise<AgentProviderResult> {
    const demoPlan = buildDemoPlan(proposal);
    const previewPages = renderDemoSitePages(demoPlan);
    const previewHtml = previewPages[0]?.html ?? "";

    return {
      provider: "mock",
      model: this.model,
      summary: {
        title: `${proposal.company.name} デモサイト構成案`,
        concept: `${proposal.company.industry}と${proposal.website.type}に合わせて、ページ構成、主要導線、必要機能を整理した初回デモです。`,
        targetAudience: demoPlan.contentStrategy.targetAudience,
        pages: demoPlan.pages.map((page) => page.name),
        keyFeatures: demoPlan.requiredFeatures,
        designDirection: `${demoPlan.visualStyle.designStyle}をベースに、${demoPlan.visualStyle.mainColor}を活かした日本向けデザイン。${demoPlan.visualStyle.layout}`,
        techStack: demoPlan.techStack,
      },
      demoPlan,
      previewHtml,
      previewPages,
      rawText: [
        "長年のWeb制作経験をもとに自社開発したSyncCraft AIエージェントによるデモサイト概要です。",
        `Prompt length: ${prompt.fullPrompt.length}`,
        `Company: ${proposal.company.name}`,
      ].join("\n"),
    };
  },
};
