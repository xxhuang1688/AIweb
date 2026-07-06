import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { buildProposalReportPdf } from "@/lib/reportPdf";
import type { DemoGenerationResponse } from "@/types/agent";
import type { ManualPaymentStoredOrder } from "@/types/manualPayment";
import type { ProposalJson } from "@/types/proposal";

const ORDER_ID_PATTERN = /^SC-\d{8}-[A-Z0-9]{6}$/;

function storageRoot() {
  const configured = process.env.MANUAL_PAYMENT_STORAGE_DIR || "data/orders";
  const relativePath = configured
    .replace(/^\.?\//, "")
    .replace(/^data[\\/]/, "");
  const safeSegments = relativePath
    .split(/[\\/]+/)
    .filter((segment) => segment && segment !== "." && segment !== "..");

  return path.join(process.cwd(), "data", ...safeSegments);
}

function assertValidOrderId(orderId: string) {
  if (!ORDER_ID_PATTERN.test(orderId)) {
    throw new Error("Invalid order id");
  }
}

function orderDirectory(orderId: string) {
  assertValidOrderId(orderId);

  return path.join(storageRoot(), orderId);
}

function safeFileName(value: string, fallback: string) {
  const normalized = value
    .replaceAll("\\", "-")
    .replaceAll("/", "-")
    .replaceAll("..", "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

export function createAccessCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createCustomerToken() {
  return `${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
}

export function isSafeDownloadFileName(fileName: string) {
  return fileName.length > 0 && fileName === path.basename(fileName) && !fileName.includes("..");
}

export async function saveManualPaymentOrder(input: {
  order: ManualPaymentStoredOrder;
  proposal: ProposalJson;
  demo: DemoGenerationResponse;
}) {
  const directory = orderDirectory(input.order.orderId);
  await mkdir(directory, { recursive: true });

  const files = [
    ...input.order.files,
  ];

  await writeFile(
    path.join(directory, "proposal.json"),
    `${JSON.stringify(input.proposal, null, 2)}\n`,
    "utf8",
  );

  await writeFile(
    path.join(directory, "demo-result.json"),
    `${JSON.stringify(input.demo, null, 2)}\n`,
    "utf8",
  );

  const reportPdf = await buildProposalReportPdf({
    order: input.order,
    proposal: input.proposal,
    demo: input.demo,
  });

  await writeFile(path.join(directory, "proposal-report.pdf"), reportPdf);
  files.push({
    fileName: "proposal-report.pdf",
    label: "制作提案レポート PDF",
    contentType: "application/pdf",
  });

  const previewPages = input.demo.result?.previewPages ?? [];

  if (previewPages.length > 0) {
    await Promise.all(previewPages.map((page, index) => {
      const fileName = safeFileName(page.fileName, `page-${index + 1}.html`);
      files.push({
        fileName,
        label: page.name,
        contentType: "text/html; charset=utf-8",
      });

      return writeFile(path.join(directory, fileName), page.html, "utf8");
    }));
  } else if (input.demo.result?.previewHtml) {
    files.push({
      fileName: "index.html",
      label: "デモサイト",
      contentType: "text/html; charset=utf-8",
    });
    await writeFile(path.join(directory, "index.html"), input.demo.result.previewHtml, "utf8");
  }

  const storedOrder = {
    ...input.order,
    files,
  };

  await writeFile(
    path.join(directory, "order.json"),
    `${JSON.stringify(storedOrder, null, 2)}\n`,
    "utf8",
  );

  return storedOrder;
}

export async function readManualPaymentOrder(orderId: string) {
  const directory = orderDirectory(orderId);
  const content = await readFile(path.join(directory, "order.json"), "utf8");

  return JSON.parse(content) as ManualPaymentStoredOrder;
}

export async function confirmManualPaymentOrder(orderId: string) {
  const order = await readManualPaymentOrder(orderId);
  const confirmedOrder: ManualPaymentStoredOrder = {
    ...order,
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
  };

  await writeFile(
    path.join(orderDirectory(orderId), "order.json"),
    `${JSON.stringify(confirmedOrder, null, 2)}\n`,
    "utf8",
  );

  return confirmedOrder;
}

export async function readManualPaymentOrderFile(orderId: string, fileName: string) {
  if (!isSafeDownloadFileName(fileName)) {
    throw new Error("Invalid file name");
  }

  const order = await readManualPaymentOrder(orderId);
  const file = order.files.find((item) => item.fileName === fileName);

  if (!file) {
    throw new Error("File not found");
  }

  const content = await readFile(path.join(orderDirectory(orderId), file.fileName));

  return { content, file };
}
