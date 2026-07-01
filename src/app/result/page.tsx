import { redirect } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { buildProposal } from "@/lib/proposalBuilder";
import { queryFromRequirement, requirementFromQuery, type QueryRecord } from "@/lib/queryProposal";
import { getFirstInvalidStep } from "@/lib/validation";

export default async function ResultPage({ searchParams }: { searchParams: Promise<QueryRecord> }) {
  const query = await searchParams;
  const input = requirementFromQuery(query);
  const hasQueryInput = Object.keys(query).length > 0;
  const invalid = hasQueryInput ? getFirstInvalidStep(input) : null;

  if (invalid) {
    redirect(`/estimate?${queryFromRequirement(input, invalid.step)}&showErrors=1`);
  }

  const initialProposal = hasQueryInput ? buildProposal(input) : null;

  return <ResultView initialProposal={initialProposal} />;
}
