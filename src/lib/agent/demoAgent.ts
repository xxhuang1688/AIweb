import { buildDemoPrompt } from "@/lib/agent/promptBuilder";
import { getProvider } from "@/lib/agent/providers/providerRegistry";
import { mockProvider } from "@/lib/agent/providers/mockProvider";
import { validateProposalJson } from "@/lib/agent/proposalValidator";
import type { AgentProviderName, DemoGenerationResponse } from "@/types/agent";

function normalizeProvider(value: unknown): AgentProviderName {
  if (
    value === "syncCraft" ||
    value === "mock" ||
    value === "openai" ||
    value === "claude" ||
    value === "deepseek" ||
    value === "gemini" ||
    value === "openrouter"
  ) {
    return value;
  }

  return "syncCraft";
}

export async function runDemoGenerationAgent(input: unknown): Promise<DemoGenerationResponse> {
  const request = typeof input === "object" && input !== null && "proposal" in input
    ? input as { proposal?: unknown; provider?: unknown }
    : { proposal: input, provider: "syncCraft" };

  const providerName = normalizeProvider(request.provider);
  const { proposal, errors } = validateProposalJson(request.proposal);

  if (!proposal) {
    return {
      status: "invalid_request",
      provider: providerName,
      prompt: null,
      result: null,
      errors,
      demoUrl: null,
    };
  }

  const prompt = buildDemoPrompt(proposal);
  const provider = getProvider(providerName);

  try {
    const result = await provider.generateWebsiteSummary({ proposal, prompt });

    return {
      status: "generated",
      provider: provider.name,
      prompt: null,
      result,
      errors: [],
      demoUrl: null,
    };
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DEEPSEEK_API_KEY")
      ? "現在デモ生成を利用できません。設定を確認してからもう一度お試しください。"
      : "デモ生成の処理中に問題が発生しました。しばらくしてからもう一度お試しください。";

    console.error("[SyncCraft Agent] Primary provider failed:", error);

    if (!message.includes("APIキー")) {
      try {
        const fallbackResult = await mockProvider.generateWebsiteSummary({ proposal, prompt });

        return {
          status: "generated",
          provider: "syncCraft",
          prompt: null,
          result: {
            ...fallbackResult,
            provider: "syncCraft",
            model: "SyncCraft 多年経験型 自社AIエージェント v1",
          },
          errors: [],
          demoUrl: null,
        };
      } catch (fallbackError) {
        console.error("[SyncCraft Agent] Fallback generation failed:", fallbackError);
      }
    }

    return {
      status: "provider_error",
      provider: provider.name,
      prompt: null,
      result: null,
      errors: [message],
      demoUrl: null,
    };
  }
}
