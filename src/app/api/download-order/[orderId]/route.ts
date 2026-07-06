import { NextResponse } from "next/server";
import { readManualPaymentOrder } from "@/lib/manualPaymentStorage";

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext<"/api/download-order/[orderId]">) {
  const { orderId } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase() ?? "";

  try {
    const order = await readManualPaymentOrder(orderId);

    if (order.status !== "confirmed") {
      return NextResponse.json({
        status: "pending",
        order: null,
        files: [],
        errors: ["入金確認待ちです。確認完了後にダウンロードできます。"],
      }, { status: 403 });
    }

    if (code !== order.accessCode) {
      return NextResponse.json({
        status: "invalid_code",
        order: null,
        files: [],
        errors: ["認証コードが正しくありません。"],
      }, { status: 403 });
    }

    return NextResponse.json({
      status: "ok",
      order: {
        orderId: order.orderId,
        companyName: order.companyName,
        createdAt: order.createdAt,
        fileCount: order.files.length,
      },
      files: order.files.map((file) => ({
        ...file,
        previewUrl: file.contentType.startsWith("text/html")
          ? `/api/download-order/${encodeURIComponent(order.orderId)}/file/${encodeURIComponent(file.fileName)}?code=${encodeURIComponent(code)}&preview=1`
          : null,
      })),
      errors: [],
    });
  } catch {
    return NextResponse.json({
      status: "not_found",
      order: null,
      files: [],
      errors: ["注文情報が見つかりません。"],
    }, { status: 404 });
  }
}
