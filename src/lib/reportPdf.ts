import { readFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import type PDFDocumentType from "pdfkit";
import type { DemoGenerationResponse } from "@/types/agent";
import type { ManualPaymentStoredOrder } from "@/types/manualPayment";
import type { ProposalJson } from "@/types/proposal";

type ReportInput = {
  order: ManualPaymentStoredOrder;
  proposal: ProposalJson;
  demo: DemoGenerationResponse;
};

type Metric = {
  label: string;
  value: string;
  note: string;
};

type KeyValue = {
  label: string;
  value: string;
};

const yen = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

const page = {
  size: "A4" as const,
  margin: 48,
  width: 595.28,
  height: 841.89,
};

const colors = {
  paper: "#f7f8f4",
  ink: "#18181b",
  muted: "#5f6368",
  faint: "#e3e6ea",
  line: "#d9dde3",
  green: "#047857",
  softGreen: "#e9f7ef",
  amber: "#fff7df",
  black: "#111318",
  white: "#ffffff",
};

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit/js/pdfkit.standalone.js") as typeof PDFDocumentType;

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

function clean(value: string | undefined | null, fallback = "未設定") {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  return text || fallback;
}

function fontPath(weight: 400 | 700) {
  return path.join(
    process.cwd(),
    "node_modules",
    "@fontsource",
    "noto-sans-jp",
    "files",
    `noto-sans-jp-japanese-${weight}-normal.woff`,
  );
}

function fontBuffer(weight: 400 | 700) {
  return readFileSync(fontPath(weight));
}

function collectPdf(doc: PDFKit.PDFDocument) {
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

class ReportWriter {
  constructor(
    private readonly doc: PDFKit.PDFDocument,
    private readonly title: string,
  ) {}

  setup() {
    this.doc.registerFont("Noto", fontBuffer(400));
    this.doc.registerFont("NotoBold", fontBuffer(700));
    this.doc.font("Noto");
  }

  private contentWidth() {
    return page.width - page.margin * 2;
  }

  private drawPageBackground() {
    this.doc
      .rect(0, 0, page.width, page.height)
      .fill(colors.paper);
  }

  private drawHeader() {
    const y = 28;

    this.doc
      .font("NotoBold")
      .fontSize(9)
      .fillColor(colors.green)
      .text("SyncCraft", page.margin, y, { continued: false });

    this.doc
      .font("Noto")
      .fontSize(8)
      .fillColor(colors.muted)
      .text(this.title, page.margin, y + 15, { width: this.contentWidth() });

    this.doc
      .moveTo(page.margin, y + 40)
      .lineTo(page.width - page.margin, y + 40)
      .strokeColor(colors.line)
      .lineWidth(0.8)
      .stroke();

    this.doc.y = 86;
  }

  private drawFooter() {
    const footerY = page.height - 92;

    this.doc
      .moveTo(page.margin, footerY)
      .lineTo(page.width - page.margin, footerY)
      .strokeColor(colors.line)
      .lineWidth(0.8)
      .stroke();

    this.doc
      .font("Noto")
      .fontSize(7.5)
      .fillColor(colors.muted)
      .text(`SyncCraft AI Website Proposal Platform / ${this.doc.bufferedPageRange().count}`, page.margin, footerY + 12, {
        lineBreak: false,
        width: this.contentWidth(),
      });
  }

  startPage() {
    this.drawPageBackground();
    this.drawHeader();
  }

  addPage() {
    this.drawFooter();
    this.doc.addPage();
    this.startPage();
  }

  finish() {
    this.drawFooter();
  }

  ensure(height: number) {
    if (this.doc.y + height > page.height - 72) {
      this.addPage();
    }
  }

  section(title: string, eyebrow: string) {
    this.ensure(72);
    this.doc.moveDown(0.2);
    this.doc
      .font("NotoBold")
      .fontSize(8.5)
      .fillColor(colors.green)
      .text(eyebrow, page.margin, this.doc.y, { width: this.contentWidth() });
    this.doc.moveDown(0.35);
    this.doc
      .font("NotoBold")
      .fontSize(18)
      .fillColor(colors.ink)
      .text(title, { width: this.contentWidth(), lineGap: 2 });
    this.doc.moveDown(0.35);
    this.doc
      .moveTo(page.margin, this.doc.y)
      .lineTo(page.width - page.margin, this.doc.y)
      .strokeColor(colors.line)
      .lineWidth(0.8)
      .stroke();
    this.doc.moveDown(0.9);
  }

  paragraph(text: string, options: { bold?: boolean; color?: string; size?: number; gap?: number } = {}) {
    const fontSize = options.size ?? 10.2;
    const height = this.doc.heightOfString(clean(text, ""), {
      width: this.contentWidth(),
      lineGap: 4,
    }) + 12;

    this.ensure(height);
    this.doc
      .font(options.bold ? "NotoBold" : "Noto")
      .fontSize(fontSize)
      .fillColor(options.color ?? colors.ink)
      .text(clean(text, ""), page.margin, this.doc.y, {
        width: this.contentWidth(),
        lineGap: 4,
      });
    this.doc.moveDown(options.gap ?? 0.8);
  }

  cover(input: ReportInput) {
    const proposal = input.proposal;
    const createdAt = new Date(input.order.createdAt).toLocaleDateString("ja-JP");

    this.doc.y = 108;
    this.doc
      .font("NotoBold")
      .fontSize(11)
      .fillColor(colors.green)
      .text("SyncCraft", page.margin, this.doc.y);
    this.doc.moveDown(1.4);
    this.doc
      .font("NotoBold")
      .fontSize(30)
      .fillColor(colors.ink)
      .text("制作提案レポート", {
        width: this.contentWidth(),
        lineGap: 4,
      });
    this.doc.moveDown(0.35);
    this.doc
      .font("Noto")
      .fontSize(12)
      .fillColor(colors.muted)
      .text("AI Website Proposal / Demo Site Package");
    this.doc.moveDown(2.1);

    const companyBoxY = this.doc.y;
    this.doc
      .roundedRect(page.margin, companyBoxY, this.contentWidth(), 132, 10)
      .fillAndStroke(colors.white, colors.line);
    this.doc
      .font("NotoBold")
      .fontSize(8.5)
      .fillColor(colors.green)
      .text("対象会社", page.margin + 20, companyBoxY + 22);
    this.doc
      .font("NotoBold")
      .fontSize(20)
      .fillColor(colors.ink)
      .text(proposal.company.name, page.margin + 20, companyBoxY + 46, {
        width: this.contentWidth() - 40,
        lineGap: 2,
      });
    this.doc
      .font("Noto")
      .fontSize(9.2)
      .fillColor(colors.muted)
      .text(`注文番号: ${input.order.orderId}`, page.margin + 20, companyBoxY + 102)
      .text(`作成日: ${createdAt}`, page.margin + 260, companyBoxY + 102);

    this.doc.y = companyBoxY + 168;
    this.doc
      .roundedRect(page.margin, this.doc.y, this.contentWidth(), 122, 10)
      .fill(colors.black);
    this.doc
      .font("NotoBold")
      .fontSize(13)
      .fillColor(colors.white)
      .text("このPDFに含まれる内容", page.margin + 20, this.doc.y + 22);
    this.doc
      .font("Noto")
      .fontSize(10)
      .fillColor("#e5e7eb")
      .text("見積もり・制作期間・Demo構成・推奨ページ・技術スタック・ダウンロード内容", page.margin + 20, this.doc.y + 52, {
        width: this.contentWidth() - 40,
        lineGap: 4,
      })
      .text("初回相談前に、制作イメージと投資感を確認するための提案資料です。", page.margin + 20, this.doc.y + 82, {
        width: this.contentWidth() - 40,
        lineGap: 4,
      });

    this.doc.y += 158;
  }

  metrics(items: Metric[]) {
    const gap = 10;
    const width = (this.contentWidth() - gap * 2) / 3;
    const top = this.doc.y;
    const height = 112;

    this.ensure(height + 16);

    items.forEach((item, index) => {
      const x = page.margin + index * (width + gap);
      this.doc.roundedRect(x, top, width, height, 9).fillAndStroke(colors.white, colors.line);
      this.doc
        .font("NotoBold")
        .fontSize(8.2)
        .fillColor(colors.green)
        .text(item.label, x + 13, top + 16, { width: width - 26 });
      this.doc
        .font("NotoBold")
        .fontSize(14)
        .fillColor(colors.ink)
        .text(item.value, x + 13, top + 40, { width: width - 26, lineGap: 2 });
      this.doc
        .font("Noto")
        .fontSize(8.2)
        .fillColor(colors.muted)
        .text(item.note, x + 13, top + 78, { width: width - 26, lineGap: 2 });
    });

    this.doc.y = top + height + 18;
  }

  comparison(input: ReportInput) {
    const proposal = input.proposal;
    const syncCraftMinPrice = roundToTenThousand(proposal.estimate.minPrice * 0.4);
    const syncCraftMaxPrice = roundToTenThousand(proposal.estimate.maxPrice * 0.6);
    const syncCraftDevelopmentPeriod = buildSyncCraftPeriod(proposal.estimate.developmentPeriod);
    const gap = 12;
    const width = (this.contentWidth() - gap) / 2;
    const height = 154;
    const top = this.doc.y;

    this.ensure(height + 16);

    const cards = [
      {
        title: "通常の制作会社",
        price: `${yen.format(proposal.estimate.minPrice)}〜${yen.format(proposal.estimate.maxPrice)}`,
        period: proposal.estimate.developmentPeriod,
        note: "一般的な制作工程を前提とした概算です。",
        fill: colors.white,
        ink: colors.ink,
        muted: colors.muted,
      },
      {
        title: "SyncCraftで制作する場合",
        price: `${yen.format(syncCraftMinPrice)}〜${yen.format(syncCraftMaxPrice)}`,
        period: syncCraftDevelopmentPeriod,
        note: "40%OFF、条件により最大60%OFF。公開後1年間の無料メンテナンス付き。",
        fill: colors.black,
        ink: colors.white,
        muted: "#cbd5e1",
      },
    ];

    cards.forEach((card, index) => {
      const x = page.margin + index * (width + gap);
      this.doc.roundedRect(x, top, width, height, 10).fillAndStroke(card.fill, index === 0 ? colors.line : card.fill);
      this.doc.font("NotoBold").fontSize(9).fillColor(card.muted).text(card.title, x + 16, top + 18, { width: width - 32 });
      this.doc.font("NotoBold").fontSize(16).fillColor(card.ink).text(card.price, x + 16, top + 48, { width: width - 32, lineGap: 2 });
      this.doc.font("Noto").fontSize(10).fillColor(card.ink).text(`開発期間: ${card.period}`, x + 16, top + 92, { width: width - 32 });
      this.doc.font("Noto").fontSize(8.4).fillColor(card.muted).text(card.note, x + 16, top + 116, { width: width - 32, lineGap: 2 });
    });

    this.doc.y = top + height + 18;
  }

  keyValues(items: KeyValue[]) {
    const labelWidth = 92;
    const padding = 16;
    const rowGap = 10;
    const rows = items.map((item) => {
      const value = clean(item.value);
      const height = Math.max(
        28,
        this.doc.heightOfString(value, {
          width: this.contentWidth() - labelWidth - padding * 2 - 16,
          lineGap: 3,
        }) + 10,
      );

      return { ...item, value, height };
    });
    const height = rows.reduce((sum, row) => sum + row.height + rowGap, 0) + padding;

    this.ensure(height + 12);
    const top = this.doc.y;
    this.doc.roundedRect(page.margin, top, this.contentWidth(), height, 10).fillAndStroke(colors.white, colors.line);
    let y = top + padding;

    rows.forEach((row) => {
      this.doc.font("NotoBold").fontSize(8.4).fillColor(colors.green).text(row.label, page.margin + padding, y, { width: labelWidth });
      this.doc.font("Noto").fontSize(9.4).fillColor(colors.ink).text(row.value, page.margin + padding + labelWidth + 12, y - 1, {
        width: this.contentWidth() - labelWidth - padding * 2 - 12,
        lineGap: 3,
      });
      y += row.height + rowGap;
    });

    this.doc.y = top + height + 16;
  }

  bullets(title: string, items: string[], options: { columns?: 1 | 2 } = {}) {
    const columns = options.columns ?? 1;
    const visibleItems = items.length ? items : ["未設定"];
    const columnGap = 18;
    const columnWidth = columns === 2 ? (this.contentWidth() - columnGap - 32) / 2 : this.contentWidth() - 32;
    const lineGap = 3;
    const columnItems = columns === 2
      ? [
          visibleItems.slice(0, Math.ceil(visibleItems.length / 2)),
          visibleItems.slice(Math.ceil(visibleItems.length / 2)),
        ]
      : [visibleItems];
    const columnHeights = columnItems.map((column) => column.reduce((sum, item) => (
      sum + this.doc.heightOfString(`・${clean(item)}`, { width: columnWidth, lineGap }) + 7
    ), 0));
    const height = Math.max(...columnHeights, 24) + 48;

    this.ensure(height + 12);
    const top = this.doc.y;
    this.doc.roundedRect(page.margin, top, this.contentWidth(), height, 10).fillAndStroke(colors.white, colors.line);
    this.doc.font("NotoBold").fontSize(11).fillColor(colors.ink).text(title, page.margin + 16, top + 15, { width: this.contentWidth() - 32 });

    columnItems.forEach((column, columnIndex) => {
      let y = top + 42;
      const x = page.margin + 16 + columnIndex * (columnWidth + columnGap);

      column.forEach((item) => {
        const text = `・${clean(item)}`;
        this.doc.font("Noto").fontSize(9.4).fillColor(colors.ink).text(text, x, y, {
          width: columnWidth,
          lineGap,
        });
        y += this.doc.heightOfString(text, { width: columnWidth, lineGap }) + 7;
      });
    });

    this.doc.y = top + height + 16;
  }
}

export async function buildProposalReportPdf(input: ReportInput) {
  const proposal = input.proposal;
  const demoPlan = input.demo.result?.demoPlan;
  const summary = input.demo.result?.summary;
  const previewPages = input.demo.result?.previewPages ?? [];
  const homeSections = demoPlan?.homeSections ?? [];
  const syncCraftMinPrice = roundToTenThousand(proposal.estimate.minPrice * 0.4);
  const syncCraftMaxPrice = roundToTenThousand(proposal.estimate.maxPrice * 0.6);
  const syncCraftDevelopmentPeriod = buildSyncCraftPeriod(proposal.estimate.developmentPeriod);
  const doc = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true,
    margin: page.margin,
    size: page.size,
    info: {
      Title: `${proposal.company.name} 制作提案レポート`,
      Author: "SyncCraft",
      Subject: "AI Website Proposal",
    },
  });
  const pdf = collectPdf(doc);
  const writer = new ReportWriter(doc, `${proposal.company.name} 制作提案レポート`);

  writer.setup();
  doc.addPage();
  writer.startPage();
  writer.cover(input);

  writer.addPage();
  writer.section("1. 提案サマリー", "SUMMARY");
  writer.paragraph(`${proposal.company.name} 様のWebサイト制作について、制作目的、必要機能、デザイン方針、概算費用、制作期間、Demoサイト構成を整理しました。今回のPDFは、初回検討の段階で全体像を短時間で把握し、正式相談へ進めるための提案レポートです。`);
  writer.metrics([
    {
      label: "見積もり区間",
      value: `${yen.format(proposal.estimate.minPrice)}〜${yen.format(proposal.estimate.maxPrice)}`,
      note: "サイト種類と必要機能から自動算出",
    },
    {
      label: "複雑度",
      value: proposal.estimate.complexity,
      note: `選択機能数: ${proposal.website.features.length}件`,
    },
    {
      label: "開発期間",
      value: proposal.estimate.developmentPeriod,
      note: "機能数と確認範囲に応じた目安",
    },
  ]);
  writer.comparison(input);
  writer.paragraph(`SyncCraftで制作する場合、制作費は ${yen.format(syncCraftMinPrice)}〜${yen.format(syncCraftMaxPrice)}、制作期間は ${syncCraftDevelopmentPeriod} を目安にできます。長年のWeb制作経験をもとに自社開発したAIエージェントを活用し、要件整理、構成作成、初期Demo準備を効率化します。公開後1年間の無料メンテナンスも含みます。`, {
    color: colors.green,
    bold: true,
  });

  writer.addPage();
  writer.section("2. プロジェクト概要", "PROJECT");
  writer.keyValues([
    { label: "会社名", value: proposal.company.name },
    { label: "業界", value: proposal.company.industry },
    { label: "サイト種類", value: proposal.website.type },
    { label: "スローガン", value: proposal.company.slogan },
    { label: "会社説明", value: proposal.company.description },
    { label: "連絡先", value: proposal.company.contactInfo },
    { label: "デザイン", value: `${proposal.website.designStyle} / ${proposal.website.mainColor}` },
  ]);
  writer.bullets("制作目的", proposal.website.goals, { columns: 2 });
  writer.bullets("必要機能", proposal.website.features.length ? proposal.website.features : ["追加機能なし"], { columns: 2 });

  writer.section("3. Demoサイト構成", "DEMO");
  writer.paragraph(summary?.concept ?? "入力内容をもとに、主要ページ、導線、デザイン方針を整理したデモサイトです。");
  writer.keyValues([
    { label: "Demo名", value: demoPlan?.siteName ?? `${proposal.company.name} Demo Site` },
    { label: "想定ターゲット", value: demoPlan?.contentStrategy.targetAudience ?? "貴社サービスに関心を持つ見込み顧客" },
    { label: "成果目標", value: demoPlan?.contentStrategy.conversionGoal ?? "問い合わせ・相談につなげること" },
    { label: "主要CTA", value: demoPlan?.contentStrategy.ctaLabel ?? "お問い合わせ" },
    { label: "デザイン方針", value: demoPlan ? `${demoPlan.visualStyle.designStyle} / ${demoPlan.visualStyle.mainColor} / ${demoPlan.visualStyle.tone}` : `${proposal.website.designStyle} / ${proposal.website.mainColor}` },
  ]);
  writer.bullets(
    "生成Demoページ",
    previewPages.length
      ? previewPages.map((previewPage) => `${previewPage.name} (${previewPage.fileName})`)
      : ["トップページデモHTML"],
    { columns: 2 },
  );
  writer.bullets(
    "トップページの主な構成",
    homeSections.length
      ? homeSections.slice(0, 8).map((section) => `${section.title}: ${section.subtitle || section.content}`)
      : ["入力内容に応じたファーストビュー、サービス紹介、問い合わせ導線を配置"],
  );

  writer.section("4. 推奨ページ・技術構成", "STRUCTURE");
  writer.bullets("推奨ページ構成", proposal.recommendation.pages, { columns: 2 });
  writer.bullets("推奨技術スタック", proposal.recommendation.techStack, { columns: 2 });
  writer.paragraph("サイト公開時には、サーバー、ドメイン、外部サービス利用料などの購入費用は別途必要です。ご希望の場合は、選定、取得、DNS設定、公開、初期運用までSyncCraftがまとめて代行できます。");

  writer.section("5. ダウンロード内容と注意事項", "FILES");
  writer.bullets("この注文で準備されるファイル", [
    "制作提案レポート PDF",
    "Proposal JSON",
    "デモサイト HTML",
    "デモ生成結果 JSON",
    "推奨ページ構成・技術スタック情報",
  ]);
  writer.paragraph("Demoサイトは初期検討用の簡易版です。具体的な実装詳細、内部プロンプト、制作ノウハウは保護のため公開していません。正式制作をご希望の場合は、要件確認後に詳細設計と実装内容を個別にご提案します。", {
    color: colors.green,
    bold: true,
  });

  writer.paragraph("今後の進め方: PDFレポートとDemo HTMLで全体イメージを確認したうえで、必要ページ、機能、原稿、写真素材、公開環境を確認します。その後、正式見積もりと制作スケジュールを確定し、デザイン詳細、実装、確認、公開、保守へ進行します。", {
    size: 9.6,
  });

  writer.finish();
  doc.end();

  return pdf;
}
