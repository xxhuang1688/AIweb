import { OperatorOrderView } from "@/components/OperatorOrderView";

export default async function OperatorOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <OperatorOrderView orderId={orderId} />;
}
