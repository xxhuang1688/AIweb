"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { loadCurrentDemoPreviewText, parseCurrentDemoPreview } from "@/lib/storage";

export function DemoPreviewPage() {
  const previewText = useSyncExternalStore(() => () => {}, loadCurrentDemoPreviewText, () => null);
  const preview = useMemo(() => parseCurrentDemoPreview(previewText), [previewText]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const currentPage = preview?.pages?.find((page) => page.fileName === (selectedFileName ?? preview.selectedFileName))
    ?? preview?.pages?.[0]
    ?? (preview ? { name: preview.title, fileName: "index.html", html: preview.html } : null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; fileName?: string };
      const pages = preview?.pages ?? [];

      if (data.type !== "sync-craft-open-page" || !data.fileName) return;
      if (!pages.some((page) => page.fileName === data.fileName)) return;

      setSelectedFileName(data.fileName);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [preview]);

  if (!preview || !currentPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] px-5 text-center text-zinc-950">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">表示できるデモがありません</h1>
          <p className="mt-3 text-zinc-600">先に制作プラン画面でデモサイトを生成してください。</p>
          <Link href="/result" className="mt-6 inline-block rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white">
            制作プランへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-xs text-zinc-400">SyncCraft Demo Preview</p>
          <h1 className="text-sm font-semibold">{preview.title} / {currentPage.name}</h1>
        </div>
        <Link href="/result" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950">
          制作プランへ戻る
        </Link>
      </header>
      <iframe title={currentPage.name} srcDoc={currentPage.html} className="h-[calc(100vh-65px)] w-full bg-white" />
    </main>
  );
}
