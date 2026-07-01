import {
  colorOptions,
  designStyleOptions,
  featureOptions,
  industryOptions,
  websiteGoalOptions,
  websiteTypeOptions,
} from "@/config/proposalConfig";
import { industryPresets } from "@/config/industryPreset";
import { calculatePricing } from "@/lib/pricingEngine";
import type { Feature, ProposalJson, RequirementInput } from "@/types/proposal";

function getLabel<T extends string>(options: { value: T; label: string }[], value: T | "") {
  return options.find((option) => option.value === value)?.label ?? "";
}

function getLabels<T extends string>(options: { value: T; label: string }[], values: T[]) {
  return values.map((value) => getLabel(options, value)).filter(Boolean);
}

function has(features: Feature[], feature: Feature) {
  return features.includes(feature);
}

function buildPages(input: RequirementInput) {
  const industryPages = input.industry && industryPresets[input.industry]
    ? industryPresets[input.industry].recommendedPages
    : [];
  const pages = ["トップページ", "会社概要", "サービス紹介", ...industryPages, "お問い合わせ"];

  if (input.websiteGoals.includes("caseStudies")) pages.push("実績紹介");
  if (input.websiteGoals.includes("recruiting")) pages.push("採用情報");
  if (has(input.features, "blog")) pages.push("ブログ");
  if (has(input.features, "news")) pages.push("ニュース");
  if (has(input.features, "reservation")) pages.push("予約ページ");
  if (has(input.features, "faq")) pages.push("FAQ");
  if (input.websiteType === "ec" || has(input.features, "payment")) {
    pages.push("商品一覧", "商品詳細", "購入手続き");
  }
  if (has(input.features, "login") || has(input.features, "membership")) {
    pages.push("ログイン", "マイページ");
  }
  if (has(input.features, "cms") || has(input.features, "admin")) {
    pages.push("管理画面");
  }

  return Array.from(new Set(pages));
}

function buildTechStack(input: RequirementInput) {
  const stack = ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"];

  if (
    has(input.features, "form") ||
    has(input.features, "contact") ||
    has(input.features, "reservation") ||
    has(input.features, "login") ||
    has(input.features, "membership")
  ) {
    stack.push("Supabase");
  }
  if (input.websiteType === "ec" || has(input.features, "payment")) stack.push("Stripe");
  if (has(input.features, "cms") || has(input.features, "blog") || has(input.features, "news")) {
    stack.push("Headless CMS");
  }
  if (has(input.features, "analytics")) stack.push("Google Analytics");
  if (has(input.features, "aiChat")) stack.push("AIチャット連携");

  return Array.from(new Set(stack));
}

export function buildProposal(input: RequirementInput): ProposalJson {
  const normalizedInput = {
    ...input,
    referenceSites: input.referenceSites.map((site) => site.trim()).filter(Boolean),
  };

  return {
    version: "1.0",
    language: "ja",
    market: "Japan",
    generatedAt: new Date().toISOString(),
    company: {
      name: normalizedInput.companyName,
      industry: getLabel(industryOptions, normalizedInput.industry),
      slogan: normalizedInput.slogan,
      description: normalizedInput.companyDescription,
      contactInfo: normalizedInput.contactInfo,
      logo: normalizedInput.logo,
    },
    website: {
      type: getLabel(websiteTypeOptions, normalizedInput.websiteType),
      goals: getLabels(websiteGoalOptions, normalizedInput.websiteGoals),
      features: getLabels(featureOptions, normalizedInput.features),
      designStyle: getLabel(designStyleOptions, normalizedInput.designStyle),
      mainColor: getLabel(colorOptions, normalizedInput.mainColor),
      referenceSites: normalizedInput.referenceSites,
      referenceNote: normalizedInput.referenceNote,
    },
    estimate: calculatePricing(normalizedInput),
    recommendation: {
      pages: buildPages(normalizedInput),
      techStack: buildTechStack(normalizedInput),
    },
    agentInstruction: {
      purpose: "demo_site_generation",
      status: "ready_for_agent",
      note: "このJSONをSyncCraft 自社AIエージェントのデモ生成ワークフローに渡します。見積もりにはサーバー、ドメイン、外部サービス利用料などの購入費用は含まれていません。SyncCraftで制作する場合は、必要に応じて選定、取得、初期設定、公開作業まで一括で対応します。",
    },
  };
}
