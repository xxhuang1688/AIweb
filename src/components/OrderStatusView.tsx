"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatusResponse = {
  status: "pending" | "confirmed" | "unauthorized" | "not_found";
  errors: string[];
  order: {
    orderId: string;
    companyName: string;
    amountJpy: number;
    createdAt: string;
    confirmedAt: string | null;
    fileCount: number;
    downloadUrl: string | null;
    accessCode: string | null;
  } | null;
};

const yen = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

export function OrderStatusView({ orderId, token }: { orderId: string; token: string }) {
  const router = useRouter();
  const [response, setResponse] = useState<OrderStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAutoRedirectingRef = useRef(false);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetch(`/api/order-status/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`);
      const data = (await result.json()) as OrderStatusResponse;
      setResponse(data);
    } catch {
      setResponse({
        status: "not_found",
        errors: ["注文情報を確認できませんでした。"],
        order: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStatus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStatus]);

  useEffect(() => {
    if (response?.status === "confirmed" || response?.status === "unauthorized" || response?.status === "not_found") {
      return;
    }

    const timer = window.setInterval(() => {
      void loadStatus();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [loadStatus, response?.status]);

  useEffect(() => {
    if (response?.status !== "confirmed" || !response.order?.downloadUrl || !response.order.accessCode || isAutoRedirectingRef.current) {
      return;
    }

    isAutoRedirectingRef.current = true;
    const downloadUrl = new URL(response.order.downloadUrl, window.location.origin);
    downloadUrl.searchParams.set("code", response.order.accessCode);
    const timer = window.setTimeout(() => {
      router.push(`${downloadUrl.pathname}${downloadUrl.search}`);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [response, router]);

  const copyAccessCode = async () => {
    if (!response?.order?.accessCode) return;

    await navigator.clipboard.writeText(response.order.accessCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-10 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-zinc-900/10 bg-white/90 p-6 shadow-[0_36px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">SyncCraft 注文ステータス</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">ダウンロード準備状況</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            お支払い後、運営者が入金を確認すると、自動的にダウンロードページへ移動します。
          </p>
          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            注文番号：<span className="font-semibold text-zinc-950">{orderId}</span>
          </div>

          <button
            type="button"
            onClick={loadStatus}
            disabled={isLoading}
            className="mt-5 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isLoading ? "確認中" : "ステータスを更新"}
          </button>

          {response?.errors.length ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
              {response.errors.join(" ")}
            </div>
          ) : null}

          {response?.status === "pending" && response.order ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-700">管理者の入金確認待ちです</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-950">{response.order.companyName}</h2>
              <p className="mt-3 text-sm leading-6 text-amber-800">
                このページは約5秒ごとに自動確認しています。入金確認が完了すると、ダウンロードページへ自動で移動します。
              </p>
              <p className="mt-3 text-sm text-amber-800">お支払い金額：{yen.format(response.order.amountJpy)}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-100">
                <div className="h-full w-1/2 rounded-full bg-amber-500 motion-safe:animate-pulse" />
              </div>
            </div>
          ) : null}

          {response?.status === "confirmed" && response.order?.downloadUrl && response.order.accessCode ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">入金確認が完了しました</p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">{response.order.companyName}</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-800">
                入金確認が完了しました。まもなくダウンロードページへ自動で移動します。
              </p>
              <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-6 text-emerald-900">
                <p>ダウンロードURL：{response.order.downloadUrl}</p>
                <p>認証コード：<span className="font-semibold">{response.order.accessCode}</span></p>
                <p>ファイル数：{response.order.fileCount}件</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`${new URL(response.order.downloadUrl, "http://localhost").pathname}?code=${encodeURIComponent(response.order.accessCode)}`}
                  className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  今すぐダウンロードページを開く
                </a>
                <button
                  type="button"
                  onClick={copyAccessCode}
                  className="rounded-full border border-emerald-700/20 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  {copied ? "認証コードをコピーしました" : "認証コードをコピーする"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
