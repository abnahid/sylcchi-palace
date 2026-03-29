"use client";

import { verifyStripePayment } from "@/lib/api/booking";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId") ?? "";
  const sessionId = searchParams.get("session_id") ?? "";
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    async function verify() {
      // If we have a Stripe session_id, verify the payment server-side
      if (sessionId) {
        try {
          await verifyStripePayment(sessionId);
        } catch {
          // Verification may fail if webhook already processed it — that's OK
        }
      }

      const resolvedId = bookingId || sessionId;
      if (resolvedId) {
        router.replace(
          `/booking/confirmation?bookingId=${encodeURIComponent(resolvedId)}`,
        );
      } else {
        router.replace("/booking/confirmation");
      }
    }

    verify();
  }, [bookingId, sessionId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fafd]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#235784]" />
        <p className="text-sm text-[#808385]">Verifying your payment...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#235784]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
