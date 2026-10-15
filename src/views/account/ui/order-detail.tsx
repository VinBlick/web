"use client";
import Link from "next/link";
import { OrderStatus } from "@/widgets/order-status";
import { AccountShell } from "./account-page";

export function OrderDetail({ id }: { id: string }) {
  return (
    <AccountShell title="Bestellung">
      {() => (
        <div className="space-y-5">
          <div className="rounded-xl bg-white p-6 md:p-10">
            <OrderStatus
              orderId={id}
              access={null}
              reportHref={(order) =>
                order.report
                  ? `/konto/reports/${order.report.id}`
                  : "/konto/reports"
              }
            />
          </div>
          <Link
            href="/konto/bestellungen"
            className="inline-block text-sm text-brand underline"
          >
            ← Zurück zu Bestellungen
          </Link>
        </div>
      )}
    </AccountShell>
  );
}
