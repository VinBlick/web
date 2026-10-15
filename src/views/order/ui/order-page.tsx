"use client";
import { LoaderCircle } from "lucide-react";
import { OrderStatus } from "@/widgets/order-status";
import { Section } from "@/shared/ui/section";
import { useOrderAccess } from "./use-order-access";

export function OrderPage({
  orderId,
  access: accessFromUrl,
  payment,
}: {
  orderId: string;
  access?: string;
  payment?: string;
}) {
  const { access, ready } = useOrderAccess(orderId, accessFromUrl);
  return (
    <Section className="bg-surface">
      <div className="mx-auto max-w-[760px] rounded-xl border border-line bg-white p-6 md:p-10">
        {ready ? (
          <OrderStatus
            orderId={orderId}
            access={access}
            payment={payment}
            reportHref={(order) => `/orders/${order.id}/report`}
          />
        ) : (
          <p role="status" className="flex items-center gap-2 text-muted">
            <LoaderCircle size={18} className="animate-spin" /> Bestellung wird
            geladen …
          </p>
        )}
      </div>
    </Section>
  );
}
