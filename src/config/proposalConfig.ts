import type { DesignStyle, Feature, Industry, MainColor, WebsiteGoal, WebsiteType } from "@/types/proposal";

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const industryOptions: Option<Industry>[] = [
  { value: "it", label: "IT・ソフトウェア" },
  { value: "manufacturing", label: "製造業" },
  { value: "retail", label: "小売・EC" },
  { value: "restaurant", label: "飲食店" },
  { value: "beauty", label: "美容・サロン" },
  { value: "medical", label: "医療・クリニック" },
  { value: "realEstate", label: "不動産" },
  { value: "education", label: "教育・スクール" },
  { value: "finance", label: "金融・士業" },
  { value: "recruitment", label: "採用・人材" },
  { value: "other", label: "その他" },
];

export const websiteTypeOptions: Option<WebsiteType>[] = [
  { value: "corporate", label: "企業サイト", description: "会社紹介と信頼獲得を中心にした標準的なサイトです。" },
  { value: "brand", label: "ブランドサイト", description: "世界観や価値観を強く伝えるサイトです。" },
  { value: "ec", label: "ECサイト", description: "商品販売、決済、商品管理を想定します。" },
  { value: "reservation", label: "予約サイト", description: "予約受付や空き状況確認を重視します。" },
  { value: "aiService", label: "AIサービスサイト", description: "AIプロダクトの紹介やデモ導線を整理します。" },
  { value: "saas", label: "SaaSサイト", description: "機能紹介、料金、導入事例、利用開始導線を設計します。" },
  { value: "lp", label: "LP", description: "単一の商品やキャンペーンの獲得に特化します。" },
  { value: "portfolio", label: "ポートフォリオ", description: "実績や作品を魅力的に見せます。" },
  { value: "other", label: "その他", description: "特殊な要件に合わせて個別に設計します。" },
];

export const websiteGoalOptions: Option<WebsiteGoal>[] = [
  { value: "companyProfile", label: "会社紹介" },
  { value: "leadGeneration", label: "集客" },
  { value: "contact", label: "お問い合わせ" },
  { value: "recruiting", label: "採用" },
  { value: "reservation", label: "予約受付" },
  { value: "onlineSales", label: "オンライン販売" },
  { value: "branding", label: "ブランディング" },
  { value: "news", label: "ニュース掲載" },
  { value: "caseStudies", label: "実績紹介" },
  { value: "other", label: "その他" },
];

export const featureOptions: Option<Feature>[] = [
  { value: "contact", label: "お問い合わせ" },
  { value: "form", label: "フォーム" },
  { value: "blog", label: "ブログ" },
  { value: "news", label: "ニュース" },
  { value: "reservation", label: "予約" },
  { value: "payment", label: "決済" },
  { value: "login", label: "ログイン" },
  { value: "membership", label: "会員機能" },
  { value: "aiChat", label: "AIチャット" },
  { value: "multilingual", label: "多言語" },
  { value: "cms", label: "CMS" },
  { value: "admin", label: "管理画面" },
  { value: "googleMap", label: "Google Map" },
  { value: "faq", label: "FAQ" },
  { value: "seo", label: "SEO" },
  { value: "analytics", label: "アクセス解析" },
  { value: "productManagement", label: "商品管理" },
  { value: "download", label: "資料ダウンロード" },
];

export const designStyleOptions: Option<DesignStyle>[] = [
  { value: "apple", label: "Apple風" },
  { value: "modern", label: "モダン" },
  { value: "business", label: "ビジネス" },
  { value: "japanese", label: "和風" },
  { value: "luxury", label: "ラグジュアリー" },
  { value: "minimal", label: "ミニマル" },
  { value: "technology", label: "テクノロジー" },
];

export const colorOptions: Option<MainColor>[] = [
  { value: "blue", label: "ブルー" },
  { value: "black", label: "ブラック" },
  { value: "green", label: "グリーン" },
  { value: "red", label: "レッド" },
  { value: "gold", label: "ゴールド" },
  { value: "purple", label: "パープル" },
  { value: "orange", label: "オレンジ" },
  { value: "custom", label: "カスタム" },
];

export const websiteBasePrices: Record<WebsiteType, number> = {
  corporate: 300000,
  brand: 400000,
  ec: 800000,
  reservation: 500000,
  aiService: 500000,
  saas: 700000,
  lp: 180000,
  portfolio: 150000,
  other: 300000,
};

export const featurePrices: Record<Feature, number> = {
  contact: 0,
  form: 30000,
  blog: 50000,
  news: 50000,
  reservation: 100000,
  payment: 200000,
  login: 150000,
  membership: 200000,
  aiChat: 200000,
  multilingual: 120000,
  cms: 180000,
  admin: 180000,
  googleMap: 20000,
  faq: 20000,
  seo: 50000,
  analytics: 50000,
  productManagement: 150000,
  download: 30000,
};

export const wizardSteps = [
  "会社情報",
  "サイト種類",
  "制作目的",
  "必要機能",
  "デザイン",
  "参考サイト",
  "入力内容の確認",
];
