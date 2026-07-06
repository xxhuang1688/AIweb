import { NextResponse } from "next/server";
import { runDemoGenerationAgent } from "@/lib/agent/demoAgent";
import { validateProposalJson } from "@/lib/agent/proposalValidator";
import { createAccessCode, createCustomerToken, saveManualPaymentOrder } from "@/lib/manualPaymentStorage";
import { getRequestOrigin } from "@/lib/requestOrigin";
import type { ManualPaymentMethod, ManualPaymentOrderRequest, ManualPaymentOrderResponse } from "@/types/manualPayment";

export const runtime = "nodejs";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitize(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

function createOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `SC-${date}-${random}`;
}

function amountJpy() {
  const raw = Number(process.env.MANUAL_PAYMENT_AMOUNT_JPY ?? 990);

  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 990;
}

function receiverEmail() {
  return process.env.MANUAL_PAYMENT_ORDER_EMAIL || "";
}

function ccEmail() {
  return process.env.MANUAL_PAYMENT_ORDER_CC_EMAIL || "";
}

function paymentConfig() {
  return {
    receiverEmail: receiverEmail(),
    ccEmail: ccEmail(),
    bank: {
      bankName: process.env.MANUAL_PAYMENT_BANK_NAME ?? "",
      bankCode: process.env.MANUAL_PAYMENT_BANK_CODE ?? "",
      branchCode: process.env.MANUAL_PAYMENT_BRANCH_CODE ?? "",
      accountNumber: process.env.MANUAL_PAYMENT_ACCOUNT_NUMBER ?? "",
      accountHolder: process.env.MANUAL_PAYMENT_ACCOUNT_HOLDER ?? "",
    },
    paypayNote: process.env.MANUAL_PAYMENT_PAYPAY_NOTE ?? "PayPay QRコードは現在準備中です。",
  };
}

function encodeMailAddressList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => encodeURIComponent(item))
    .join(",");
}

function buildMailtoUrl(input: {
  receiver: string;
  cc: string;
  orderId: string;
  amount: number;
  operatorUrl: string;
  statusUrl: string;
  request: ManualPaymentOrderRequest;
}) {
  const proposal = input.request.proposal;
  const subject = `【SyncCraft】支払い確認依頼 ${input.orderId}`;
  const body = [
    "SyncCraft デモサイト生成の支払い確認をお願いします。",
    "",
    `注文番号: ${input.orderId}`,
    `金額: ${input.amount}円`,
    `会社名: ${proposal.company.name}`,
    `業界: ${proposal.company.industry}`,
    `メールアドレス: ${input.request.customerEmail}`,
    `お支払い名義: ${input.request.payerName}`,
    `お支払い方法: ${input.request.paymentMethod === "bank" ? "銀行振込" : "PayPay"}`,
    input.request.note ? `備考: ${input.request.note}` : "",
    `注文ステータスURL: ${input.statusUrl}`,
    `運営者確認URL: ${input.operatorUrl}`,
    "",
    "お支払い確認後、認証コードの送付をお願いします。",
    "",
    "制作プラン概要:",
    `サイト種類: ${proposal.website.type}`,
    `制作目的: ${proposal.website.goals.join("、")}`,
    `必要機能: ${proposal.website.features.join("、") || "なし"}`,
    `見積もり区間: ${proposal.estimate.minPrice}円〜${proposal.estimate.maxPrice}円`,
    `複雑度: ${proposal.estimate.complexity}`,
    `開発期間: ${proposal.estimate.developmentPeriod}`,
    "",
    "Proposal JSONとデモHTMLは注文番号に紐づけて保存済みです。",
  ].filter(Boolean).join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  if (input.cc) {
    params.set("cc", input.cc);
  }

  return `mailto:${encodeMailAddressList(input.receiver)}?${params.toString()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<ManualPaymentOrderRequest>;
    const { proposal, errors } = validateProposalJson(body.proposal);
    const validationErrors = [...errors];

    if (!hasText(body.customerEmail) || !String(body.customerEmail).includes("@")) {
      validationErrors.push("メールアドレスを入力してください。");
    }

    if (!hasText(body.payerName)) {
      validationErrors.push("お支払い名義を入力してください。");
    }

    const paymentMethod = body.paymentMethod;

    if (paymentMethod !== "bank" && paymentMethod !== "paypay") {
      validationErrors.push("お支払い方法を選択してください。");
    }

    if (!proposal || validationErrors.length > 0) {
      return NextResponse.json(
        {
          status: "invalid_request",
          errors: validationErrors,
          order: null,
          payment: null,
          mailtoUrl: null,
        } satisfies ManualPaymentOrderResponse,
        { status: 400 },
      );
    }

    const confirmedPaymentMethod: ManualPaymentMethod = paymentMethod === "paypay" ? "paypay" : "bank";
    const cleanRequest: ManualPaymentOrderRequest = {
      proposal,
      customerEmail: sanitize(String(body.customerEmail)),
      payerName: sanitize(String(body.payerName)),
      paymentMethod: confirmedPaymentMethod,
      note: hasText(body.note) ? sanitize(String(body.note)) : "",
    };
    const orderId = createOrderId();
    const createdAt = new Date().toISOString();
    const amount = amountJpy();
    const payment = paymentConfig();
    const origin = getRequestOrigin(request);
    const downloadUrl = `/download/${orderId}`;
    const fullDownloadUrl = `${origin}${downloadUrl}`;
    const customerToken = createCustomerToken();
    const statusUrl = `/order-status/${orderId}?token=${customerToken}`;
    const fullStatusUrl = `${origin}${statusUrl}`;
    const operatorUrl = `${origin}/operator/orders/${orderId}`;
    const demo = await runDemoGenerationAgent({ proposal, provider: "mock" });

    if (demo.status !== "generated") {
      return NextResponse.json(
        {
          status: "invalid_request",
          errors: demo.errors.length
            ? demo.errors
            : ["デモデータを準備できませんでした。しばらくしてからもう一度お試しください。"],
          order: null,
          payment: null,
          mailtoUrl: null,
        } satisfies ManualPaymentOrderResponse,
        { status: 503 },
      );
    }

    const storedOrder = await saveManualPaymentOrder({
      order: {
        orderId,
        accessCode: createAccessCode(),
        customerToken,
        amountJpy: amount,
        companyName: proposal.company.name,
        customerEmail: cleanRequest.customerEmail,
        payerName: cleanRequest.payerName,
        paymentMethod: cleanRequest.paymentMethod,
        note: cleanRequest.note ?? "",
        status: "pending_manual_confirmation",
        createdAt,
        downloadUrl,
        statusUrl,
        files: [
          {
            fileName: "proposal.json",
            label: "Proposal JSON",
            contentType: "application/json; charset=utf-8",
          },
          {
            fileName: "demo-result.json",
            label: "デモ生成結果",
            contentType: "application/json; charset=utf-8",
          },
        ],
      },
      proposal,
      demo,
    });
    const mailtoUrl = payment.receiverEmail
      ? buildMailtoUrl({ receiver: payment.receiverEmail, cc: payment.ccEmail, orderId, amount, operatorUrl, statusUrl: fullStatusUrl, request: cleanRequest })
      : null;

    return NextResponse.json({
      status: "received",
      errors: [],
      order: {
        orderId,
        amountJpy: amount,
        companyName: proposal.company.name,
        customerEmail: cleanRequest.customerEmail,
        payerName: cleanRequest.payerName,
        paymentMethod: cleanRequest.paymentMethod,
        createdAt,
        demoPrepared: true,
        fileCount: storedOrder.files.length,
        downloadUrl: fullDownloadUrl,
        statusUrl: fullStatusUrl,
      },
      payment,
      mailtoUrl,
    } satisfies ManualPaymentOrderResponse);
  } catch (error) {
    console.error("manual payment order failed", error);

    return NextResponse.json(
      {
        status: "invalid_request",
        errors: ["リクエストを読み取れませんでした。"],
        order: null,
        payment: null,
        mailtoUrl: null,
      } satisfies ManualPaymentOrderResponse,
      { status: 400 },
    );
  }
}
