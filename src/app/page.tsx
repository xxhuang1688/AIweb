import Link from "next/link";

const capabilities = [
  "要件定義",
  "UI設計",
  "フロントエンド開発",
  "自社AIエージェント",
  "自動デモ生成",
  "Vercel運用",
];

const flow = [
  {
    title: "ヒアリング",
    description: "会社情報、目的、必要機能を3分で整理します。",
  },
  {
    title: "見積もり算出",
    description: "内蔵ルールで制作費、期間、複雑度を自動計算します。",
  },
  {
    title: "提案JSON作成",
    description: "自社AIエージェントが読める標準データに変換します。",
  },
  {
    title: "デモ準備",
    description: "最低標準ページを含むデモサイトの生成準備を行います。",
  },
];

const faq = [
  {
    question: "専門知識がなくても使えますか？",
    answer: "はい。制作相談で必要になる内容だけに絞っているため、技術用語を知らなくても回答できます。",
  },
  {
    question: "表示される金額は正式な見積もりですか？",
    answer: "本段階では概算です。正式な見積もりはページ数、素材量、運用体制などを確認したうえで確定します。",
  },
  {
    question: "SyncCraftはどこまで対応できますか？",
    answer: "長年のWeb制作経験をもとに自社開発したAIエージェントを活用し、要件整理、UI設計、Next.js開発、デモ生成ワークフロー、公開後の改善まで一貫して対応できます。",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f4] text-zinc-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_34%,rgba(132,204,22,0.08))]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/10">
            S
          </span>
          <span>SyncCraft</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-500 md:flex">
          <a href="#capability" className="transition hover:text-zinc-950">開発領域</a>
          <a href="#flow" className="transition hover:text-zinc-950">制作フロー</a>
          <a href="#faq" className="transition hover:text-zinc-950">FAQ</a>
        </nav>
        <Link
          href="/estimate"
          className="rounded-full border border-zinc-900/10 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-950 hover:shadow-md"
        >
          無料で見積もりを始める
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-24">
        <div>
          <p className="w-fit rounded-full border border-zinc-900/10 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur">
            長年の制作経験から生まれた自社AIエージェント
          </p>
          <h1 className="mt-7 max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-7xl">
            3分でホームページ制作プランを自動作成
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            質問に答えるだけで、制作費・開発期間・デモサイトを自動生成します。SyncCraftは長年のWeb制作経験をもとに自社開発したAIエージェントで、要件を開発に進める提案データへ変換します。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/estimate"
              className="rounded-full bg-zinc-950 px-7 py-4 text-center text-sm font-semibold text-white shadow-xl shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              無料で見積もりを始める
            </Link>
            <a
              href="#flow"
              className="rounded-full border border-zinc-900/10 bg-white/80 px-7 py-4 text-center text-sm font-semibold text-zinc-800 backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-950"
            >
              開発フローを見る
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["40〜60%OFF", "制作費を最適化"],
              ["1/2", "開発期間を短縮"],
              ["1年間", "無料メンテナンス"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-zinc-900/10 bg-white/70 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-xs font-medium text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px]">
          <div className="absolute right-0 top-0 w-full rounded-[2rem] border border-zinc-900/10 bg-zinc-950 p-5 text-white shadow-[0_40px_140px_rgba(15,23,42,0.22)] lg:w-[92%]">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm text-zinc-400">SyncCraft 提案エンジン</p>
                <p className="mt-2 text-3xl font-semibold">¥204,000〜¥450,000</p>
              </div>
              <span className="rounded-full bg-emerald-300 px-3 py-1 text-sm font-bold text-zinc-950">最大60%OFF</span>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["複雑度", "スタンダード"],
                ["開発期間", "2〜4週間"],
                ["メンテナンス", "1年間無料"],
                ["技術構成", "Next.js / TypeScript / Vercel"],
                ["生成モデル", "多年経験型 自社AIエージェント"],
              ].map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-emerald-200">{key}</span>
                  <span className="font-semibold text-zinc-100">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-emerald-100">
                <span>デモ生成</span>
                <span>100%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-emerald-300" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-[82%] rounded-[1.75rem] border border-zinc-900/10 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
            <p className="text-sm font-semibold text-zinc-500">標準 Proposal JSON</p>
            <pre className="mt-4 overflow-hidden rounded-2xl bg-zinc-950 p-4 text-xs leading-6 text-emerald-100">
{`{
  "company": "株式会社ミライテック",
  "siteType": "企業サイト",
  "estimate": "¥204,000〜¥450,000",
  "maintenance": "1年間無料",
  "pages": ["トップ", "会社概要", "サービス", "お問い合わせ"],
  "agentReady": true
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="capability" className="relative z-10 border-y border-zinc-900/10 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500">開発領域</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">高度なWeb開発を前提にした提案設計</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-500">
              単なる見積もりではなく、長年の制作経験を反映した自社AIエージェントが、設計、実装、運用まで見据えた制作プランを作成します。
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-900/10 bg-[#f8f9f6] p-5">
                <p className="font-semibold">{item}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">ビジネス要件を開発可能な単位へ整理します。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">制作フロー</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((item, index) => (
            <div key={item.title} className="rounded-3xl border border-zinc-900/10 bg-white/80 p-6 shadow-sm backdrop-blur">
              <p className="font-mono text-sm text-emerald-700">0{index + 1}</p>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-5 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-8 grid gap-4">
          {faq.map((item) => (
            <div key={item.question} className="rounded-3xl border border-zinc-900/10 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-900/10 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SyncCraft</p>
          <p>AIサイト提案プラットフォーム</p>
        </div>
      </footer>
    </main>
  );
}
