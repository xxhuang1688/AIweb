import { DownloadOrderView } from "@/components/DownloadOrderView";

export default async function DownloadOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { orderId } = await params;
  const query = await searchParams;
  const code = Array.isArray(query.code) ? query.code[0] : query.code;

  return <DownloadOrderView initialCode={code ?? ""} orderId={orderId} />;
}
