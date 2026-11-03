"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";

interface SessionStatus {
  status: "paid" | "processing" | "failed" | "open" | "expired";
  enrolled: boolean;
  programTitle: string | null;
  programSlug: string | null;
  amountTotal: number;
  currency: string;
}

const ICONS = {
  success: { path: "M5 13l4 4L19 7", color: "bg-green-100 text-green-600" },
  pending: { path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-amber-100 text-amber-600" },
  error: { path: "M6 18L18 6M6 6l12 12", color: "bg-red-100 text-red-600" },
};

function Panel({
  icon,
  title,
  children,
  actions,
}: {
  icon: keyof typeof ICONS;
  title: string;
  children: React.ReactNode;
  actions: { href: string; label: string; primary?: boolean }[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 ${ICONS[icon].color}`}>
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[icon].path} />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-3">{title}</h1>
      <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {actions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className={
              action.primary
                ? "bg-red-600 hover:bg-red-700 text-white font-semibold text-[15px] px-6 py-3 rounded-xl transition-colors"
                : "border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold text-[15px] px-6 py-3 rounded-xl transition-colors"
            }
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Confirmation() {
  const sessionId = useSearchParams().get("session_id");
  const [data, setData] = useState<SessionStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setFailed(true);
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const res = await fetch(`/api/v1/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error(String(res.status));
        const next: SessionStatus = await res.json();
        setData(next);
        // Stripe's webhook usually creates the enrollment within a few seconds of payment
        if (next.status === "paid" && !next.enrolled && ++attempts < 10) {
          timer = setTimeout(load, 3000);
        }
      } catch {
        setFailed(true);
      }
    };

    load();
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (failed) {
    return (
      <Panel
        icon="error"
        title="We couldn't load your payment"
        actions={[{ href: "/orders", label: "View my orders", primary: true }, { href: "/programs", label: "Browse programs" }]}
      >
        <p>If you completed a payment, it's safe. You'll receive an email confirmation, and the purchase will appear in your orders.</p>
      </Panel>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Confirming your payment…</p>
      </div>
    );
  }

  const program = data.programTitle || "your program";
  const programHref = data.programSlug ? `/programs/${data.programSlug}` : "/programs";
  const amount = formatCurrency(data.amountTotal, data.currency, 2);

  if (data.status === "paid") {
    return (
      <Panel
        icon="success"
        title={data.enrolled ? "You're enrolled!" : "Payment received"}
        actions={[{ href: "/my-courses", label: "Go to My Courses", primary: true }, { href: programHref, label: "View program" }]}
      >
        <p>
          Your payment of <strong>{amount}</strong> for <strong>{program}</strong> was successful.
        </p>
        <p>
          {data.enrolled
            ? "Your enrollment is active and you can start learning right away."
            : "We're activating your enrollment. It will appear in My Courses within a minute."}
        </p>
      </Panel>
    );
  }

  if (data.status === "processing") {
    return (
      <Panel
        icon="pending"
        title="Your payment is processing"
        actions={[{ href: "/orders", label: "View payment status", primary: true }, { href: programHref, label: "Back to program" }]}
      >
        <p>
          Thanks! We've received your SEPA Direct Debit authorization of <strong>{amount}</strong> for{" "}
          <strong>{program}</strong>.
        </p>
        <p>
          Bank debits usually take <strong>3–14 business days</strong> to clear. We'll email you as soon as your
          payment is confirmed, and your access will be activated automatically. There's nothing else you need to do.
        </p>
      </Panel>
    );
  }

  if (data.status === "failed") {
    return (
      <Panel
        icon="error"
        title="Your payment didn't go through"
        actions={[{ href: programHref, label: "Try again", primary: true }, { href: "/contact", label: "Contact us" }]}
      >
        <p>
          Your bank couldn't complete the SEPA Direct Debit for <strong>{program}</strong>, so you haven't been
          charged and your enrollment wasn't activated.
        </p>
        <p>You can try again with another bank account or pay by card.</p>
      </Panel>
    );
  }

  return (
    <Panel
      icon="error"
      title="Checkout wasn't completed"
      actions={[{ href: programHref, label: "Back to program", primary: true }]}
    >
      <p>No payment was taken. You can return to the program and start checkout again whenever you're ready.</p>
    </Panel>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16 sm:py-24">
      <div className="max-w-xl mx-auto">
        <Suspense fallback={null}>
          <Confirmation />
        </Suspense>
      </div>
    </main>
  );
}
