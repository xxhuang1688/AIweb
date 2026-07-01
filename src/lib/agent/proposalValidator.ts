import type { ProposalJson } from "@/types/proposal";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateProposalJson(value: unknown): { proposal: ProposalJson | null; errors: string[] } {
  const errors: string[] = [];

  if (!isObject(value)) {
    return { proposal: null, errors: ["Proposal JSONが正しい形式ではありません。"] };
  }

  const proposal = value as Partial<ProposalJson>;

  if (proposal.version !== "1.0") errors.push("version は 1.0 である必要があります。");
  if (proposal.language !== "ja") errors.push("language は ja である必要があります。");

  if (!isObject(proposal.company)) {
    errors.push("company が不足しています。");
  } else {
    if (!hasText(proposal.company.name)) errors.push("company.name が不足しています。");
    if (!hasText(proposal.company.industry)) errors.push("company.industry が不足しています。");
    if (!hasText(proposal.company.description)) errors.push("company.description が不足しています。");
  }

  if (!isObject(proposal.website)) {
    errors.push("website が不足しています。");
  } else {
    if (!hasText(proposal.website.type)) errors.push("website.type が不足しています。");
    if (!hasStringArray(proposal.website.goals)) errors.push("website.goals が正しい形式ではありません。");
    if (!hasStringArray(proposal.website.features)) errors.push("website.features が正しい形式ではありません。");
    if (!hasText(proposal.website.designStyle)) errors.push("website.designStyle が不足しています。");
    if (!hasText(proposal.website.mainColor)) errors.push("website.mainColor が不足しています。");
  }

  if (!isObject(proposal.estimate)) {
    errors.push("estimate が不足しています。");
  } else {
    if (typeof proposal.estimate.minPrice !== "number") errors.push("estimate.minPrice が不足しています。");
    if (typeof proposal.estimate.maxPrice !== "number") errors.push("estimate.maxPrice が不足しています。");
    if (!hasText(proposal.estimate.complexity)) errors.push("estimate.complexity が不足しています。");
    if (!hasText(proposal.estimate.developmentPeriod)) errors.push("estimate.developmentPeriod が不足しています。");
  }

  if (!isObject(proposal.recommendation)) {
    errors.push("recommendation が不足しています。");
  } else {
    if (!hasStringArray(proposal.recommendation.pages)) errors.push("recommendation.pages が正しい形式ではありません。");
    if (!hasStringArray(proposal.recommendation.techStack)) errors.push("recommendation.techStack が正しい形式ではありません。");
  }

  return {
    proposal: errors.length === 0 ? (proposal as ProposalJson) : null,
    errors,
  };
}
