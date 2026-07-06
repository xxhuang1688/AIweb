"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { validateProposalJson } from "@/lib/agent/proposalValidator";
import {
  loadProposalText,
  parseProposal,
  saveProposal,
  subscribeProposal,
} from "@/lib/storage";
import type { ManualPaymentMethod, ManualPaymentOrderResponse } from "@/types/manualPayment";
import type { ProposalJson } from "@/types/proposal";

type InlineDownloadResponse = {
  status: "ok" | "pending" | "invalid_code" | "not_found";
  order: {
    orderId: string;
    companyName: string;
    createdAt: string;
    fileCount: number;
  } | null;
  files: Array<{
    fileName: string;
    label: string;
    contentType: string;
    previewUrl: string | null;
  }>;
  errors: string[];
};

type CustomerOrderStatusResponse = {
  status: "pending" | "confirmed" | "unauthorized" | "not_found";
  errors: string[];
  order: {
    orderId: string;
    companyName: string;
    accessCode: string | null;
    downloadUrl: string | null;
  } | null;
};

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

const paidDemoAmount = 990;

function estimateOrderPreparationSeconds(proposal: ProposalJson) {
  const featureCount = proposal.website.features.length;
  const pageCount = proposal.recommendation.pages.length;
  const complexityBonus = proposal.estimate.complexity === "ハイグレード" ? 30 : proposal.estimate.complexity === "スタンダード" ? 18 : 10;

  return Math.min(120, Math.max(35, 18 + featureCount * 5 + pageCount * 3 + complexityBonus));
}

function buildPreparationStep(progress: number) {
  if (progress < 18) return "入力内容を確認しています";
  if (progress < 36) return "業界・目的・必要機能を整理しています";
  if (progress < 58) return "デモサイトのページ構成を準備しています";
  if (progress < 78) return "HTMLファイルとProposal JSONを作成しています";
  if (progress < 96) return "注文番号とダウンロード情報を保存しています";

  return "最終確認中です";
}

function buildPaymentConfirmationText(input: {
  proposal: ProposalJson;
  response: ManualPaymentOrderResponse;
}) {
  const order = input.response.order;

  if (!order) return "";

  return [
    "SyncCraft デモサイト生成の支払い確認をお願いします。",
    "",
    `注文番号: ${order.orderId}`,
    `金額: ${order.amountJpy}円`,
    `会社名: ${input.proposal.company.name}`,
    `業界: ${input.proposal.company.industry}`,
    `メールアドレス: ${order.customerEmail}`,
    `お支払い名義: ${order.payerName}`,
    `お支払い方法: ${order.paymentMethod === "bank" ? "銀行振込" : "PayPay"}`,
    `注文ステータスURL: ${order.statusUrl}`,
    "",
    "お支払い確認後、認証コードの送付をお願いします。",
  ].join("\n");
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

function PreparationProgressPanel({
  estimatedPreparationSeconds,
  isSubmittingPayment,
  preparationProgress,
  preparationRemainingSeconds,
}: {
  estimatedPreparationSeconds: number;
  isSubmittingPayment: boolean;
  preparationProgress: number;
  preparationRemainingSeconds: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-900/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">デモ準備ステータス</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
            {preparationProgress === 100 ? "注文番号とデモデータの準備が完了しました" : buildPreparationStep(preparationProgress)}
          </h3>
          {isSubmittingPayment ? (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              予定時間：約{estimatedPreparationSeconds}秒 / 残り約{preparationRemainingSeconds}秒
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              下に表示された注文番号を確認し、お支払い完了後に確認メールを送信してください。
            </p>
          )}
        </div>
        <span className="w-fit rounded-full bg-zinc-950 px-3 py-1 text-sm font-semibold text-white">
          {preparationProgress}%
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#18181b,#14b8a6,#84cc16)] transition-all duration-500"
          style={{ width: `${preparationProgress}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        入力内容、必要機能、ページ構成をもとに、Demo HTML、PDFレポート、Proposal JSONをまとめて準備しています。
      </p>
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
  const [customerEmail, setCustomerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("bank");
  const [paymentNote, setPaymentNote] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [preparationProgress, setPreparationProgress] = useState(0);
  const [preparationRemainingSeconds, setPreparationRemainingSeconds] = useState(0);
  const [estimatedPreparationSeconds, setEstimatedPreparationSeconds] = useState(0);
  const [paymentResponse, setPaymentResponse] = useState<ManualPaymentOrderResponse | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<string[]>([]);
  const [copiedPaymentText, setCopiedPaymentText] = useState(false);
  const [showDownloadCodePanel, setShowDownloadCodePanel] = useState(false);
  const [downloadCode, setDownloadCode] = useState("");
  const [inlineDownloadResponse, setInlineDownloadResponse] = useState<InlineDownloadResponse | null>(null);
  const [isCheckingDownloadCode, setIsCheckingDownloadCode] = useState(false);
  const [autoDownloadMessage, setAutoDownloadMessage] = useState("");
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);
  const paymentResultRef = useRef<HTMLDivElement | null>(null);
  const downloadCodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialProposal) {
      saveProposal(initialProposal);
    }
  }, [initialProposal]);

  useEffect(() => {
    if (!showDownloadCodePanel || !paymentResponse?.order || inlineDownloadResponse?.status === "ok") {
      return;
    }

    const order = paymentResponse.order;
    let cancelled = false;

    const checkPaymentStatus = async () => {
      try {
        const statusPageUrl = new URL(order.statusUrl, window.location.origin);
        const token = statusPageUrl.searchParams.get("token") ?? "";
        const statusResult = await fetch(`/api/order-status/${encodeURIComponent(order.orderId)}?token=${encodeURIComponent(token)}`);
        const statusData = (await statusResult.json()) as CustomerOrderStatusResponse;

        if (cancelled) return;

        if (statusData.status === "confirmed" && statusData.order?.accessCode) {
          const accessCode = statusData.order.accessCode;
          setAutoDownloadMessage("入金確認が完了しました。ダウンロード内容を表示しています。");
          setDownloadCode(accessCode);

          const downloadResult = await fetch(`/api/download-order/${encodeURIComponent(order.orderId)}?code=${encodeURIComponent(accessCode)}`);
          const downloadData = (await downloadResult.json()) as InlineDownloadResponse;

          if (cancelled) return;

          setInlineDownloadResponse(downloadData);
          window.setTimeout(() => {
            downloadCodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 250);
          return;
        }

        if (statusData.status === "pending") {
          setAutoDownloadMessage("入金確認を自動で待機しています。確認が完了すると、この欄にダウンロード内容が表示されます。");
        }
      } catch {
        if (!cancelled) {
          setAutoDownloadMessage("自動確認中です。しばらくお待ちください。");
        }
      }
    };

    void checkPaymentStatus();
    const timer = window.setInterval(checkPaymentStatus, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [inlineDownloadResponse?.status, paymentResponse, showDownloadCodePanel]);

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

  const syncCraftMinPrice = roundToTenThousand(proposal.estimate.minPrice * 0.4);
  const syncCraftMaxPrice = roundToTenThousand(proposal.estimate.maxPrice * 0.6);
  const syncCraftDevelopmentPeriod = buildSyncCraftPeriod(proposal.estimate.developmentPeriod);

  const scrollToPayment = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitManualPaymentOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (proposalErrors.length > 0) {
      setPaymentErrors(["会社情報が不足しています。見積もりフォームから入力内容を確認してください。"]);
      return;
    }

    setIsSubmittingPayment(true);
    const estimatedSeconds = estimateOrderPreparationSeconds(proposal);
    const startedAt = Date.now();
    setEstimatedPreparationSeconds(estimatedSeconds);
    setPreparationRemainingSeconds(estimatedSeconds);
    setPreparationProgress(6);
    setPaymentErrors([]);
    setPaymentResponse(null);
    setCopiedPaymentText(false);
    setShowDownloadCodePanel(false);
    setDownloadCode("");
    setInlineDownloadResponse(null);
    setAutoDownloadMessage("");

    const progressTimer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const smoothProgress = Math.min(94, Math.max(6, Math.round((elapsedSeconds / (estimatedSeconds * 1.2)) * 100)));

      setPreparationProgress((current) => Math.max(current, smoothProgress));
      setPreparationRemainingSeconds(Math.max(1, estimatedSeconds - elapsedSeconds));
    }, 600);

    try {
      const response = await fetch("/api/manual-payment-order", {
        body: JSON.stringify({
          proposal,
          customerEmail,
          payerName,
          paymentMethod,
          note: paymentNote,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as ManualPaymentOrderResponse;

      setPaymentResponse(data);

      if (data.status !== "received") {
        setPaymentErrors(data.errors.length ? data.errors : ["入力内容を確認してください。"]);
        return;
      }

      setPreparationProgress(100);
      setPreparationRemainingSeconds(0);
      setMessage("注文番号とデモデータを準備しました。お支払い後、確認メールを送信してください。");
      window.setTimeout(() => {
        paymentResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    } catch {
      setPaymentErrors(["通信中にエラーが発生しました。もう一度お試しください。"]);
    } finally {
      window.clearInterval(progressTimer);
      setIsSubmittingPayment(false);
    }
  };

  const copyPaymentConfirmationText = async () => {
    if (!paymentResponse?.order) return;

    const receiver = paymentResponse.payment?.receiverEmail
      ? `送信先: ${paymentResponse.payment.receiverEmail}\n\n`
      : "";
    await navigator.clipboard.writeText(`${receiver}${buildPaymentConfirmationText({ proposal, response: paymentResponse })}`);
    setCopiedPaymentText(true);
    window.setTimeout(() => setCopiedPaymentText(false), 2200);
  };

  const revealDownloadCodePanel = () => {
    setShowDownloadCodePanel(true);
    setAutoDownloadMessage("入金確認を自動で待機しています。確認が完了すると、この欄にダウンロード内容が表示されます。");
    window.setTimeout(() => {
      downloadCodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  const verifyInlineDownloadCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paymentResponse?.order) return;

    setIsCheckingDownloadCode(true);
    setInlineDownloadResponse(null);

    try {
      const response = await fetch(`/api/download-order/${encodeURIComponent(paymentResponse.order.orderId)}?code=${encodeURIComponent(downloadCode)}`);
      const data = (await response.json()) as InlineDownloadResponse;
      setInlineDownloadResponse(data);
    } catch {
      setInlineDownloadResponse({
        status: "not_found",
        order: null,
        files: [],
        errors: ["確認中にエラーが発生しました。もう一度お試しください。"],
      });
    } finally {
      setIsCheckingDownloadCode(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-8 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_34%,rgba(132,204,22,0.08))]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-zinc-900/10 bg-white/82 p-5 shadow-[0_36px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">SyncCraft 制作プラン</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-6xl">
              {proposal.company.name}
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-600">
              入力内容をもとに、制作費・開発期間・推奨構成・標準JSONを作成しました。長年のWeb制作経験をもとに自社開発したAIエージェントが、開発へ進めるための提案データとして整理しています。
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
              <button
                type="button"
                onClick={scrollToPayment}
                disabled={proposalErrors.length > 0}
                className="rounded-full bg-zinc-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                990円でデモ生成を申し込む
              </button>
              <Link href="/estimate" className="rounded-full border border-zinc-900/10 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-white">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-900/10 bg-white/82 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
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
          <div className="rounded-2xl border border-zinc-900/10 bg-white/82 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
            <p className="text-sm text-zinc-500">複雑度</p>
            <p className="mt-3 text-2xl font-semibold">{proposal.estimate.complexity}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              選択機能数：{proposal.website.features.length}件。機能が増えるほど設計・実装・確認範囲が広がります。
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/82 p-5 shadow-sm backdrop-blur sm:rounded-3xl sm:p-6">
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

        <section ref={paymentSectionRef} className="mt-6 scroll-mt-6 rounded-3xl border border-zinc-900/10 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">手動決済でのお申し込み</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">990円（税込）でデモサイト生成と制作プラン一式を申し込む</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                現在は初期テスト運用のため、PayPayまたは銀行振込による手動確認で対応しています。お申し込み時に注文番号とデモデータを準備し、入金確認後にダウンロードURLと認証コードをメールでお送りします。
              </p>
            </div>
            <span className="w-fit rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
              {yen.format(paidDemoAmount)}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={submitManualPaymentOrder} className="rounded-2xl border border-zinc-900/10 bg-zinc-50/80 p-5">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-zinc-700">
                  受信用メールアドレス
                  <input
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="example@example.com"
                    className="rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-zinc-700">
                  お支払い名義
                  <input
                    value={payerName}
                    onChange={(event) => setPayerName(event.target.value)}
                    required
                    placeholder="振込名義またはPayPay表示名"
                    className="rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
                  />
                </label>
                <div className="grid gap-2 text-sm font-semibold text-zinc-700">
                  お支払い方法
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["bank", "銀行振込"],
                      ["paypay", "PayPay"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value as ManualPaymentMethod)}
                        className={[
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                          paymentMethod === value
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-900/10 bg-white text-zinc-700 hover:border-zinc-400",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-zinc-700">
                  備考（任意）
                  <textarea
                    value={paymentNote}
                    onChange={(event) => setPaymentNote(event.target.value)}
                    placeholder="支払い予定日、連絡事項など"
                    className="min-h-24 rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
                  />
                </label>
                {paymentErrors.length > 0 ? (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {paymentErrors.join(" ")}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {isSubmittingPayment ? "注文番号とデモを準備中" : "注文番号とデモを準備する"}
                </button>
                {(isSubmittingPayment || preparationProgress === 100) ? (
                  <PreparationProgressPanel
                    estimatedPreparationSeconds={estimatedPreparationSeconds}
                    isSubmittingPayment={isSubmittingPayment}
                    preparationProgress={preparationProgress}
                    preparationRemainingSeconds={preparationRemainingSeconds}
                  />
                ) : null}
              </div>
            </form>

            <div className="rounded-2xl border border-zinc-900/10 bg-white p-5">
              <h3 className="text-lg font-semibold">お申し込みからダウンロードまで</h3>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-zinc-600">
                <li><span className="font-semibold text-zinc-950">1.</span> メールアドレスと支払い名義を入力し、注文番号とデモデータを準備します。</li>
                <li><span className="font-semibold text-zinc-950">2.</span> 表示された注文番号を控え、銀行振込またはPayPayで990円をお支払いください。</li>
                <li><span className="font-semibold text-zinc-950">3.</span> 支払い後、ページ上のボタンから確認メールを送信します。</li>
                <li><span className="font-semibold text-zinc-950">4.</span> 入金確認後、注文ステータスページで認証コードを確認し、PDF・HTML・JSONをダウンロードできます。</li>
              </ol>
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                これは自動決済ではありません。入金確認は手動で行います。正式な商用運用では、StripeまたはPayPayオンライン決済への移行を予定しています。
              </div>
            </div>
          </div>

          {paymentResponse?.status === "received" && paymentResponse.order && paymentResponse.payment ? (
            <div ref={paymentResultRef} className="mt-5 scroll-mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">注文情報を作成しました</p>
                  <h3 className="mt-2 text-2xl font-semibold text-emerald-950">{paymentResponse.order.orderId}</h3>
                  <p className="mt-2 text-sm text-emerald-800">お支払い金額：{yen.format(paymentResponse.order.amountJpy)}</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    デモ準備：{paymentResponse.order.demoPrepared ? "完了" : "確認中"} / ファイル数：{paymentResponse.order.fileCount}件
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    次はお支払いです。振込名義またはPayPayメッセージに注文番号を入れると確認がスムーズです。
                  </p>
                </div>
                <span className="w-fit rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
                  1/4 デモ準備完了
                </span>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {[
                  ["1", "注文番号発行", "完了"],
                  ["2", "お支払い", "次の操作"],
                  ["3", "確認メール", "支払い後"],
                  ["4", "ダウンロード", "確認後"],
                ].map(([number, title, state]) => (
                  <div key={number} className="rounded-2xl bg-white p-3">
                    <p className="text-xs font-semibold text-emerald-700">{number}. {state}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-950">{title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-zinc-950">お支払い情報</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  先に990円（税込）のお支払いを完了してください。確認できるよう、注文番号「{paymentResponse.order.orderId}」を必ず添えてください。
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-900/10 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-950">銀行振込</p>
                    <dl className="mt-3 grid gap-2 text-sm text-zinc-600">
                      <div><dt className="inline font-semibold text-zinc-950">銀行名：</dt><dd className="inline">{paymentResponse.payment.bank.bankName || "未設定"}</dd></div>
                      <div><dt className="inline font-semibold text-zinc-950">銀行コード：</dt><dd className="inline">{paymentResponse.payment.bank.bankCode || "未設定"}</dd></div>
                      <div><dt className="inline font-semibold text-zinc-950">店番号：</dt><dd className="inline">{paymentResponse.payment.bank.branchCode || "未設定"}</dd></div>
                      <div><dt className="inline font-semibold text-zinc-950">口座番号：</dt><dd className="inline">{paymentResponse.payment.bank.accountNumber || "未設定"}</dd></div>
                      <div><dt className="inline font-semibold text-zinc-950">口座名義：</dt><dd className="inline">{paymentResponse.payment.bank.accountHolder || "未設定"}</dd></div>
                    </dl>
                  </div>
                  <div className="rounded-2xl border border-zinc-900/10 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-950">PayPay</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{paymentResponse.payment.paypayNote}</p>
                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                      PayPay QRコードを設定後、この欄に案内を表示します。送金時のメッセージに注文番号を入れてください。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-emerald-900">
                <p className="font-semibold text-zinc-950">注文ステータス</p>
                <p className="mt-2 break-all">
                  注文ステータスURL：<span className="font-semibold">{paymentResponse.order.statusUrl}</span>
                </p>
                <p className="mt-2 text-zinc-600">
                  ダウンロードURLと認証コードは、入金確認後に注文ステータスページで表示されます。
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-sm font-semibold text-zinc-950">お支払いが完了したら</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  下のボタンで確認メールを作成してください。メール送信後、このページに認証コード入力欄が表示されます。
                </p>
                {paymentResponse.mailtoUrl ? (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href={paymentResponse.mailtoUrl}
                      onClick={revealDownloadCodePanel}
                      className="w-full rounded-full bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
                    >
                      支払い完了後、確認メールを作成する
                    </a>
                    <button
                      type="button"
                      onClick={copyPaymentConfirmationText}
                      className="w-full rounded-full border border-emerald-700/20 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 sm:w-fit"
                    >
                      {copiedPaymentText ? "メール内容をコピーしました" : "メール内容をコピーする"}
                    </button>
                  </div>
                ) : (
                  <span className="mt-4 inline-block rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    送信先メール未設定
                  </span>
                )}
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  メールソフトが開かない場合は、メール内容をコピーして手動で送信してください。
                </p>
              </div>
              {showDownloadCodePanel ? (
                <div ref={downloadCodeRef} className="mt-5 scroll-mt-6 rounded-2xl border border-zinc-900/10 bg-white p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">認証コード入力</p>
                      <h4 className="mt-1 text-xl font-semibold tracking-tight">入金確認後、ここから制作データをダウンロードできます</h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        確認メールの送信後、運営者が入金を確認します。このページは自動で確認し、完了後にダウンロード内容を表示します。
                      </p>
                      {autoDownloadMessage ? (
                        <p className="mt-2 text-sm font-semibold leading-6 text-amber-700">{autoDownloadMessage}</p>
                      ) : null}
                    </div>
                    <Link
                      href={paymentResponse.order.statusUrl}
                      className="w-full rounded-full border border-zinc-900/10 bg-zinc-50 px-4 py-2 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 sm:w-fit"
                    >
                      注文ステータスを開く
                    </Link>
                  </div>

                  <form onSubmit={verifyInlineDownloadCode} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="grid gap-2 text-sm font-semibold text-zinc-700">
                      ダウンロード認証コード
                      <input
                        value={downloadCode}
                        onChange={(event) => setDownloadCode(event.target.value.toUpperCase())}
                        required
                        placeholder="例：A1B2C3"
                        className="rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isCheckingDownloadCode}
                      className="self-end rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                    >
                      {isCheckingDownloadCode ? "確認中" : "ダウンロードを表示"}
                    </button>
                  </form>

                  {inlineDownloadResponse?.errors.length ? (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      {inlineDownloadResponse.errors.join(" ")}
                    </div>
                  ) : null}

                  {inlineDownloadResponse?.status === "ok" && inlineDownloadResponse.order ? (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm font-semibold text-emerald-700">認証しました</p>
                      <h4 className="mt-2 text-xl font-semibold text-emerald-950">{inlineDownloadResponse.order.companyName}</h4>
                      <p className="mt-2 text-sm text-emerald-800">オンラインプレビューとファイルダウンロードが利用できます。</p>
                      {inlineDownloadResponse.files.some((file) => file.previewUrl) ? (
                        <div className="mt-4 rounded-2xl bg-white p-4">
                          <p className="text-sm font-semibold text-zinc-950">Demoサイトをオンラインプレビュー</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            生成されたDemo HTMLをブラウザ上で確認できます。各ページは別タブで開けます。
                          </p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {inlineDownloadResponse.files.filter((file) => file.previewUrl).map((file) => (
                              <a
                                key={file.fileName}
                                href={file.previewUrl ?? "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-2xl border border-zinc-900/10 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                              >
                                {file.label}
                                <span className="mt-1 block text-xs font-normal text-zinc-400">{file.fileName}</span>
                              </a>
                            ))}
                          </div>
                          {inlineDownloadResponse.files.find((file) => file.previewUrl)?.previewUrl ? (
                            <iframe
                              title="Demoサイトプレビュー"
                              src={inlineDownloadResponse.files.find((file) => file.previewUrl)?.previewUrl ?? ""}
                              className="mt-4 h-[420px] w-full rounded-2xl border border-zinc-900/10 bg-white"
                            />
                          ) : null}
                        </div>
                      ) : null}
                      <p className="mt-4 text-sm font-semibold text-emerald-900">ダウンロード可能なファイル：{inlineDownloadResponse.order.fileCount}件</p>
                      <div className="mt-4 grid gap-3">
                        {inlineDownloadResponse.files.map((file) => (
                          <a
                            key={file.fileName}
                            href={`/api/download-order/${encodeURIComponent(inlineDownloadResponse.order?.orderId ?? "")}/file/${encodeURIComponent(file.fileName)}?code=${encodeURIComponent(downloadCode)}`}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                          >
                            <span>{file.label}</span>
                            <span className="text-zinc-400">{file.fileName}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
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

        <section className="mt-6 rounded-3xl border border-zinc-900/10 bg-zinc-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">標準 JSON</h2>
              <p className="mt-1 text-sm text-zinc-400">AIエージェントに渡すための提案データです。</p>
            </div>
            <button
              type="button"
              onClick={scrollToPayment}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              990円でダウンロード申込み
            </button>
          </div>
          <div className="mt-5 rounded-2xl bg-black/40 p-5 text-sm leading-6 text-zinc-100">
            <p className="font-semibold">ダウンロード内容</p>
            <ul className="mt-3 grid gap-2 text-zinc-300">
              <li>制作提案レポート PDF</li>
              <li>Proposal JSON</li>
              <li>生成デモサイトHTML</li>
              <li>制作プラン概要</li>
              <li>推奨ページ構成・技術スタック</li>
            </ul>
            <p className="mt-4 text-zinc-400">
              お支払い確認後、ダウンロードURLと認証コードをメールでお送りします。顧客入力内容と制作データを保護するため、ページ上では完全なJSONを公開していません。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
