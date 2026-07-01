"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { validateProposalJson } from "@/lib/agent/proposalValidator";
import {
  clearCurrentDemoPreview,
  loadProposalText,
  parseProposal,
  saveCurrentDemoPreview,
  saveProposal,
  subscribeProposal,
} from "@/lib/storage";
import type { DemoGenerationResponse } from "@/types/agent";
import type { ProposalJson } from "@/types/proposal";

const yen = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

function roundToTenThousand(value: number) {
  return Math.round(value / 10000) * 10000;
}

function buildSyncCraftPeriod(period: string) {
  const numbers = period.match(/\d+/g)?.map(Number) ?? [];

  if (numbers.length >= 2) {
    const min = Math.max(1, Math.ceil(numbers[0] / 2));
    const max = Math.max(min, Math.ceil(numbers[1] / 2));
    return `${min}〜${max}週間`;
  }

  if (numbers.length === 1) {
    return `約${Math.max(1, Math.ceil(numbers[0] / 2))}週間`;
  }

  return "通常の約半分";
}

function estimateGenerationSeconds(proposal: ProposalJson) {
  const featureCount = proposal.website.features.length;
  const pageCount = proposal.recommendation.pages.length;
  const complexityBonus = proposal.estimate.complexity === "ハイグレード" ? 28 : proposal.estimate.complexity === "スタンダード" ? 16 : 8;

  return Math.min(120, Math.max(28, 18 + featureCount * 5 + pageCount * 3 + complexityBonus));
}

function buildGenerationStep(progress: number) {
  if (progress < 25) return "要件と機能を解析しています";
  if (progress < 48) return "ページ構成と導線を設計しています";
  if (progress < 72) return "SyncCraft AIエージェントでデモ構成を生成しています";
  if (progress < 94) return "HTMLプレビューを組み立てています";
  if (progress < 100) return "最終チェック中です";
  return "生成が完了しました";
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-zinc-900/10 bg-white px-3 py-1 text-sm text-zinc-600">
          {item}
        </span>
      ))}
    </div>
  );
}

export function ResultView({ initialProposal }: { initialProposal: ProposalJson | null }) {
  const proposalText = useSyncExternalStore(subscribeProposal, loadProposalText, () => null);
  const storedProposal = useMemo(() => (proposalText ? parseProposal(proposalText) : null), [proposalText]);
  const proposal = initialProposal ?? storedProposal;
  const proposalValidation = useMemo(() => (proposal ? validateProposalJson(proposal) : null), [proposal]);
  const proposalErrors = proposalValidation?.errors ?? [];
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationRemainingSeconds, setGenerationRemainingSeconds] = useState(0);
  const [estimatedGenerationSeconds, setEstimatedGenerationSeconds] = useState(0);
  const [agentResponse, setAgentResponse] = useState<DemoGenerationResponse | null>(null);
  const [selectedPreviewPage, setSelectedPreviewPage] = useState("index.html");
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialProposal) {
      saveProposal(initialProposal);
    }
  }, [initialProposal]);

  useEffect(() => {
    const pages = agentResponse?.result?.previewPages ?? [];
    const currentPage = pages.find((page) => page.fileName === selectedPreviewPage) ?? pages[0];

    if (currentPage) {
      saveCurrentDemoPreview({
        title: `${agentResponse?.result?.demoPlan.siteName ?? "SyncCraft Demo"} / ${currentPage.name}`,
        html: currentPage.html,
        selectedFileName: currentPage.fileName,
        pages,
      });
    }
  }, [agentResponse, selectedPreviewPage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; fileName?: string };
      const pages = agentResponse?.result?.previewPages ?? [];

      if (data.type !== "sync-craft-open-page" || !data.fileName) return;
      if (!pages.some((page) => page.fileName === data.fileName)) return;

      setSelectedPreviewPage(data.fileName);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [agentResponse]);

  if (!proposal) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-5 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">制作プランがまだありません</h1>
          <p className="mt-3 text-zinc-600">先に見積もり質問に回答してください。</p>
          <Link href="/estimate" className="mt-6 inline-block rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white">
            見積もりを始める
          </Link>
        </div>
      </main>
    );
  }

  const jsonText = JSON.stringify(proposal, null, 2);
  const syncCraftMinPrice = roundToTenThousand(proposal.estimate.minPrice * 0.4);
  const syncCraftMaxPrice = roundToTenThousand(proposal.estimate.maxPrice * 0.6);
  const syncCraftDevelopmentPeriod = buildSyncCraftPeriod(proposal.estimate.developmentPeriod);

  const generateDemo = async () => {
    if (proposalErrors.length > 0) {
      setMessage("会社情報が不足しています。見積もりフォームから入力内容を確認してください。");
      return;
    }

    setMessage("");
    setAgentResponse(null);
    setSelectedPreviewPage("index.html");
    clearCurrentDemoPreview();
    setIsGenerating(true);
    const estimatedSeconds = estimateGenerationSeconds(proposal);
    const startedAt = Date.now();
    setEstimatedGenerationSeconds(estimatedSeconds);
    setGenerationRemainingSeconds(estimatedSeconds);
    setGenerationProgress(8);

    const progressTimer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const adjustedDuration = estimatedSeconds * 1.35;
      const nextProgress = Math.min(98, Math.max(8, Math.round((elapsedSeconds / adjustedDuration) * 100)));

      setGenerationProgress((current) => Math.max(current, nextProgress));
      setGenerationRemainingSeconds(Math.max(1, estimatedSeconds - elapsedSeconds));
    }, 500);

    try {
      const request = fetch("/api/generate-demo", {
        body: JSON.stringify({ proposal, provider: "syncCraft" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const minimumWait = new Promise((resolve) => window.setTimeout(resolve, 1200));
      const [response] = await Promise.all([request, minimumWait]);
      const data = (await response.json()) as DemoGenerationResponse;

      setAgentResponse(data);
      setSelectedPreviewPage(data.result?.previewPages[0]?.fileName ?? "index.html");
      setGenerationProgress((current) => Math.max(current, 96));
      setGenerationRemainingSeconds(1);

      if (data.status === "generated") {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        setGenerationProgress(100);
        setGenerationRemainingSeconds(0);
        setMessage("デモサイトを生成しました。下のプレビューで確認できます。");
        window.setTimeout(() => {
          previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      } else {
        setMessage("AIエージェントの処理に失敗しました。入力内容を確認してください。");
      }
    } catch {
      setMessage("通信中にエラーが発生しました。もう一度お試しください。");
    } finally {
      window.clearInterval(progressTimer);
      setIsGenerating(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proposal.company.name || "website-proposal"}-proposal.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPreviewHtml = () => {
    const pages = agentResponse?.result?.previewPages ?? [];
    const currentPage = pages.find((page) => page.fileName === selectedPreviewPage) ?? pages[0];
    const html = currentPage?.html ?? agentResponse?.result?.previewHtml;

    if (!html) return;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentPage?.fileName ?? `${proposal.company.name || "sync-craft"}-demo.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-8 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_34%,rgba(132,204,22,0.08))]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] border border-zinc-900/10 bg-white/82 p-6 shadow-[0_36px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">SyncCraft 制作プラン</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
              {proposal.company.name}
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-600">
              入力内容をもとに、制作費・開発期間・推奨構成・標準JSONを作成しました。長年のWeb制作経験をもとに自社開発したAIエージェントが、開発へ進めるための提案データとして整理しています。
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateDemo}
                disabled={isGenerating || proposalErrors.length > 0}
                className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {isGenerating ? "エージェント処理中" : "デモサイトを無料生成"}
              </button>
              <Link href="/estimate" className="rounded-full border border-zinc-900/10 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-white">
                最初からやり直す
              </Link>
            </div>
            {message ? <p className="text-sm font-medium text-zinc-600">{message}</p> : null}
          </div>
          </div>
        </div>

        {proposalErrors.length > 0 ? (
          <section className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">入力内容が不足しています。</p>
            <p className="mt-2 text-sm leading-6">
              デモサイトを生成するには、会社名、業界、会社説明、サイト種類、デザインなどの必須情報が必要です。
            </p>
            <Link href="/estimate" className="mt-4 inline-block rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white">
              見積もりフォームを確認する
            </Link>
          </section>
        ) : null}

        {(isGenerating || generationProgress === 100) ? (
          <section className="mb-6 rounded-3xl border border-zinc-900/10 bg-white/82 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">デモ生成ステータス</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {isGenerating ? buildGenerationStep(generationProgress) : "デモサイトの生成が完了しました"}
                </h2>
                {isGenerating ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    予定時間：約{estimatedGenerationSeconds}秒 / 残り約{generationRemainingSeconds}秒
                  </p>
                ) : null}
              </div>
              <span className="w-fit rounded-full bg-zinc-950 px-3 py-1 text-sm font-semibold text-white">
                {generationProgress}%
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#18181b,#14b8a6,#84cc16)] transition-all duration-300" style={{ width: `${generationProgress}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {isGenerating
                ? "選択された機能数、ページ数、複雑度に応じて生成内容を調整しています。完了後、自動でプレビューへ移動します。"
                : "下のHTMLプレビューで確認できます。別ページで開いて、実際のWebサイトに近い状態でも確認できます。"}
            </p>
          </section>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-zinc-500">見積もり区間</p>
            <p className="mt-3 text-2xl font-semibold">
              {yen.format(proposal.estimate.minPrice)}
              {"〜"}
              {yen.format(proposal.estimate.maxPrice)}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              基本制作費 {yen.format(proposal.estimate.basePrice)} + 機能・複雑度加算 {yen.format(proposal.estimate.featurePrice)}
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              サーバー、ドメイン、外部サービス利用料などの購入費用は別途です。
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-zinc-500">複雑度</p>
            <p className="mt-3 text-2xl font-semibold">{proposal.estimate.complexity}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              選択機能数：{proposal.website.features.length}件。機能が増えるほど設計・実装・確認範囲が広がります。
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <p className="text-sm text-zinc-500">開発期間</p>
            <p className="mt-3 text-2xl font-semibold">{proposal.estimate.developmentPeriod}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              機能数と複雑度に応じて自動調整しています。
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">制作会社比較</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">SyncCraftで制作する場合、費用・期間・メンテナンスまで最適化できます</h2>
            </div>
            <span className="max-w-full rounded-2xl bg-zinc-950 px-3 py-1 text-center text-sm font-semibold leading-6 text-white">
              40〜最大60%OFF・期間約1/2・1年間無料メンテナンス
            </span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-900/10 bg-zinc-50/80 p-5">
              <p className="text-sm font-medium text-zinc-500">通常の制作会社</p>
              <p className="mt-3 text-2xl font-semibold">
                {yen.format(proposal.estimate.minPrice)}
                {"〜"}
                {yen.format(proposal.estimate.maxPrice)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">開発期間：{proposal.estimate.developmentPeriod}</p>
            </div>
            <div className="rounded-2xl border border-zinc-950 bg-zinc-950 p-5 text-white">
              <p className="text-sm font-medium text-zinc-300">SyncCraftで制作する場合</p>
              <p className="mt-3 text-2xl font-semibold">
                {yen.format(syncCraftMinPrice)}
                {"〜"}
                {yen.format(syncCraftMaxPrice)}
              </p>
              <p className="mt-2 text-sm text-zinc-300">開発期間：{syncCraftDevelopmentPeriod}</p>
              <p className="mt-2 text-sm text-zinc-300">メンテナンス：公開後1年間無料</p>
              <p className="mt-2 text-sm text-zinc-300">サーバー・ドメイン：取得、初期設定、公開作業までまとめて対応</p>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                長年のWeb制作経験をもとに自社開発したSyncCraft AIエージェントにより、要件整理、構成作成、デモ準備を効率化します。制作費は通常見積もりから40%OFF、条件により最大60%OFFまで最適化します。サーバー、ドメイン、外部サービスの購入費用は別途ですが、ご希望の場合は選定、取得、設定、公開まで一括で代行します。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">プロジェクト概要</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">業界</dt>
                <dd className="mt-1 font-medium">{proposal.company.industry}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">サイト種類</dt>
                <dd className="mt-1 font-medium">{proposal.website.type}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">会社説明</dt>
                <dd className="mt-1 leading-6">{proposal.company.description}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">目的・機能</h2>
            <div className="mt-5 grid gap-5">
              <div>
                <p className="mb-2 text-sm text-zinc-500">制作目的</p>
                <Tags items={proposal.website.goals} />
              </div>
              <div>
                <p className="mb-2 text-sm text-zinc-500">必要機能</p>
                <Tags items={proposal.website.features.length ? proposal.website.features : ["追加機能なし"]} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">推奨ページ構成</h2>
            <div className="mt-5">
              <Tags items={proposal.recommendation.pages} />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold">推奨技術スタック</h2>
            <div className="mt-5">
              <Tags items={proposal.recommendation.techStack} />
            </div>
          </section>
        </div>

        {agentResponse ? (
          <section className="mt-6 rounded-3xl border border-zinc-900/10 bg-white/82 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">AIエージェント結果</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {agentResponse.status === "generated" ? "デモ生成ワークフローを準備しました" : "処理できませんでした"}
                </h2>
              </div>
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-semibold text-white">
                SyncCraft 自社AIエージェント
              </span>
            </div>

            {agentResponse.errors.length > 0 ? (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                {agentResponse.errors.join(" ")}
              </div>
            ) : null}

            {agentResponse.result ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-zinc-50 p-5">
                  <p className="text-sm text-zinc-500">サイト概要</p>
                  <h3 className="mt-2 text-lg font-semibold">{agentResponse.result.summary.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{agentResponse.result.summary.concept}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{agentResponse.result.summary.targetAudience}</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-5">
                  <p className="text-sm text-zinc-500">デザイン方針</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{agentResponse.result.summary.designDirection}</p>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-zinc-500">利用モデル</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm">
                      {agentResponse.result.model}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-5">
                  <p className="mb-3 text-sm text-zinc-500">想定ページ</p>
                  <Tags items={agentResponse.result.summary.pages} />
                </div>
                <div className="rounded-2xl bg-zinc-50 p-5">
                  <p className="mb-3 text-sm text-zinc-500">主要機能</p>
                  <Tags items={agentResponse.result.summary.keyFeatures} />
                </div>
              </div>
            ) : null}

            {agentResponse.result?.demoPlan ? (
              <div className="mt-6 rounded-2xl border border-zinc-900/10 bg-zinc-50/80 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Demo Plan JSON</p>
                    <h3 className="mt-2 text-xl font-semibold">{agentResponse.result.demoPlan.siteName}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {agentResponse.result.demoPlan.contentStrategy.primaryMessage}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm">
                    {agentResponse.result.demoPlan.visualStyle.designStyle} / {agentResponse.result.demoPlan.visualStyle.mainColor}
                  </span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-zinc-500">ターゲット</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{agentResponse.result.demoPlan.contentStrategy.targetAudience}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-zinc-500">CTA</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">{agentResponse.result.demoPlan.contentStrategy.ctaLabel}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-zinc-500">レイアウト</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{agentResponse.result.demoPlan.visualStyle.layout}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="mb-3 text-sm text-zinc-500">トップページ構成</p>
                  <div className="grid gap-3">
                    {agentResponse.result.demoPlan.homeSections.map((section) => (
                      <div key={section.id} className="rounded-2xl bg-white p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="font-semibold">{section.title}</h4>
                          <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                            {section.type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{section.subtitle}</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <details className="mt-5 rounded-2xl bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold">Demo Plan JSONを確認する</summary>
                  <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap text-xs leading-6 text-zinc-700">
                    {JSON.stringify(agentResponse.result.demoPlan, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}

            {agentResponse.result?.previewHtml ? (
              <div ref={previewSectionRef} className="mt-6 rounded-2xl border border-zinc-900/10 bg-white p-5 scroll-mt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">HTMLプレビュー</p>
                    <h3 className="mt-2 text-xl font-semibold">基礎展示用のデモサイト</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                      このデモは初回確認用の基礎表示です。設定内容や制作ノウハウ、技術的な詳細は保護のため一部非公開にしています。具体的な実装内容をご希望の場合はお問い合わせください。
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/demo-preview"
                      target="_blank"
                      rel="noreferrer"
                      className="w-fit rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      新しいページで開く
                    </a>
                    <button
                      type="button"
                      onClick={downloadPreviewHtml}
                      className="w-fit rounded-full border border-zinc-900/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      HTMLを無料ダウンロード
                    </button>
                  </div>
                </div>
                {agentResponse.result.previewPages?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {agentResponse.result.previewPages.map((page) => (
                      <button
                        key={page.fileName}
                        type="button"
                        onClick={() => setSelectedPreviewPage(page.fileName)}
                        className={[
                          "rounded-full px-4 py-2 text-sm font-semibold transition",
                          selectedPreviewPage === page.fileName
                            ? "bg-zinc-950 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        {page.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-900/10 bg-white">
                  <iframe
                    title="生成デモサイトプレビュー"
                    srcDoc={
                      agentResponse.result.previewPages?.find((page) => page.fileName === selectedPreviewPage)?.html
                      ?? agentResponse.result.previewPages?.[0]?.html
                      ?? agentResponse.result.previewHtml
                    }
                    className="h-[640px] w-full bg-white"
                  />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-zinc-900/10 bg-zinc-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">標準 JSON</h2>
              <p className="mt-1 text-sm text-zinc-400">AIエージェントに渡すための提案データです。</p>
            </div>
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              無料ダウンロード
            </button>
          </div>
          <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-zinc-100">
            {jsonText}
          </pre>
        </section>
      </div>
    </main>
  );
}
