"use client";

import { useState } from "react";

type OperatorOrderResponse = {
  status: "ok" | "unauthorized" | "not_found" | "not_configured";
  errors: string[];
  order: {
    orderId: string;
    companyName: string;
    customerEmail: string;
    amountJpy: number;
    createdAt: string;
    confirmedAt: string | null;
    paymentStatus: "pending_manual_confirmation" | "confirmed";
    fileCount: number;
    statusUrl: string;
  } | null;
  reply: {
    subject: string;
    to: string;
    downloadUrl: string;
    accessCode: string;
    text: string;
  } | null;
};

export function OperatorOrderView({ orderId }: { orderId: string }) {
  const [adminCode, setAdminCode] = useState("");
  const [response, setResponse] = useState<OperatorOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCopied(false);
    setResponse(null);

    try {
      const result = await fetch(`/api/operator-order/${encodeURIComponent(orderId)}?adminCode=${encodeURIComponent(adminCode)}`);
      const data = (await result.json()) as OperatorOrderResponse;
      setResponse(data);
    } catch {
      setResponse({
        status: "not_found",
        errors: ["注文情報を確認できませんでした。"],
        order: null,
        reply: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReply = async () => {
    if (!response?.reply) return;

    await navigator.clipboard.writeText(response.reply.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const confirmPayment = async () => {
    setIsConfirming(true);
    setCopied(false);

    try {
      const result = await fetch(`/api/operator-order/${encodeURIComponent(orderId)}`, {
        body: JSON.stringify({ adminCode }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await result.json()) as OperatorOrderResponse;
      setResponse(data);
    } catch {
      setResponse({
        status: "not_found",
        errors: ["入金確認の更新に失敗しました。"],
        order: null,
        reply: null,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-10 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-zinc-900/10 bg-white/90 p-6 shadow-[0_36px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">SyncCraft 運営者確認</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">支払い確認後の返信メール</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            入金確認後、管理者コードを入力すると、顧客へ送るダウンロード案内メールを表示できます。
          </p>
          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            注文番号：<span className="font-semibold text-zinc-950">{orderId}</span>
          </div>

          <form onSubmit={loadOrder} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-semibold text-zinc-700">
              管理者コード
              <input
                value={adminCode}
                onChange={(event) => setAdminCode(event.target.value)}
                required
                type="password"
                placeholder="管理者コードを入力"
                className="rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="self-end rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isLoading ? "確認中" : "返信内容を表示"}
            </button>
          </form>

          {response?.errors.length ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
              {response.errors.join(" ")}
            </div>
          ) : null}

          {response?.status === "ok" && response.order && response.reply ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">返信メールを作成しました</p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">{response.order.companyName}</h2>
              <div className="mt-4 grid gap-2 text-sm leading-6 text-emerald-900">
                <p>送信先：{response.reply.to}</p>
                <p>件名：{response.reply.subject}</p>
                <p>ファイル数：{response.order.fileCount}件</p>
                <p>注文ステータス：{response.order.paymentStatus === "confirmed" ? "入金確認済み" : "入金確認待ち"}</p>
                <p>顧客ステータスURL：{response.order.statusUrl}</p>
              </div>
              {response.order.paymentStatus !== "confirmed" ? (
                <div className="mt-5 rounded-2xl bg-white p-4">
                  <p className="text-sm font-semibold text-zinc-950">入金確認操作</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    銀行またはPayPayで入金を確認できたら、下のボタンを押してください。顧客の注文ステータスページでダウンロード情報が表示されます。
                  </p>
                  <button
                    type="button"
                    onClick={confirmPayment}
                    disabled={isConfirming}
                    className="mt-4 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    {isConfirming ? "更新中" : "入金確認済みにする"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-6 text-emerald-900">
                  入金確認済みです。顧客は注文ステータスページからダウンロード情報を確認できます。
                </div>
              )}
              <div className="mt-5 rounded-2xl bg-white p-4">
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {response.reply.text}
                </pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyReply}
                  className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {copied ? "返信メールをコピーしました" : "返信メールをコピーする"}
                </button>
                <a
                  href={`mailto:${encodeURIComponent(response.reply.to)}?subject=${encodeURIComponent(response.reply.subject)}&body=${encodeURIComponent(response.reply.text)}`}
                  className="rounded-full border border-emerald-700/20 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  メールソフトで開く
                </a>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
