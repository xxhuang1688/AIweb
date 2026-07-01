import type {
  DesignStyle,
  Feature,
  Industry,
  MainColor,
  RequirementInput,
  WebsiteGoal,
  WebsiteType,
} from "@/types/proposal";
import { defaultRequirement } from "./defaultRequirement";

export type QueryValue = string | string[] | undefined;
export type QueryRecord = Record<string, QueryValue>;

function valueOf(query: QueryRecord, key: keyof RequirementInput) {
  const value = query[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function valuesOf(query: QueryRecord, key: keyof RequirementInput) {
  const value = query[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function requirementFromQuery(query: QueryRecord): RequirementInput {
  return {
    ...defaultRequirement,
    companyName: valueOf(query, "companyName"),
    industry: valueOf(query, "industry") as Industry | "",
    slogan: valueOf(query, "slogan"),
    companyDescription: valueOf(query, "companyDescription"),
    contactInfo: valueOf(query, "contactInfo"),
    logo: valueOf(query, "logo"),
    websiteType: valueOf(query, "websiteType") as WebsiteType | "",
    websiteGoals: valuesOf(query, "websiteGoals") as WebsiteGoal[],
    features: valuesOf(query, "features") as Feature[],
    designStyle: valueOf(query, "designStyle") as DesignStyle | "",
    mainColor: valueOf(query, "mainColor") as MainColor | "",
    referenceSites: valuesOf(query, "referenceSites").length > 0 ? valuesOf(query, "referenceSites") : [""],
    referenceNote: valueOf(query, "referenceNote"),
  };
}

export function stepFromQuery(query: QueryRecord) {
  const rawStep = query.step;
  const value = Number(Array.isArray(rawStep) ? rawStep[0] : rawStep);

  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 6);
}

export function queryFromRequirement(input: RequirementInput, step?: number) {
  const params = new URLSearchParams();

  if (step != null) params.set("step", String(step));

  Object.entries(input).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
      return;
    }

    if (value) params.set(key, value);
  });

  return params.toString();
}
