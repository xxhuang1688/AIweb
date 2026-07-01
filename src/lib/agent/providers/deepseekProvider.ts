import { renderDemoSitePages } from "@/lib/agent/renderer/demoHtmlRenderer";
import { buildDemoPlan } from "@/lib/agent/providers/mockProvider";
import { findIndustryPreset } from "@/config/industryPreset";
import type {
  AgentProviderInput,
  AgentProviderResult,
  AgentWebsiteSummary,
  AiProvider,
  DemoPlanJson,
  DemoPlanSection,
} from "@/types/agent";

type DeepSeekChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type DeepSeekJsonResponse = {
  summary?: Partial<AgentWebsiteSummary>;
  demoPlan?: Partial<DemoPlanJson>;
};

type PartialVisualStyle = Partial<DemoPlanJson["visualStyle"]>;
type PartialContentStrategy = Partial<DemoPlanJson["contentStrategy"]>;
const sectionTypes = ["hero", "problem", "services", "features", "caseStudies", "pricing", "faq", "cta", "contact", "custom"] as const;

function isSectionType(value: unknown): value is DemoPlanSection["type"] {
  return typeof value === "string" && sectionTypes.includes(value as DemoPlanSection["type"]);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items : fallback;
}

function compactFallbackPlan(plan: DemoPlanJson): DemoPlanJson {
  return {
    ...plan,
    pages: plan.pages.slice(0, 8).map((page) => ({
      ...page,
      sections: page.sections.slice(0, 5),
      highlights: page.highlights?.slice(0, 5),
    })),
    homeSections: plan.homeSections.slice(0, 7).map((section) => ({
      ...section,
      items: section.items.slice(0, 5),
      content: section.content.length > 180 ? `${section.content.slice(0, 180)}...` : section.content,
    })),
    requiredFeatures: plan.requiredFeatures.slice(0, 8),
    implementationNotes: plan.implementationNotes.slice(0, 8),
  };
}

function normalizeSection(section: unknown, fallback: DemoPlanSection): DemoPlanSection {
  const value = typeof section === "object" && section !== null ? section as Partial<DemoPlanSection> : {};

  return {
    id: asString(value.id, fallback.id),
    type: isSectionType(value.type) ? value.type : fallback.type,
    title: asString(value.title, fallback.title),
    subtitle: asString(value.subtitle, fallback.subtitle),
    content: asString(value.content, fallback.content),
    items: asStringArray(value.items, fallback.items),
    ctaLabel: typeof value.ctaLabel === "string" ? value.ctaLabel : fallback.ctaLabel,
  };
}

function normalizeDemoPlan(value: Partial<DemoPlanJson> | undefined, fallback: DemoPlanJson, input: AgentProviderInput): DemoPlanJson {
  const visualStyle: PartialVisualStyle = value?.visualStyle ?? {};
  const contentStrategy: PartialContentStrategy = value?.contentStrategy ?? {};
  const companyName = input.proposal.company.name;
  const companySlogan = input.proposal.company.slogan;
  const companyDescription = input.proposal.company.description;

  return {
    version: "1.0",
    siteName: `${companyName} デモサイト`,
    siteType: asString(value?.siteType, fallback.siteType),
    industry: asString(value?.industry, fallback.industry),
    language: "ja",
    company: {
      name: companyName,
      slogan: companySlogan,
      description: companyDescription,
      contactInfo: input.proposal.company.contactInfo,
      logo: input.proposal.company.logo,
    },
    visualStyle: {
      designStyle: asString(visualStyle.designStyle, fallback.visualStyle.designStyle),
      mainColor: asString(visualStyle.mainColor, fallback.visualStyle.mainColor),
      tone: asString(visualStyle.tone, fallback.visualStyle.tone),
      layout: asString(visualStyle.layout, fallback.visualStyle.layout),
    },
    contentStrategy: {
      primaryMessage: companySlogan || asString(contentStrategy.primaryMessage, fallback.contentStrategy.primaryMessage),
      targetAudience: asString(contentStrategy.targetAudience, fallback.contentStrategy.targetAudience),
      conversionGoal: asString(contentStrategy.conversionGoal, fallback.contentStrategy.conversionGoal),
      ctaLabel: asString(contentStrategy.ctaLabel, fallback.contentStrategy.ctaLabel),
    },
    pages: fallback.pages.slice(0, 8).map((fallbackPage, index) => {
        const page = Array.isArray(value?.pages)
          ? (value.pages.find((item) => item?.name === fallbackPage.name) ?? value.pages[index])
          : undefined;

        return {
          name: asString(page?.name, fallbackPage.name),
          role: asString(page?.role, fallbackPage.role),
          sections: asStringArray(page?.sections, fallbackPage.sections),
          headline: asString(page?.headline, fallbackPage.headline ?? fallbackPage.name),
          description: asString(page?.description, fallbackPage.description ?? fallbackPage.role),
          highlights: asStringArray(page?.highlights, fallbackPage.highlights ?? fallbackPage.sections),
          primaryCta: asString(page?.primaryCta, fallbackPage.primaryCta ?? fallback.contentStrategy.ctaLabel),
          visualConcept: asString(page?.visualConcept, fallbackPage.visualConcept ?? fallback.visualStyle.layout),
        };
      })
      .map((page, index) => ({
        ...page,
        name: fallback.pages[index]?.name ?? page.name,
      })),
    homeSections: Array.isArray(value?.homeSections) && value.homeSections.length > 0
      ? value.homeSections.slice(0, 7).map((section, index) => normalizeSection(section, fallback.homeSections[index] ?? fallback.homeSections[fallback.homeSections.length - 1]))
      : fallback.homeSections,
    requiredFeatures: asStringArray(value?.requiredFeatures, fallback.requiredFeatures).slice(0, 8),
    techStack: asStringArray(value?.techStack, fallback.techStack),
    implementationNotes: asStringArray(value?.implementationNotes, fallback.implementationNotes),
  };
}

function applyCustomerContent(plan: DemoPlanJson, input: AgentProviderInput): DemoPlanJson {
  const firstSection = plan.homeSections[0];
  const companyName = input.proposal.company.name;
  const companySlogan = input.proposal.company.slogan;
  const companyDescription = input.proposal.company.description;
  const reservationContext = input.proposal.website.type.includes("予約") || input.proposal.company.industry.includes("飲食") || input.proposal.company.industry.includes("美容") || input.proposal.company.industry.includes("医療");
  const ctaLabel = !reservationContext && plan.contentStrategy.ctaLabel.includes("予約") ? "お問い合わせする" : plan.contentStrategy.ctaLabel;
  const conversionGoal = !reservationContext && plan.contentStrategy.conversionGoal.includes("予約") ? "お問い合わせ" : plan.contentStrategy.conversionGoal;
  const describePage = (page: DemoPlanJson["pages"][number]) => {
    const current = page.description ?? "";

    if (page.name.includes("トップ")) {
      return companyDescription || current || page.role;
    }

    if (page.name.includes("会社")) {
      if (current.includes(companyName) && current !== companyDescription) return current;
      return `${companyDescription} 会社の姿勢、対応領域、相談しやすさを伝えるページです。`;
    }

    if (current.includes("株式会社ミライテック") || current.includes("サンプル")) {
      return page.role;
    }

    return current || page.role;
  };

  return {
    ...plan,
    siteName: `${companyName} デモサイト`,
    company: {
      name: companyName,
      slogan: companySlogan,
      description: companyDescription,
      contactInfo: input.proposal.company.contactInfo,
      logo: input.proposal.company.logo,
    },
    contentStrategy: {
      ...plan.contentStrategy,
      primaryMessage: companySlogan || plan.contentStrategy.primaryMessage,
      conversionGoal,
      ctaLabel,
    },
    homeSections: firstSection
      ? [
        {
          ...firstSection,
          title: companySlogan || firstSection.title,
          subtitle: `${companyName} / ${plan.industry}`,
          content: companyDescription || firstSection.content,
          ctaLabel,
        },
        ...plan.homeSections.slice(1),
      ]
      : plan.homeSections,
    pages: plan.pages.map((page) => ({
      ...page,
      headline: page.name.includes("トップ")
        ? companySlogan || page.headline
        : !page.headline || !page.headline.includes(companyName) || page.headline.includes("株式会社ミライテック") || page.headline.includes("サンプル")
          ? `${companyName}の${page.name}`
          : page.headline,
      description: page.description?.includes("株式会社ミライテック") || page.description?.includes("サンプル")
        ? describePage(page)
        : page.description && page.description.includes(companyName)
          ? page.description
          : describePage(page),
      primaryCta: !reservationContext && page.primaryCta?.includes("予約") ? ctaLabel : page.primaryCta,
    })),
  };
}

function normalizeSummary(
  value: Partial<AgentWebsiteSummary> | undefined,
  fallback: DemoPlanJson,
  input: AgentProviderInput,
): AgentWebsiteSummary {
  return {
    title: `${input.proposal.company.name} デモサイト構成案`,
    concept: asString(value?.concept, `${fallback.industry}向けに信頼感と問い合わせ導線を整理した${fallback.siteType}です。`),
    targetAudience: asString(value?.targetAudience, fallback.contentStrategy.targetAudience),
    pages: asStringArray(value?.pages, fallback.pages.map((page) => page.name)),
    keyFeatures: asStringArray(value?.keyFeatures, fallback.requiredFeatures.length > 0 ? fallback.requiredFeatures : ["お問い合わせ"]),
    designDirection: asString(value?.designDirection, `${fallback.visualStyle.designStyle}をベースにした${fallback.visualStyle.mainColor}中心の日本向けビジネスデザイン。`),
    techStack: asStringArray(value?.techStack, fallback.techStack),
  };
}

function parseJsonContent(content: string): DeepSeekJsonResponse {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed) as DeepSeekJsonResponse;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("DeepSeek response did not include JSON.");
    return JSON.parse(match[0]) as DeepSeekJsonResponse;
  }
}

function buildDeepSeekInstruction(input: AgentProviderInput, fallbackPlan: DemoPlanJson) {
  const preset = findIndustryPreset(input.proposal.company.industry);
  const compactPlan = compactFallbackPlan(fallbackPlan);
  const additionalFeatures = input.proposal.website.features.slice(8);

  return [
    input.prompt.userPrompt,
    "",
    "必ずJSONのみを返してください。Markdown、説明文、コードブロックは禁止です。",
    "トップレベルのキーは summary と demoPlan の2つにしてください。",
    "demoPlan は次のTypeScript型に合わせてください。",
    "",
    `{
  "summary": {
    "title": "string",
    "concept": "string",
    "targetAudience": "string",
    "pages": ["string"],
    "keyFeatures": ["string"],
    "designDirection": "string",
    "techStack": ["string"]
  },
  "demoPlan": {
    "version": "1.0",
    "siteName": "string",
    "siteType": "string",
    "industry": "string",
    "language": "ja",
    "company": { "name": "string", "slogan": "string", "description": "string", "contactInfo": "string", "logo": "string" },
    "visualStyle": {
      "designStyle": "string",
      "mainColor": "string",
      "tone": "string",
      "layout": "string"
    },
    "contentStrategy": {
      "primaryMessage": "string",
      "targetAudience": "string",
      "conversionGoal": "string",
      "ctaLabel": "string"
    },
    "pages": [{ "name": "string", "role": "string", "sections": ["string"], "headline": "string", "description": "string", "highlights": ["string"], "primaryCta": "string", "visualConcept": "string" }],
    "homeSections": [{ "id": "string", "type": "hero", "title": "string", "subtitle": "string", "content": "string", "items": ["string"], "ctaLabel": "string" }],
    "requiredFeatures": ["string"],
    "techStack": ["string"],
    "implementationNotes": ["string"]
  }
}`,
    "",
    "homeSections は最低6個作ってください。hero、problem、services、features、caseStudies、cta を基本に、必要なら faq、pricing、contact を追加してください。",
    "pages は最大8ページまでにしてください。必要機能が多い場合は、機能専用ページやトップページ内の機能セクションとして必ず見える形にしてください。",
    "requiredFeatures は最大8件までにしてください。選択された必要機能は、pages、homeSections、requiredFeatures、implementationNotes のいずれかに必ず明示してください。",
    "homeSections.type は hero / problem / services / features / caseStudies / pricing / faq / cta / contact / custom のいずれかを使ってください。",
    "各sectionのtitle、subtitle、contentは顧客の会社説明・業界・目的に合わせて具体的にしてください。「価値を伝える」「信頼感」だけのような抽象表現を避けてください。",
    `顧客会社名「${input.proposal.company.name}」を必ずsiteName、hero、会社概要、CTA周辺の文脈に反映してください。別会社名やサンプル名は絶対に使わないでください。`,
    `顧客会社説明「${input.proposal.company.description}」をトップページと会社概要ページに必ず反映してください。`,
    "ユーザー入力を単に要約・転記するだけではなく、選択された業界で自然に見えるサービス名、顧客課題、導入メリット、CTAへ改善してください。",
    "会社説明やスローガンが短い場合は、業界プリセットを使って不足する情報を補完し、実在する日本企業の初回デモとして違和感のない密度にしてください。",
    "デザインは高品質なWeb制作会社が納品する初回デモとして見える粒度にしてください。IT、美容、医療、飲食、教育など、業界ごとの空気感を変えてください。各ページに役割の違いが出るよう、ページごとにsections名も具体化してください。",
    "demoPlan.pages には、業界プリセットの recommendedPages を優先して含めてください。EC、医療、飲食、美容、教育、不動産、製造業などで同じページ構成にしないでください。",
    "各pagesの headline / description / highlights / visualConcept はページごとに必ず変えてください。トップページ、会社概要、サービス紹介、お問い合わせで同じ文章を使い回さないでください。",
    "各pages.descriptionは最低80文字以上にし、同じ語尾・同じ説明構造を繰り返さないでください。",
    "各pages.highlightsは、そのページでしか使わない具体項目にしてください。例えば会社概要なら理念・沿革・体制、サービスなら提供メニュー・比較軸、問い合わせなら入力項目・相談の流れ、業界固有ページならその業界の閲覧目的に合わせてください。",
    "各pages.visualConceptは、ページごとに異なるレイアウト方針を書いてください。例: 会社沿革タイムライン、サービス比較表、商品カタログ、予約フォーム、事例フロー、記事一覧レイアウトなど。",
    "各分岐ページは、最低限そのページ単体で開いても意味が通る内容にしてください。サービスページならサービス比較、会社概要なら理念・強み、問い合わせページなら相談フォーム導線、業界固有ページならその業界の閲覧目的に合わせてください。",
    "demoPlan.visualStyle.layout には、業界プリセットの sitePersonality と visualDirection を反映してください。",
    "homeSections.items には、業界プリセットの services、customerConcerns、primarySections、contentKeywords を活用してください。",
    additionalFeatures.length > 0 ? `追加機能（requiredFeaturesに入れない場合でもhomeSectionsまたはimplementationNotesへ必ず整理）: ${additionalFeatures.join("、")}` : "追加機能はありません。",
    "ユーザー入力が不足している場合は、以下の業界プリセットを参考に自然な日本語で補完してください。ただし会社名、ユーザーが入力したスローガン、会社説明は優先してください。",
    JSON.stringify(preset, null, 2),
    "参考用の初期Demo Plan JSONです。必要に応じて、より自然で顧客に合う内容へ改善してください。",
    JSON.stringify(compactPlan, null, 2),
  ].join("\n");
}

export const deepSeekProvider: AiProvider = {
  name: "syncCraft",
  model: "SyncCraft 多年経験型 自社AIエージェント v1",
  async generateWebsiteSummary(input: AgentProviderInput): Promise<AgentProviderResult> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured.");
    }

    const fallbackPlan = buildDemoPlan(input.proposal);
    const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
    const apiModel = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
    const timeoutMs = Number(process.env.SYNC_CRAFT_PROVIDER_TIMEOUT_MS ?? 45000);
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      body: JSON.stringify({
        model: apiModel,
        messages: [
          {
            role: "system",
            content: [
              input.prompt.systemPrompt,
              "あなたはSyncCraftの多年経験型 自社AIエージェントです。",
              "日本企業向けの自然なビジネス日本語で、実装に渡せる具体的なDemo Plan JSONを作成してください。",
            ].join("\n"),
          },
          {
            role: "user",
            content: buildDeepSeekInstruction(input, fallbackPlan),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.55,
        max_tokens: 5200,
        stream: false,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API request failed: ${response.status}`);
    }

    const completion = await response.json() as DeepSeekChatCompletion;
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek API response did not include content.");
    }

    const parsed = parseJsonContent(content);
    const demoPlan = applyCustomerContent(normalizeDemoPlan(parsed.demoPlan, fallbackPlan, input), input);
    const summary = normalizeSummary(parsed.summary, demoPlan, input);
    const previewPages = renderDemoSitePages(demoPlan);
    const previewHtml = previewPages[0]?.html ?? "";

    return {
      provider: "syncCraft",
      model: this.model,
      summary,
      demoPlan,
      previewHtml,
      previewPages,
      rawText: content,
    };
  },
};
