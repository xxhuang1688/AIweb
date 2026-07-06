import { OrderStatusView } from "@/components/OrderStatusView";

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token = "" } = await searchParams;

  return <OrderStatusView orderId={orderId} token={token} />;
}
