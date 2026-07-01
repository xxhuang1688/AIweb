import { deepSeekProvider } from "@/lib/agent/providers/deepseekProvider";
import { mockProvider } from "@/lib/agent/providers/mockProvider";
import type { AgentProviderName, AiProvider } from "@/types/agent";

const providers: Record<AgentProviderName, AiProvider | null> = {
  syncCraft: deepSeekProvider,
  mock: mockProvider,
  openai: null,
  claude: null,
  deepseek: deepSeekProvider,
  gemini: null,
  openrouter: null,
};

export function getProvider(name: AgentProviderName = "mock"): AiProvider {
  const provider = providers[name];

  if (!provider) {
    return mockProvider;
  }

  return provider;
}
