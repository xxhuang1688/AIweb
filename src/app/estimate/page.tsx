import Link from "next/link";
import { EstimateForm } from "@/components/EstimateForm";
import { requirementFromQuery, stepFromQuery, type QueryRecord } from "@/lib/queryProposal";
import { getFirstInvalidStep, validateStep } from "@/lib/validation";

export default async function EstimatePage({ searchParams }: { searchParams: Promise<QueryRecord> }) {
  const query = await searchParams;
  const requestedStep = stepFromQuery(query);
  const input = requirementFromQuery(query);
  const shouldShowCurrentErrors = query.showErrors === "1";
  const invalid = requestedStep > 0 ? getFirstInvalidStep(input, requestedStep - 1) : null;
  const step = invalid ? invalid.step : requestedStep;
  const errors = invalid?.errors ?? (shouldShowCurrentErrors ? validateStep(step, input) : []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-6 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_34%,rgba(132,204,22,0.08))]" />
      <div className="relative z-10 mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/10">
            S
          </span>
          <span>SyncCraft</span>
        </Link>
        <span className="rounded-full border border-zinc-900/10 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm backdrop-blur">
          無料見積もり
        </span>
      </div>
      <div className="relative z-10">
        <EstimateForm step={step} input={input} errors={errors} />
      </div>
    </main>
  );
}
