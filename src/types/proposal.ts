export type Industry =
  | "it"
  | "manufacturing"
  | "retail"
  | "restaurant"
  | "beauty"
  | "medical"
  | "realEstate"
  | "education"
  | "finance"
  | "recruitment"
  | "other";

export type WebsiteType =
  | "corporate"
  | "brand"
  | "ec"
  | "reservation"
  | "aiService"
  | "saas"
  | "lp"
  | "portfolio"
  | "other";

export type WebsiteGoal =
  | "companyProfile"
  | "leadGeneration"
  | "contact"
  | "recruiting"
  | "reservation"
  | "onlineSales"
  | "branding"
  | "news"
  | "caseStudies"
  | "other";

export type Feature =
  | "contact"
  | "form"
  | "blog"
  | "news"
  | "reservation"
  | "payment"
  | "login"
  | "membership"
  | "aiChat"
  | "multilingual"
  | "cms"
  | "admin"
  | "googleMap"
  | "faq"
  | "seo"
  | "analytics"
  | "productManagement"
  | "download";

export type DesignStyle =
  | "apple"
  | "modern"
  | "business"
  | "japanese"
  | "luxury"
  | "minimal"
  | "technology";

export type MainColor =
  | "blue"
  | "black"
  | "green"
  | "red"
  | "gold"
  | "purple"
  | "orange"
  | "custom";

export type Complexity = "シンプル" | "スタンダード" | "ハイグレード";

export type RequirementInput = {
  companyName: string;
  industry: Industry | "";
  slogan: string;
  companyDescription: string;
  contactInfo: string;
  logo: string;
  websiteType: WebsiteType | "";
  websiteGoals: WebsiteGoal[];
  features: Feature[];
  designStyle: DesignStyle | "";
  mainColor: MainColor | "";
  referenceSites: string[];
  referenceNote: string;
};

export type PricingResult = {
  basePrice: number;
  featurePrice: number;
  totalPrice: number;
  minPrice: number;
  maxPrice: number;
  complexity: Complexity;
  developmentPeriod: string;
};

export type ProposalJson = {
  version: "1.0";
  language: "ja";
  market: "Japan";
  generatedAt: string;
  company: {
    name: string;
    industry: string;
    slogan: string;
    description: string;
    contactInfo: string;
    logo: string;
  };
  website: {
    type: string;
    goals: string[];
    features: string[];
    designStyle: string;
    mainColor: string;
    referenceSites: string[];
    referenceNote: string;
  };
  estimate: PricingResult;
  recommendation: {
    pages: string[];
    techStack: string[];
  };
  agentInstruction: {
    purpose: "demo_site_generation";
    status: "ready_for_agent";
    note: string;
  };
};
