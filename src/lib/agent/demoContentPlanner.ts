import {
  demoFeaturePages,
  demoGoalPages,
  demoSiteTypePages,
  findDemoIndustryContent,
} from "@/config/demoContentConfig";
import type { DemoPlanJson, DemoPlanSection } from "@/types/agent";
import type { ProposalJson } from "@/types/proposal";

function has(items: string[], keyword: string) {
  return items.some((item) => item.includes(keyword));
}

function mergeUnique(...groups: string[][]) {
  return Array.from(new Set(groups.flat().filter(Boolean)));
}

function ctaFor(proposal: ProposalJson, fallback: string) {
  const { website, company } = proposal;
  const reservationContext = website.type.includes("予約")
    || company.industry.includes("飲食")
    || company.industry.includes("美容")
    || company.industry.includes("医療")
    || company.industry.includes("教育");

  if (reservationContext && (has(website.features, "予約") || has(website.goals, "予約"))) return fallback;
  if (has(website.goals, "採用")) return "相談・応募する";
  if (has(website.goals, "オンライン販売") || has(website.features, "決済")) return "商品を見る";
  if (has(website.goals, "集客")) return company.industry.includes("飲食") ? "席を予約する" : fallback;
  return fallback || "お問い合わせする";
}

function buildTone(designStyle: string, industry: string) {
  if (designStyle.includes("ラグジュアリー")) return "上質で余白を活かした落ち着いたトーン";
  if (designStyle.includes("和風")) return "日本らしい静けさと信頼感を重視したトーン";
  if (designStyle.includes("テクノロジー")) return "先進性、明快さ、スピード感を感じるトーン";
  if (industry.includes("医療") || industry.includes("金融")) return "安心感、専門性、誠実さを重視したトーン";
  if (industry.includes("美容") || industry.includes("飲食")) return "雰囲気、安心感、予約しやすさを重視したトーン";
  return "読みやすく、信頼感があり、問い合わせにつながりやすいトーン";
}

function buildLayout(siteType: string, visualDirection: string) {
  if (siteType.includes("LP")) return `1ページ完結型で、訴求からCTAまでを縦長に整理する。${visualDirection}`;
  if (siteType.includes("EC")) return `商品一覧、商品詳細、購入導線を優先したグリッド型レイアウト。${visualDirection}`;
  if (siteType.includes("予約")) return `メニュー確認から予約完了までを短くつなぐ予約重視レイアウト。${visualDirection}`;
  if (siteType.includes("SaaS") || siteType.includes("AI")) return `機能価値、導入メリット、事例、CTAを段階的に見せるプロダクト型レイアウト。${visualDirection}`;
  return visualDirection;
}

function detailFor(pageName: string, profile: ReturnType<typeof findDemoIndustryContent>, companyName: string, ctaLabel: string) {
  const matched = Object.entries(profile.pageDetails).find(([keyword]) => pageName.includes(keyword))?.[1];

  if (matched) {
    return {
      headline: `${companyName}の${matched.headline}`,
      description: matched.description,
      highlights: matched.highlights,
      primaryCta: ctaLabel,
      visualConcept: matched.visualConcept,
    };
  }

  if (pageName.includes("会社")) {
    return {
      headline: `${companyName}の考え方と提供価値`,
      description: `${profile.label}の顧客に向けて、会社の姿勢、対応領域、相談しやすさを整理して伝えるページです。`,
      highlights: ["事業方針", "対応領域", "選ばれる理由", "基本情報"],
      primaryCta: ctaLabel,
      visualConcept: "理念・強み・基本情報をタイムラインとプロフィールカードで見せる会社紹介ページ",
    };
  }

  if (pageName.includes("お問い合わせ")) {
    return {
      headline: `${companyName}へのお問い合わせ`,
      description: "相談内容、希望時期、連絡先を迷わず伝えられるよう、入力項目と確認事項をシンプルにまとめます。",
      highlights: ["相談内容", "希望時期", "連絡先", "確認事項"],
      primaryCta: "お問い合わせする",
      visualConcept: "問い合わせフォーム、確認事項、送信後の流れを中心にした相談しやすいページ",
    };
  }

  if (pageName.includes("予約") || pageName.includes("相談") || pageName.includes("無料体験") || pageName.includes("初診")) {
    return {
      headline: `${companyName}の${pageName}`,
      description: "希望内容、日時、事前確認、申し込み後の流れを整理し、初めてでも安心して進めるページです。",
      highlights: ["内容選択", "希望日時", "事前確認", "受付完了"],
      primaryCta: ctaLabel,
      visualConcept: "予約・相談のステップと確認事項を中心にした行動しやすいページ",
    };
  }

  if (pageName.includes("FAQ") || pageName.includes("よくある質問")) {
    return {
      headline: `${companyName}のよくある質問`,
      description: "問い合わせ前に確認されやすい内容を先回りして整理し、相談前の不安を減らします。",
      highlights: ["料金について", "流れについて", "準備物について", "相談方法について"],
      primaryCta: ctaLabel,
      visualConcept: "質問と回答を短く分けたFAQページ",
    };
  }

  if (pageName.includes("ブログ") || pageName.includes("お役立ち情報")) {
    return {
      headline: `${companyName}の情報発信`,
      description: "専門情報、事例、ニュースを継続的に掲載し、検索流入と信頼形成につなげるページです。",
      highlights: ["記事一覧", "カテゴリ", "検索流入", "更新しやすさ"],
      primaryCta: ctaLabel,
      visualConcept: "記事カード、カテゴリ、更新日を整理したメディアページ",
    };
  }

  if (pageName.includes("ニュース") || pageName.includes("お知らせ")) {
    return {
      headline: `${companyName}のお知らせ`,
      description: "最新情報、キャンペーン、営業案内などを更新しやすく掲載するページです。",
      highlights: ["最新情報", "カテゴリ", "更新日", "詳細ページ"],
      primaryCta: ctaLabel,
      visualConcept: "ニュースリストとカテゴリで見せる更新情報ページ",
    };
  }

  if (pageName.includes("ログイン") || pageName.includes("マイページ")) {
    return {
      headline: `${companyName}の会員ページ`,
      description: "ログイン、会員情報、予約履歴、購入履歴など、利用者専用の導線を整理します。",
      highlights: ["ログイン", "会員情報", "履歴確認", "専用導線"],
      primaryCta: "ログインする",
      visualConcept: "ログインフォームと会員メニューを組み合わせたページ",
    };
  }

  if (pageName.includes("管理画面")) {
    return {
      headline: `${companyName}の管理画面`,
      description: "お知らせ、商品、予約、問い合わせなどを運用しやすく管理するための画面構成です。",
      highlights: ["お知らせ管理", "予約管理", "問い合わせ管理", "更新作業"],
      primaryCta: ctaLabel,
      visualConcept: "管理メニューとステータスカードで見せる運用画面",
    };
  }

  if (pageName.includes("資料")) {
    return {
      headline: `${companyName}の資料ダウンロード`,
      description: "サービス資料、料金資料、導入事例などをダウンロードできる導線を用意します。",
      highlights: ["サービス資料", "料金資料", "事例資料", "フォーム連携"],
      primaryCta: "資料をダウンロードする",
      visualConcept: "資料カードと入力フォームを組み合わせたページ",
    };
  }

  if (pageName.includes("アクセス")) {
    return {
      headline: `${companyName}のアクセス`,
      description: "所在地、営業時間、来店・来院前の確認事項、地図導線をわかりやすく整理します。",
      highlights: ["所在地", "営業時間", "Google Map", "来店案内"],
      primaryCta: ctaLabel,
      visualConcept: "地図カードと基本情報を組み合わせたアクセスページ",
    };
  }

  if (pageName.includes("購入ガイド")) {
    return {
      headline: `${companyName}の購入ガイド`,
      description: "支払い方法、配送、返品、購入前の確認事項を整理し、初回購入の不安を減らします。",
      highlights: ["支払い方法", "配送案内", "返品対応", "購入前確認"],
      primaryCta: "商品を見る",
      visualConcept: "購入ステップとFAQを組み合わせたガイドページ",
    };
  }

  if (pageName.includes("多言語")) {
    return {
      headline: `${companyName}の多言語案内`,
      description: "海外ユーザーや訪日客に向けて、主要情報をわかりやすく切り替えられる構成にします。",
      highlights: ["言語切替", "主要情報", "問い合わせ", "アクセス"],
      primaryCta: ctaLabel,
      visualConcept: "言語切替タブと主要情報カードで見せるページ",
    };
  }

  if (pageName.includes("相談サポート")) {
    return {
      headline: `${companyName}の相談サポート`,
      description: "AIチャットや相談導線を配置し、初回訪問者が必要な情報へ進みやすいページにします。",
      highlights: ["AIチャット", "質問候補", "相談導線", "回答履歴"],
      primaryCta: "相談を始める",
      visualConcept: "チャットパネルと質問候補を組み合わせたサポートページ",
    };
  }

  return {
    headline: `${companyName}の${pageName}`,
    description: `${profile.label}の${profile.customerName}が知りたい情報を、目的に合わせて読み進めやすく配置します。`,
    highlights: profile.primarySections.slice(0, 4),
    primaryCta: ctaLabel,
    visualConcept: "ページ目的に合わせてカード、説明文、CTAを整理した補助ページ",
  };
}

function roleFor(pageName: string) {
  if (pageName.includes("トップ")) return "第一印象を作り、主要CTAへ誘導する";
  if (pageName.includes("会社")) return "会社の信頼性、姿勢、基本情報を伝える";
  if (pageName.includes("サービス") || pageName.includes("専門")) return "提供内容、選ばれる理由、相談導線を説明する";
  if (pageName.includes("メニュー") || pageName.includes("料金") || pageName.includes("商品")) return "内容、価格、選び方を比較しやすく見せる";
  if (pageName.includes("スタッフ") || pageName.includes("医師") || pageName.includes("講師")) return "担当者の専門性、人柄、安心感を伝える";
  if (pageName.includes("実績") || pageName.includes("事例")) return "事例や成果を通じて信頼を高める";
  if (pageName.includes("予約") || pageName.includes("無料体験") || pageName.includes("初診")) return "申し込みや予約希望者を迷わず受付へ誘導する";
  if (pageName.includes("お問い合わせ")) return "相談、見積もり、問い合わせを受け付ける";
  if (pageName.includes("FAQ") || pageName.includes("よくある質問")) return "相談前の疑問を解消する";
  if (pageName.includes("ブログ") || pageName.includes("ニュース")) return "継続的な情報発信とSEO流入を担う";
  return "サイト目的に合わせた補助情報を整理する";
}

function selectPages(proposal: ProposalJson, profile: ReturnType<typeof findDemoIndustryContent>) {
  const fromSiteType = demoSiteTypePages[proposal.website.type] ?? [];
  const fromGoals = proposal.website.goals.flatMap((goal) => demoGoalPages[goal] ?? []);
  const fromFeatures = proposal.website.features.flatMap((feature) => demoFeaturePages[feature] ?? []);
  const candidates = mergeUnique(
    ["トップページ", "会社概要"],
    profile.primaryPages,
    fromSiteType,
    fromGoals,
    fromFeatures,
    proposal.recommendation.pages,
  );
  const selected: string[] = [];
  const priority = mergeUnique(["トップページ", "会社概要"], profile.primaryPages, fromSiteType, fromGoals, fromFeatures);

  for (const page of priority) {
    const matched = candidates.find((candidate) => candidate === page || candidate.includes(page) || page.includes(candidate));

    if (matched && !selected.includes(matched)) selected.push(matched);
    if (selected.length >= 8) break;
  }

  for (const page of candidates) {
    if (selected.length >= 8) break;
    if (!selected.includes(page)) selected.push(page);
  }

  return selected;
}

function homeSectionsFor(proposal: ProposalJson, profile: ReturnType<typeof findDemoIndustryContent>, ctaLabel: string): DemoPlanSection[] {
  const selectedFeatures = proposal.website.features.length > 0
    ? proposal.website.features
    : ["お問い合わせ"];

  const featureSections = selectedFeatures.length > 5
    ? [
      {
        id: "feature-coverage",
        type: "features" as const,
        title: "選択された機能をデモに反映",
        subtitle: "必要機能をページ内の導線として見える形にします",
        content: `${selectedFeatures.join("、")}を初回デモのナビゲーション、フォーム、カード、FAQ、運用導線に分けて配置します。`,
        items: selectedFeatures,
      },
    ]
    : [];

  return [
    {
      id: "hero",
      type: "hero",
      title: proposal.company.slogan || profile.primarySections[0],
      subtitle: `${profile.label}向けの${proposal.website.type}`,
      content: proposal.company.description || `${profile.services.join("、")}を中心に、${profile.customerName}が必要な情報へ迷わず進める構成にします。`,
      items: profile.primarySections.slice(0, 4),
      ctaLabel,
    },
    {
      id: "problem",
      type: "problem",
      title: `${profile.label}でよくある課題`,
      subtitle: `${profile.customerName}が行動前に確認したい情報を整理します`,
      content: `${profile.concerns.join("、")}といった課題に対して、ページ構成と導線を分けて解決します。`,
      items: profile.concerns,
    },
    {
      id: "services",
      type: "services",
      title: `${profile.label}向けサービス`,
      subtitle: "業界特性に合わせて必要な情報を整理します",
      content: `${proposal.company.name}の提供内容を、${profile.customerName}が比較しやすい形で見せます。`,
      items: profile.services,
      ctaLabel,
    },
    {
      id: "features",
      type: "features",
      title: "サイトに必要な機能",
      subtitle: "目的に合わせた機能を表側の導線として配置します",
      content: `${selectedFeatures.join("、")}を、${profile.label}の閲覧者が自然に使える形でページに組み込みます。`,
      items: mergeUnique(selectedFeatures, profile.contentKeywords),
    },
    ...featureSections,
    {
      id: "strengths",
      type: "caseStudies",
      title: "選ばれる理由",
      subtitle: `${profile.customerName}に伝えるべき判断材料`,
      content: `${profile.strengths.join("、")}を軸に、初回訪問でも信頼できる情報構成にします。`,
      items: profile.strengths,
    },
    {
      id: "final-cta",
      type: "cta",
      title: ctaLabel,
      subtitle: "気になる内容をすぐ相談できる導線を用意します",
      content: `${profile.customerName}が迷わず次の行動に進めるよう、主要ページからCTAへ自然につなげます。`,
      items: ["相談内容", "希望時期", "確認事項"],
      ctaLabel,
    },
  ];
}

export function buildDemoPlanFromContent(proposal: ProposalJson): DemoPlanJson {
  const profile = findDemoIndustryContent(proposal.company.industry);
  const ctaLabel = ctaFor(proposal, profile.ctaLabel);
  const pages = selectPages(proposal, profile);
  const homeSections = homeSectionsFor(proposal, profile, ctaLabel);
  const details = pages.map((page) => ({
    name: page,
    role: roleFor(page),
    sections: page.includes("トップ") ? homeSections.map((section) => section.id) : ["page-title", "main-content", "cta"],
    ...detailFor(page, profile, proposal.company.name, ctaLabel),
  }));

  return {
    version: "1.0",
    siteName: `${proposal.company.name} デモサイト`,
    siteType: proposal.website.type,
    industry: proposal.company.industry,
    language: "ja",
    company: {
      name: proposal.company.name,
      slogan: proposal.company.slogan,
      description: proposal.company.description,
      contactInfo: proposal.company.contactInfo,
      logo: proposal.company.logo,
    },
    visualStyle: {
      designStyle: proposal.website.designStyle,
      mainColor: proposal.website.mainColor,
      tone: buildTone(proposal.website.designStyle, proposal.company.industry),
      layout: buildLayout(proposal.website.type, profile.visualDirection),
    },
    contentStrategy: {
      primaryMessage: proposal.company.slogan || profile.primarySections[0],
      targetAudience: profile.targetAudience,
      conversionGoal: ctaLabel,
      ctaLabel,
    },
    pages: details,
    homeSections,
    requiredFeatures: mergeUnique(proposal.website.features, profile.contentKeywords).slice(0, 8),
    techStack: proposal.recommendation.techStack,
    implementationNotes: [
      "日本語の自然なビジネス文体で作成する。",
      `${profile.label}向けに、${profile.contentKeywords.join("、")}を自然に盛り込む。`,
      "ファーストビューでは会社の価値とCTAを明確にする。",
      "初回デモでは主要導線を優先し、詳細な連携処理は本番実装時に調整する。",
    ],
  };
}
