import type { RequirementInput } from "@/types/proposal";

export function validateStep(step: number, input: RequirementInput) {
  const errors: string[] = [];

  if (step === 0) {
    if (!input.companyName.trim()) errors.push("会社名を入力してください。");
    if (!input.industry) errors.push("業界を選択してください。");
    if (input.companyDescription.trim().length < 10) {
      errors.push("会社説明を10文字以上で入力してください。");
    }
    if (!input.contactInfo.trim()) errors.push("連絡先を入力してください。");
  }

  if (step === 1 && !input.websiteType) errors.push("サイト種類を選択してください。");
  if (step === 2 && input.websiteGoals.length === 0) errors.push("制作目的を1つ以上選択してください。");
  if (step === 4) {
    if (!input.designStyle) errors.push("デザインスタイルを選択してください。");
    if (!input.mainColor) errors.push("メインカラーを選択してください。");
  }
  if (step === 5) {
    input.referenceSites
      .map((site) => site.trim())
      .filter(Boolean)
      .forEach((site) => {
        if (!/^https?:\/\/.+/i.test(site)) {
          errors.push("参考サイトURLは http:// または https:// から入力してください。");
        }
      });
  }
  return errors;
}

export function getFirstInvalidStep(input: RequirementInput, maxStep = 6) {
  for (let step = 0; step <= maxStep; step += 1) {
    const errors = validateStep(step, input);

    if (errors.length > 0) {
      return { step, errors };
    }
  }

  return null;
}
