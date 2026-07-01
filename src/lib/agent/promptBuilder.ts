import type { AgentPrompt } from "@/types/agent";
import type { ProposalJson } from "@/types/proposal";

const yen = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

function list(items: string[]) {
  return items.length > 0 ? items.join("、") : "指定なし";
}

function compactList(items: string[], limit: number) {
  if (items.length <= limit) return list(items);

  return `${items.slice(0, limit).join("、")}、ほか${items.length - limit}件`;
}

export function buildDemoPrompt(proposal: ProposalJson): AgentPrompt {
  const keyFeatures = proposal.website.features.slice(0, 8);
  const remainingFeatures = proposal.website.features.slice(8);
  const keyPages = proposal.recommendation.pages.slice(0, 8);

  const systemPrompt = [
    "あなたは日本市場向けのWebサイト制作ディレクターです。",
    "同時に、上場企業や成長企業向けの高品質なWebサイトを設計するシニアUI/UXストラテジストです。",
    "目的は、顧客のProposal JSONを読み取り、後続のHTML/Next.js生成工程が迷わないようにDemo Plan JSONを作ることです。",
    "この段階ではコードを書かず、デモサイトの構造、ページ、セクション、CTA、デザイン方針、必要機能を明確にしてください。",
    "出力は日本語の構造化JSONを想定し、実装者がそのまま次工程に渡せる具体性を保ってください。",
    "抽象的な表現、一般的すぎる見出し、どの会社にも使える文章は避けてください。",
    "顧客の業界、会社説明、目的、必要機能、デザインスタイルを必ず反映してください。",
    "顧客の入力が短い場合は、業界特性に合わせてスローガン、サービス説明、課題、CTA、ページ内容を自然に補完してください。",
    "顧客入力はそのまま転載するだけでなく、事業内容がより魅力的に伝わるように自然な日本語へ改善してください。",
    "業界ごとに必要なページ、セクション、訴求順、CTAは変えてください。全業界で同じ企業サイト構成にしないでください。",
  ].join("\n");

  const userPrompt = [
    "以下のProposal JSONをもとに、デモサイト生成用のDemo Plan JSONを作成してください。",
    "複雑な要件でも、初回デモでは全機能を詳細実装しようとせず、主要導線が伝わる基礎展示用Demo Planに圧縮してください。",
    "",
    "【会社情報】",
    `会社名: ${proposal.company.name}`,
    `業界: ${proposal.company.industry}`,
    `スローガン: ${proposal.company.slogan || "指定なし"}`,
    `会社説明: ${proposal.company.description}`,
    `連絡先: ${proposal.company.contactInfo || "指定なし"}`,
    "",
    "【サイト要件】",
    `サイト種類: ${proposal.website.type}`,
    `制作目的: ${compactList(proposal.website.goals, 6)}`,
    `主要機能: ${compactList(keyFeatures, 8)}`,
    `追加機能メモ: ${remainingFeatures.length > 0 ? remainingFeatures.join("、") : "なし"}`,
    `デザインスタイル: ${proposal.website.designStyle}`,
    `メインカラー: ${proposal.website.mainColor}`,
    `参考サイト: ${list(proposal.website.referenceSites)}`,
    `参考メモ: ${proposal.website.referenceNote || "指定なし"}`,
    "",
    "【見積もり・制作規模】",
    `見積もり区間: ${yen.format(proposal.estimate.minPrice)}〜${yen.format(proposal.estimate.maxPrice)}`,
    `複雑度: ${proposal.estimate.complexity}`,
    `想定開発期間: ${proposal.estimate.developmentPeriod}`,
    "",
    "【推奨構成】",
    `初回デモ対象ページ: ${list(keyPages)}`,
    `全体推奨ページ数: ${proposal.recommendation.pages.length}ページ`,
    `推奨技術スタック: ${list(proposal.recommendation.techStack)}`,
    "",
    "【作成してほしいDemo Plan JSONの内容】",
    "1. siteName / siteType / industry",
    "2. visualStyle: designStyle, mainColor, tone, layout",
    "3. contentStrategy: primaryMessage, targetAudience, conversionGoal, ctaLabel",
    "4. pages: ページ名、役割、必要セクション、ページ専用見出し、説明、重点項目、CTA、ビジュアル方針",
    "5. homeSections: hero, services, features, cta などの構造",
    "6. requiredFeatures: 実装時に必要な機能",
    "7. implementationNotes: HTML/Next.js生成時の注意点",
    "",
    "【品質条件】",
    "- トップページだけでなく、会社概要、サービス紹介、お問い合わせなど各ページの役割が明確に違う構成にしてください。",
    "- 初回デモの pages は最大8ページまでにしてください。必要機能が多い場合は、機能専用ページまたはトップページ内の機能セクションとして必ず見える形にしてください。",
    "- requiredFeatures には主要機能を入れてください。入り切らない機能も implementationNotes または homeSections に必ず明示してください。",
    "- 各分岐ページは同じ文章や同じ構成にせず、ページごとに headline / description / highlights / visualConcept を具体的に変えてください。",
    "- homeSections は最低6個作成してください。",
    "- 各sectionのtitleは顧客の事業内容に寄せた具体的な見出しにしてください。",
    "- section.content は1文で終わらせず、顧客がそのままデモとして見られる自然な日本語にしてください。",
    "- デザイン方針はApple、Vercel、Linear、Stripeのような高品質なプロダクトサイトを意識してください。",
    "- CTAは業界と目的に合わせて具体化してください。",
    "- ユーザーが選択した業界に合わない一般文言は避け、業界ごとの具体的な課題やサービス名を入れてください。",
    "- 会社説明が短い場合でも、業界特性に合わせてサービス、強み、顧客課題、相談導線を補完してください。",
    "- サイト種類だけでなく業界も反映し、医療なら診療・初診・予約、小売なら商品・購入導線、教育ならコース・無料体験のように、業界固有のページ体験を作ってください。",
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
    fullPrompt: `${systemPrompt}\n\n---\n\n${userPrompt}`,
  };
}
