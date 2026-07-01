import type { ProposalJson } from "@/types/proposal";

export type AgentProviderName = "syncCraft" | "mock" | "openai" | "claude" | "deepseek" | "gemini" | "openrouter";

export type DemoGenerationRequest = {
  proposal: ProposalJson;
  provider?: AgentProviderName;
};

export type AgentPrompt = {
  systemPrompt: string;
  userPrompt: string;
  fullPrompt: string;
};

export type AgentWebsiteSummary = {
  title: string;
  concept: string;
  targetAudience: string;
  pages: string[];
  keyFeatures: string[];
  designDirection: string;
  techStack: string[];
};

export type DemoPlanSection = {
  id: string;
  type: "hero" | "problem" | "services" | "features" | "caseStudies" | "pricing" | "faq" | "cta" | "contact" | "custom";
  title: string;
  subtitle: string;
  content: string;
  items: string[];
  ctaLabel?: string;
};

export type DemoPlanJson = {
  version: "1.0";
  siteName: string;
  siteType: string;
  industry: string;
  language: "ja";
  company: {
    name: string;
    slogan: string;
    description: string;
    contactInfo: string;
    logo: string;
  };
  visualStyle: {
    designStyle: string;
    mainColor: string;
    tone: string;
    layout: string;
  };
  contentStrategy: {
    primaryMessage: string;
    targetAudience: string;
    conversionGoal: string;
    ctaLabel: string;
  };
  pages: Array<{
    name: string;
    role: string;
    sections: string[];
    headline?: string;
    description?: string;
    highlights?: string[];
    primaryCta?: string;
    visualConcept?: string;
  }>;
  homeSections: DemoPlanSection[];
  requiredFeatures: string[];
  techStack: string[];
  implementationNotes: string[];
};

export type AgentProviderInput = {
  proposal: ProposalJson;
  prompt: AgentPrompt;
};

export type AgentProviderResult = {
  provider: AgentProviderName;
  model: string;
  summary: AgentWebsiteSummary;
  demoPlan: DemoPlanJson;
  previewHtml: string;
  previewPages: Array<{
    name: string;
    fileName: string;
    html: string;
  }>;
  rawText: string;
};

export type DemoGenerationResponse = {
  status: "generated" | "invalid_request" | "provider_error";
  provider: AgentProviderName;
  prompt: AgentPrompt | null;
  result: AgentProviderResult | null;
  errors: string[];
  demoUrl: string | null;
};

export type DemoVersion = {
  id: string;
  createdAt: string;
  companyName: string;
  siteName: string;
  provider: AgentProviderName;
  model: string;
  response: DemoGenerationResponse;
};

export type AiProvider = {
  name: AgentProviderName;
  model: string;
  generateWebsiteSummary(input: AgentProviderInput): Promise<AgentProviderResult>;
};
