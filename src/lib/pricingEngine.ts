import { featurePrices, websiteBasePrices } from "@/config/proposalConfig";
import type { PricingResult, RequirementInput } from "@/types/proposal";

const roundToTenThousand = (price: number) => Math.round(price / 10000) * 10000;

export function calculatePricing(input: RequirementInput): PricingResult {
  const websiteType = input.websiteType || "other";
  const basePrice = websiteBasePrices[websiteType] ?? websiteBasePrices.other;
  const featureSubtotal = input.features.reduce((sum, feature) => sum + (featurePrices[feature] ?? 0), 0);
  const featureCount = input.features.length;
  const complexitySurchargeRate = featureCount >= 10 ? 0.35 : featureCount >= 5 ? 0.18 : featureCount >= 3 ? 0.08 : 0;
  const complexitySurcharge = roundToTenThousand(featureSubtotal * complexitySurchargeRate);
  const featurePrice = featureSubtotal + complexitySurcharge;
  const totalPrice = basePrice + featurePrice;

  const complexity =
    featureCount <= 4
      ? "シンプル"
      : featureCount <= 9
        ? "スタンダード"
        : "ハイグレード";

  const developmentPeriod = featureCount <= 2
    ? "2〜3週間"
    : featureCount <= 4
      ? "3〜5週間"
      : featureCount <= 7
        ? "5〜8週間"
        : featureCount <= 9
          ? "6〜10週間"
          : "10〜16週間";

  return {
    basePrice,
    featurePrice,
    totalPrice,
    minPrice: roundToTenThousand(totalPrice * 0.85),
    maxPrice: roundToTenThousand(totalPrice * 1.25),
    complexity,
    developmentPeriod,
  };
}
