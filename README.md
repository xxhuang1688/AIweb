# AIサイト提案メーカー

日本の顧客向けに、Webサイト制作の要件、概算見積もり、推奨構成、AIエージェント用の標準JSONを作成する軽量な Next.js アプリです。

このプロジェクトは大型 SaaS Boilerplate を使わず、Next.js 公式テンプレートをベースにしています。認証、ダッシュボード、データベース、ORM、決済、CMS、Storybook、Docker は入れていません。

## 第一段階の実装内容

- 日本語のトップページ
- 7ステップのWebサイト要件入力フロー
- 設定ファイルによる選択肢と価格表の一元管理
- 自研の見積もり計算エンジン
- 自研の標準JSON作成ロジック
- 結果ページでの見積もり、複雑度、開発期間、推奨ページ、推奨技術スタック、標準JSON表示
- `POST /api/generate-demo` のモックAPI
- 最新の標準JSONを `localStorage` に保存し、結果ページを再読み込みしても表示を維持

## 第二段階の実装内容

第二段階では、AIエージェントの調度層を実装し、SyncCraft 自社AIエージェント Provider を追加しています。

- Proposal JSON の受け取り
- Proposal JSON の構造チェック
- デモ生成用 Prompt の作成
- Demo Plan JSON の作成
- Provider 抽象インターフェース
- SyncCraft 自社AIエージェントによる Demo Plan JSON 生成
- SyncCraft 自社開発モデルの Mock Provider
- Demo Plan JSON から複数ページの静的HTMLプレビューを生成
- 結果ページでの Agent 結果、Provider、Demo Plan JSON、HTMLプレビュー表示
- デモ生成中の進捗バー表示と、生成完了後のプレビュー位置への自動スクロール
- `/demo-preview` で現在選択中のデモHTMLを別ページ表示
- 開発段階ではデモ生成回数の制限なし

現在のフロントエンドは `syncCraft` Provider を呼び出します。APIキー未設定時は明確なエラーを返します。OpenAI、Claude、Gemini、OpenRouter などを追加する場合も、Agent 本体ではなく Provider を追加します。

## 採用方針

- 基礎: Next.js 公式テンプレート
- 入力フロー: 自研
- 入力状態管理: URLクエリとブラウザ標準フォーム
- 入力チェック: 自研
- 見積もり計算: 自研
- 標準JSON作成: 自研
- UI: Tailwind CSS

現在の機能量では、React Hook Form、Zod、shadcn/ui、Framer Motion、Zustand などは使っていません。必要になった段階で追加します。

## 主なファイル

- `src/config/proposalConfig.ts`: 選択肢、基本価格、機能別価格
- `src/types/proposal.ts`: 入力データ、見積もり、標準JSONの型
- `src/lib/pricingEngine.ts`: 概算見積もり計算
- `src/lib/proposalBuilder.ts`: AIエージェント用JSON作成
- `src/lib/agent/demoAgent.ts`: デモ生成ワークフローの調度
- `src/lib/agent/promptBuilder.ts`: AI Provider に渡す Prompt 作成
- `src/lib/agent/proposalValidator.ts`: Proposal JSON の検証
- `src/lib/agent/providers/mockProvider.ts`: SyncCraft 自社開発モデルの Mock Provider
- `src/lib/agent/providers/deepseekProvider.ts`: SyncCraft 自社AIエージェント Provider
- `src/lib/agent/providers/providerRegistry.ts`: Provider 選択
- `src/lib/agent/renderer/demoHtmlRenderer.ts`: Demo Plan JSON から複数ページの静的HTMLを生成
- `src/lib/storage.ts`: 最新JSONの `localStorage` 保存と読み込み
- `src/components/EstimateForm.tsx`: 7ステップ入力フロー
- `src/app/result/page.tsx`: 結果ページ
- `src/app/demo-preview/page.tsx`: 生成済みデモの別ページプレビュー
- `src/app/api/generate-demo/route.ts`: Agent 呼び出しAPI

## 環境変数

SyncCraft 自社AIエージェントを使う場合は `.env.local` に以下を設定します。

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
```

任意でモデルとBase URLを変更できます。

```bash
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

内部の基盤モデルは OpenAI 互換の Chat Completions 形式で呼び出します。現在の実装では `response_format: { "type": "json_object" }` を指定し、Demo Plan JSON を生成します。

## 入力フロー

1. ホームページで「無料で見積もりを始める」を押す
2. `/estimate` で7ステップの質問に回答する
3. 最終ステップで入力内容を確認し、「制作プランを生成する」を押す
4. `proposalBuilder.ts` が標準JSONを作成する
5. 標準JSONを `localStorage` に保存する
6. `/result` で見積もり、推奨構成、標準JSONを表示する

## 見積もり計算ルール

サイト種類ごとの基本価格に、選択された機能の加算価格を合算します。
ユーザーには予算や納期を選ばせず、入力されたサイト種類と必要機能から制作費と開発期間を自動算出します。
表示される見積もりには、サーバー、ドメイン、外部サービス利用料などの第三者への購入費用は含まれません。
SyncCraftで制作する場合は、必要に応じてサーバー・ドメインの選定、取得、初期設定、公開作業まで一括で対応します。

```ts
featurePrice = featureSubtotal + complexitySurcharge;
totalPrice = basePrice + featurePrice;
minPrice = totalPrice * 0.85;
maxPrice = totalPrice * 1.25;
```

`minPrice` と `maxPrice` は1万円単位に四捨五入します。

複雑度、複雑度加算、開発期間は機能数で判定します。

| 機能数 | 複雑度 | 開発期間 |
| --- | --- | --- |
| 0〜2 | シンプル | 2〜3週間 |
| 3〜4 | シンプル | 3〜5週間 |
| 5〜7 | スタンダード | 5〜8週間 |
| 8〜9 | スタンダード | 6〜10週間 |
| 10以上 | ハイグレード | 10〜16週間 |

## 標準JSON構造

第二段階のAIエージェントは、結果ページで表示される以下の構造を読み取る想定です。

```ts
type ProposalJson = {
  version: "1.0";
  language: "ja";
  market: "Japan";
  generatedAt: string;
  company: {
    name: string;
    industry: string;
    slogan: string;
    description: string;
    contactInfo: string;
    logo: string;
  };
  website: {
    type: string;
    goals: string[];
    features: string[];
    designStyle: string;
    mainColor: string;
    referenceSites: string[];
    referenceNote: string;
  };
  estimate: {
    basePrice: number;
    featurePrice: number;
    totalPrice: number;
    minPrice: number;
    maxPrice: number;
    complexity: "シンプル" | "スタンダード" | "ハイグレード";
    developmentPeriod: string;
  };
  recommendation: {
    pages: string[];
    techStack: string[];
  };
  agentInstruction: {
    purpose: "demo_site_generation";
    status: "ready_for_agent";
    note: string;
  };
};
```

## AI Agent ワークフロー

```text
ResultView
  -> POST /api/generate-demo
  -> demoAgent
  -> proposalValidator
  -> promptBuilder
  -> providerRegistry
  -> syncCraftProvider
  -> Agent結果を返却
```

フロントエンドは以下の形式で送信します。

```json
{
  "provider": "syncCraft",
  "proposal": {
    "version": "1.0"
  }
}
```

API は以下の形式で返します。

```ts
type DemoGenerationResponse = {
  status: "generated" | "invalid_request" | "provider_error";
  provider: "syncCraft" | "mock" | "openai" | "claude" | "deepseek" | "gemini" | "openrouter";
  // 内部Promptは顧客に見せないため、APIレスポンスでは null を返します。
  prompt: {
    systemPrompt: string;
    userPrompt: string;
    fullPrompt: string;
  } | null;
  result: {
    provider: string;
    model: string;
    summary: {
      title: string;
      concept: string;
      targetAudience: string;
      pages: string[];
      keyFeatures: string[];
      designDirection: string;
      techStack: string[];
    };
    demoPlan: {
      version: "1.0";
      siteName: string;
      siteType: string;
      industry: string;
      language: "ja";
      visualStyle: {
        designStyle: string;
        mainColor: string;
        tone: string;
        layout: string;
      };
      contentStrategy: {
        primaryMessage: string;
        targetAudience: string;
        conversionGoal: string;
        ctaLabel: string;
      };
      pages: Array<{
        name: string;
        role: string;
        sections: string[];
      }>;
      homeSections: Array<{
        id: string;
        type: string;
        title: string;
        subtitle: string;
        content: string;
        items: string[];
        ctaLabel?: string;
      }>;
      requiredFeatures: string[];
      techStack: string[];
      implementationNotes: string[];
    };
    previewHtml: string;
    previewPages: Array<{
      name: string;
      fileName: string;
      html: string;
    }>;
    rawText: string;
  } | null;
  errors: string[];
  demoUrl: string | null;
};
```

## Agent API

```http
POST /api/generate-demo
```

現在は実際のデモサイトURLを返さず、SyncCraft 自社AIエージェントが生成した Demo Plan JSON から静的HTMLプレビューを返します。

```json
{
  "status": "generated",
  "provider": "syncCraft",
  "prompt": {},
  "result": {},
  "demoUrl": null
}
```

## デモ生成回数

開発段階ではデモ生成回数を制限していません。
本番公開前に、必要に応じてユーザー単位、IP単位、または認証後のプロジェクト単位で制限を追加します。

保存対象は以下です。

- 生成日時
- 会社名
- サイト名
- Provider
- 利用モデル
- Agentレスポンス
- Demo Plan JSON
- 静的HTMLプレビュー

後続フェーズでは、この保存先をデータベースやオブジェクトストレージに置き換えることで、チーム共有、公開URL、バージョン比較、自動デプロイに拡張できます。

## インストール

```bash
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## 今後の想定

次の段階では、Provider に OpenAI などの実装を追加し、Agent が作成した Prompt を実際のAI APIに渡します。その後、現在の静的HTMLプレビューをNext.jsプロジェクト生成、プレビューURL、バージョン管理、自動デプロイへ接続します。
