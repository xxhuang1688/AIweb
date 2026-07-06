import { NextResponse } from "next/server";
import { readManualPaymentOrder } from "@/lib/manualPaymentStorage";

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext<"/api/order-status/[orderId]">) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  try {
    const { orderId } = await context.params;
    const order = await readManualPaymentOrder(orderId);

    if (token !== order.customerToken) {
      return NextResponse.json({
        status: "unauthorized",
        errors: ["注文情報を確認できません。"],
        order: null,
      }, { status: 401 });
    }

    const confirmed = order.status === "confirmed";

    return NextResponse.json({
      status: confirmed ? "confirmed" : "pending",
      errors: [],
      order: {
        orderId: order.orderId,
        companyName: order.companyName,
        amountJpy: order.amountJpy,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt ?? null,
        fileCount: order.files.length,
        downloadUrl: confirmed ? `${url.origin}${order.downloadUrl}` : null,
        accessCode: confirmed ? order.accessCode : null,
      },
    });
  } catch {
    return NextResponse.json({
      status: "not_found",
      errors: ["注文情報が見つかりません。"],
      order: null,
    }, { status: 404 });
  }
}
