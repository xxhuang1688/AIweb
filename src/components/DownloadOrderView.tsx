"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DownloadOrderResponse = {
  status: "ok" | "invalid_code" | "not_found";
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

export function DownloadOrderView({ initialCode = "", orderId }: { initialCode?: string; orderId: string }) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DownloadOrderResponse | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
  const previewFiles = useMemo(() => response?.files.filter((file) => file.previewUrl) ?? [], [response]);
  const activePreviewUrl = selectedPreviewUrl || previewFiles[0]?.previewUrl || "";

  const loadDownloads = useCallback(async (targetCode: string) => {
    setIsLoading(true);
    setResponse(null);
    setSelectedPreviewUrl("");

    try {
      const result = await fetch(`/api/download-order/${encodeURIComponent(orderId)}?code=${encodeURIComponent(targetCode)}`);
      const data = (await result.json()) as DownloadOrderResponse;
      setResponse(data);
    } catch {
      setResponse({
        status: "not_found",
        order: null,
        files: [],
        errors: ["確認中にエラーが発生しました。もう一度お試しください。"],
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!initialCode) return;

    const timer = window.setTimeout(() => {
      void loadDownloads(initialCode.toUpperCase());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialCode, loadDownloads]);

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadDownloads(code);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f4] px-5 py-10 text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-zinc-900/10 bg-white/90 p-6 shadow-[0_36px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">SyncCraft ダウンロード</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">制作データをダウンロード</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            入金確認後に届いた認証コードを入力してください。Proposal JSON、デモサイトHTML、制作プラン一式をダウンロードできます。
          </p>
          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            注文番号：<span className="font-semibold text-zinc-950">{orderId}</span>
          </div>

          <form onSubmit={verifyCode} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-semibold text-zinc-700">
              認証コード
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                required
                placeholder="例：A1B2C3"
                className="rounded-2xl border border-zinc-900/10 bg-white px-4 py-3 text-base font-normal text-zinc-950 outline-none transition focus:border-zinc-950"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="self-end rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isLoading ? "確認中" : "ダウンロードを表示"}
            </button>
          </form>

          {response?.errors.length ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
              {response.errors.join(" ")}
            </div>
          ) : null}

          {response?.status === "ok" && response.order ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">認証しました</p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">{response.order.companyName}</h2>
              <p className="mt-2 text-sm text-emerald-800">オンラインプレビューとファイルダウンロードが利用できます。</p>
              {previewFiles.length > 0 ? (
                <div className="mt-5 rounded-2xl bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">Demoサイトをオンラインプレビュー</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        生成されたHTMLをブラウザ上で確認できます。別タブで開くこともできます。
                      </p>
                    </div>
                    {activePreviewUrl ? (
                      <a
                        href={activePreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full rounded-full bg-zinc-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-fit"
                      >
                        別タブで開く
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {previewFiles.map((file) => (
                      <button
                        key={file.fileName}
                        type="button"
                        onClick={() => setSelectedPreviewUrl(file.previewUrl ?? "")}
                        className={[
                          "rounded-full border px-3 py-2 text-xs font-semibold transition",
                          activePreviewUrl === file.previewUrl
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-900/10 bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
                        ].join(" ")}
                      >
                        {file.label}
                      </button>
                    ))}
                  </div>
                  {activePreviewUrl ? (
                    <iframe
                      title="Demoサイトプレビュー"
                      src={activePreviewUrl}
                      className="mt-4 h-[520px] w-full rounded-2xl border border-zinc-900/10 bg-white"
                    />
                  ) : null}
                </div>
              ) : null}

              <p className="mt-5 text-sm font-semibold text-emerald-900">ダウンロード可能なファイル：{response.order.fileCount}件</p>
              <div className="mt-5 grid gap-3">
                {response.files.map((file) => (
                  <a
                    key={file.fileName}
                    href={`/api/download-order/${encodeURIComponent(orderId)}/file/${encodeURIComponent(file.fileName)}?code=${encodeURIComponent(code)}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                  >
                    <span>{file.label}</span>
                    <span className="text-zinc-400">{file.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
