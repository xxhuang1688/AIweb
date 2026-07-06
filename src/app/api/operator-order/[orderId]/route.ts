import { NextResponse } from "next/server";
import { confirmManualPaymentOrder, readManualPaymentOrder } from "@/lib/manualPaymentStorage";
import { getRequestOrigin } from "@/lib/requestOrigin";

export const runtime = "nodejs";

function configuredAdminCode() {
  return process.env.MANUAL_PAYMENT_ADMIN_CODE ?? "";
}

function buildOrderResponse(input: {
  origin: string;
  order: Awaited<ReturnType<typeof readManualPaymentOrder>>;
}) {
  const downloadUrl = `${input.origin}${input.order.downloadUrl}`;

  return {
    status: "ok",
    errors: [],
    order: {
      orderId: input.order.orderId,
      companyName: input.order.companyName,
      customerEmail: input.order.customerEmail,
      amountJpy: input.order.amountJpy,
      createdAt: input.order.createdAt,
      confirmedAt: input.order.confirmedAt ?? null,
      paymentStatus: input.order.status,
      fileCount: input.order.files.length,
      statusUrl: `${input.origin}${input.order.statusUrl}`,
    },
    reply: {
      subject: `【SyncCraft】制作データのダウンロード情報 ${input.order.orderId}`,
      to: input.order.customerEmail,
      downloadUrl,
      accessCode: input.order.accessCode,
      text: buildReplyText({
        companyName: input.order.companyName,
        downloadUrl,
        accessCode: input.order.accessCode,
      }),
    },
  };
}

function buildReplyText(input: {
  companyName: string;
  downloadUrl: string;
  accessCode: string;
}) {
  return [
    `${input.companyName} ご担当者様`,
    "",
    "この度はSyncCraftをご利用いただき、誠にありがとうございます。",
    "お支払いを確認いたしました。",
    "",
    "以下のURLより、制作データをダウンロードしてください。",
    "",
    `ダウンロードURL：${input.downloadUrl}`,
    `認証コード：${input.accessCode}`,
    "",
    "ダウンロード内容：",
    "・制作提案書 Word",
    "・Proposal JSON",
    "・デモサイトHTML",
    "・デモ生成結果",
    "・制作プラン一式",
    "",
    "ご不明点がありましたら、お気軽にご連絡ください。",
    "",
    "SyncCraft",
  ].join("\n");
}

export async function GET(request: Request, context: RouteContext<"/api/operator-order/[orderId]">) {
  const adminCode = configuredAdminCode();

  if (!adminCode) {
    return NextResponse.json({
      status: "not_configured",
      errors: ["管理者コードが設定されていません。"],
      order: null,
      reply: null,
    }, { status: 503 });
  }

  const url = new URL(request.url);
  const inputCode = url.searchParams.get("adminCode") ?? "";

  if (inputCode !== adminCode) {
    return NextResponse.json({
      status: "unauthorized",
      errors: ["管理者コードが正しくありません。"],
      order: null,
      reply: null,
    }, { status: 401 });
  }

  try {
    const { orderId } = await context.params;
    const order = await readManualPaymentOrder(orderId);

    return NextResponse.json(buildOrderResponse({ origin: getRequestOrigin(request), order }));
  } catch {
    return NextResponse.json({
      status: "not_found",
      errors: ["注文情報が見つかりません。"],
      order: null,
      reply: null,
    }, { status: 404 });
  }
}

export async function POST(request: Request, context: RouteContext<"/api/operator-order/[orderId]">) {
  const adminCode = configuredAdminCode();

  if (!adminCode) {
    return NextResponse.json({
      status: "not_configured",
      errors: ["管理者コードが設定されていません。"],
      order: null,
      reply: null,
    }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as { adminCode?: string };

  if (body.adminCode !== adminCode) {
    return NextResponse.json({
      status: "unauthorized",
      errors: ["管理者コードが正しくありません。"],
      order: null,
      reply: null,
    }, { status: 401 });
  }

  try {
    const { orderId } = await context.params;
    const order = await confirmManualPaymentOrder(orderId);

    return NextResponse.json(buildOrderResponse({ origin: getRequestOrigin(request), order }));
  } catch {
    return NextResponse.json({
      status: "not_found",
      errors: ["注文情報が見つかりません。"],
      order: null,
      reply: null,
    }, { status: 404 });
  }
}
