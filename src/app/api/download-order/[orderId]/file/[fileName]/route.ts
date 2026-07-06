import { readManualPaymentOrder, readManualPaymentOrderFile } from "@/lib/manualPaymentStorage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: RouteContext<"/api/download-order/[orderId]/file/[fileName]">,
) {
  const { orderId, fileName } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase() ?? "";
  const shouldPreview = url.searchParams.get("preview") === "1";

  try {
    const order = await readManualPaymentOrder(orderId);

    if (order.status !== "confirmed") {
      return Response.json({ errors: ["入金確認待ちです。確認完了後にダウンロードできます。"] }, { status: 403 });
    }

    if (code !== order.accessCode) {
      return Response.json({ errors: ["認証コードが正しくありません。"] }, { status: 403 });
    }

    const file = await readManualPaymentOrderFile(orderId, fileName);

    const isHtml = file.file.contentType.startsWith("text/html");
    const disposition = shouldPreview && isHtml ? "inline" : "attachment";

    return new Response(file.content, {
      headers: {
        "Content-Disposition": `${disposition}; filename="${file.file.fileName}"`,
        "Content-Type": file.file.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ errors: ["ファイルが見つかりません。"] }, { status: 404 });
  }
}
