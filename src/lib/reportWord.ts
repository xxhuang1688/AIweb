import type { DemoGenerationResponse } from "@/types/agent";
import type { ManualPaymentStoredOrder } from "@/types/manualPayment";
import type { ProposalJson } from "@/types/proposal";

type ReportInput = {
  order: ManualPaymentStoredOrder;
  proposal: ProposalJson;
  demo: DemoGenerationResponse;
};

type ZipEntry = {
  name: string;
  content: Buffer;
};

const yen = new Intl.NumberFormat("ja-JP", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUInt16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

function writeUInt32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

function createZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const content = entry.content;
    const crc = crc32(content);

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(crc),
      writeUInt32(content.length),
      writeUInt32(content.length),
      writeUInt16(name.length),
      writeUInt16(0),
      name,
    ]);

    localParts.push(localHeader, content);

    centralParts.push(Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(crc),
      writeUInt32(content.length),
      writeUInt32(content.length),
      writeUInt16(name.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      name,
    ]));

    offset += localHeader.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function xml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clean(value: string | null | undefined, fallback = "未設定") {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  return text || fallback;
}

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

function run(text: string, options: { bold?: boolean; color?: string } = {}) {
  const props = [
    options.bold ? "<w:b/>" : "",
    options.color ? `<w:color w:val="${options.color}"/>` : "",
  ].join("");

  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

function paragraph(text: string, style?: string, options: { bold?: boolean; color?: string } = {}) {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";

  return `<w:p>${styleXml}${run(text, options)}</w:p>`;
}

function bullet(text: string) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${run(text)}</w:p>`;
}

function numbered(text: string) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr>${run(text)}</w:p>`;
}

function cell(text: string, width: number, shade = "FFFFFF", bold = false) {
  return [
    "<w:tc>",
    `<w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:shd w:fill="${shade}"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tcMar></w:tcPr>`,
    paragraph(text, undefined, { bold }),
    "</w:tc>",
  ].join("");
}

function table(rows: Array<[string, string]>) {
  return [
    "<w:tbl>",
    '<w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D4D4D8"/><w:left w:val="single" w:sz="4" w:color="D4D4D8"/><w:bottom w:val="single" w:sz="4" w:color="D4D4D8"/><w:right w:val="single" w:sz="4" w:color="D4D4D8"/><w:insideH w:val="single" w:sz="4" w:color="E4E4E7"/><w:insideV w:val="single" w:sz="4" w:color="E4E4E7"/></w:tblBorders></w:tblPr>',
    '<w:tblGrid><w:gridCol w:w="2600"/><w:gridCol w:w="6760"/></w:tblGrid>',
    rows.map(([label, value]) => `<w:tr>${cell(label, 2600, "F4F4F5", true)}${cell(value, 6760)}</w:tr>`).join(""),
    "</w:tbl>",
    paragraph(""),
  ].join("");
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => clean(value, "")).filter(Boolean)));
}

function documentXml(input: ReportInput) {
  const { order, proposal, demo } = input;
  const syncMin = roundToTenThousand(proposal.estimate.minPrice * 0.4);
  const syncMax = roundToTenThousand(proposal.estimate.maxPrice * 0.6);
  const syncPeriod = buildSyncCraftPeriod(proposal.estimate.developmentPeriod);
  const demoPages = demo.result?.previewPages?.map((page) => page.name) ?? [];
  const pages = unique([...proposal.recommendation.pages, ...demoPages]);
  const features = proposal.website.features.length ? proposal.website.features : ["追加機能なし"];
  const title = `${clean(proposal.company.name)} Webサイト制作提案書`;

  const body = [
    paragraph("SyncCraft AI Website Proposal Platform", "Subtitle", { color: "047857", bold: true }),
    paragraph(title, "Title"),
    paragraph(`注文番号: ${order.orderId}`),
    paragraph(`作成日: ${new Date(order.createdAt).toLocaleDateString("ja-JP")}`),
    paragraph("この提案書は、入力いただいた会社情報、サイト種類、制作目的、必要機能、デザイン方針をもとに、初回検討用の制作方針を整理したものです。Demoサイトは全体イメージ確認用の最小構成であり、正式制作では原稿、写真素材、機能詳細、公開環境を確認したうえで仕様を確定します。"),

    paragraph("1. プロジェクト概要", "Heading1"),
    table([
      ["会社名", clean(proposal.company.name)],
      ["業界", clean(proposal.company.industry)],
      ["サイト種類", clean(proposal.website.type)],
      ["スローガン", clean(proposal.company.slogan)],
      ["会社説明", clean(proposal.company.description)],
      ["連絡先", clean(proposal.company.contactInfo)],
    ]),

    paragraph("2. 制作目的・必要機能", "Heading1"),
    paragraph("制作目的", "Heading2"),
    ...proposal.website.goals.map((goal) => bullet(goal)),
    paragraph("必要機能", "Heading2"),
    ...features.map((feature) => bullet(feature)),

    paragraph("3. 見積もり・制作期間", "Heading1"),
    table([
      ["通常見積もり区間", `${yen.format(proposal.estimate.minPrice)}〜${yen.format(proposal.estimate.maxPrice)}`],
      ["SyncCraft 制作目安", `${yen.format(syncMin)}〜${yen.format(syncMax)}（通常相場より40%〜最大60%の低減を目指します）`],
      ["通常開発期間", proposal.estimate.developmentPeriod],
      ["SyncCraft 開発目安", `${syncPeriod}（通常の約1/2を目安に進行）`],
      ["複雑度", proposal.estimate.complexity],
      ["無料メンテナンス", "正式制作をご依頼いただいた場合、公開後1年間の無料メンテナンスを含みます。"],
    ]),

    paragraph("4. 推奨ページ構成", "Heading1"),
    ...pages.map((page) => bullet(page)),

    paragraph("5. 推奨技術スタック", "Heading1"),
    ...unique(proposal.recommendation.techStack).map((tech) => bullet(tech)),

    paragraph("6. デザイン方針", "Heading1"),
    table([
      ["デザインスタイル", clean(proposal.website.designStyle)],
      ["メインカラー", clean(proposal.website.mainColor)],
      ["参考サイト", proposal.website.referenceSites.length ? proposal.website.referenceSites.join(" / ") : "任意・未指定"],
      ["参考メモ", clean(proposal.website.referenceNote, "任意・未指定")],
      ["Demoの位置づけ", "今回のDemo HTMLは初期検討用の基本デザインです。具体的な実装方針、詳細設計、内部ノウハウは保護のため公開していません。正式相談時に目的に合わせて詳細化します。"],
    ]),

    paragraph("7. 今後の進め方", "Heading1"),
    numbered("Demo HTMLと本提案書を確認し、サイト全体の方向性を整理します。"),
    numbered("必要ページ、原稿、写真素材、機能詳細、サーバー・ドメイン方針を確認します。"),
    numbered("正式見積もりと制作スケジュールを確定します。"),
    numbered("デザイン詳細、実装、確認、公開、保守の順に進行します。"),

    paragraph("備考", "Heading1"),
    paragraph("サーバー費用、ドメイン取得費用、有料外部サービス利用料は本見積もりには含まれていません。ご希望の場合は、SyncCraft側で取得・設定・運用までまとめてサポートできます。"),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1200" w:right="1270" w:bottom="1200" w:left="1270" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Yu Gothic" w:eastAsia="Yu Gothic" w:hAnsi="Yu Gothic"/><w:sz w:val="22"/><w:color w:val="27272A"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="320" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:before="120" w:after="260"/></w:pPr><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="111827"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="047857"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="111827"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="047857"/></w:rPr></w:style>
</w:styles>`;
}

function numberingXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="520" w:hanging="260"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
  <w:abstractNum w:abstractNumId="2"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="560" w:hanging="280"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`;
}

export function buildProposalWordReport(input: ReportInput) {
  const createdAt = new Date(input.order.createdAt).toISOString();

  return createZip([
    {
      name: "[Content_Types].xml",
      content: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`, "utf8"),
    },
    {
      name: "_rels/.rels",
      content: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`, "utf8"),
    },
    {
      name: "word/_rels/document.xml.rels",
      content: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`, "utf8"),
    },
    { name: "word/document.xml", content: Buffer.from(documentXml(input), "utf8") },
    { name: "word/styles.xml", content: Buffer.from(stylesXml(), "utf8") },
    { name: "word/numbering.xml", content: Buffer.from(numberingXml(), "utf8") },
    {
      name: "docProps/core.xml",
      content: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xml(clean(input.proposal.company.name))} Webサイト制作提案書</dc:title>
  <dc:creator>SyncCraft</dc:creator>
  <cp:lastModifiedBy>SyncCraft</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`, "utf8"),
    },
    {
      name: "docProps/app.xml",
      content: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>SyncCraft AI Website Proposal Platform</Application>
</Properties>`, "utf8"),
    },
  ]);
}
