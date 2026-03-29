"use client";

import { api, toApiError } from "@/lib/api";
import { CheckCircle, ClipboardCheck, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Step = "lookup" | "otp" | "complete" | "done";

function CheckinPageContent() {
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") ?? "";

  const [step, setStep] = useState<Step>("lookup");
  const [bookingCode, setBookingCode] = useState(prefillCode);
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [checkinToken, setCheckinToken] = useState("");
  const [bookingInfo, setBookingInfo] = useState<Record<string, unknown> | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillCode) setBookingCode(prefillCode);
  }, [prefillCode]);

  // Step 1: Lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/checkin/lookup", {
        bookingCode,
        email: identity,
      });
      setStep("otp");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/checkin/verify-otp", {
        bookingCode,
        email: identity,
        otp,
      });
      const data = res.data?.data;
      setCheckinToken(data?.checkinToken ?? "");
      setBookingInfo(data?.booking ?? null);
      setStep("complete");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/checkin/complete", {
        checkinToken,
        notes: notes || undefined,
      });
      setStep("done");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white">
      <div className="mx-auto max-w-lg px-4 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#235784]">
            <ClipboardCheck size={28} className="text-white" />
          </div>
          <h1
            className="text-3xl text-[#040b11] mb-2"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Online Check-in
          </h1>
          <p className="text-[15px] text-[#808385]">
            Check in before you arrive for a smoother experience
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {["Verify", "OTP", "Complete"].map((label, i) => {
            const steps: Step[] = ["lookup", "otp", "complete", "done"];
            const currentIdx = steps.indexOf(step);
            const isActive = i <= currentIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#235784] text-white shadow-md"
                      : "bg-[#e8edf2] text-[#808385]"
                  }`}
                >
                  {step === "done" && i <= 2 ? (
                    <CheckCircle size={14} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-sm ${isActive ? "font-semibold text-[#040b11]" : "text-[#808385]"}`}
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    className={`h-px w-8 ${isActive ? "bg-[#235784]" : "bg-[#e8edf2]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Lookup */}
        {step === "lookup" && (
          <div className="rounded-2xl border border-[#e8edf2] bg-white p-6 shadow-sm">
            <h2
              className="text-lg text-[#040b11] mb-1"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              Verify Your Booking
            </h2>
            <p className="text-[13px] text-[#808385] mb-5">
              Enter your booking code and the email used when booking. We'll
              send a verification code.
            </p>
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label
                  className="mb-1 block text-[13px] font-semibold text-[#040b11]"
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  Booking Code
                </label>
                <input
                  type="text"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="e.g. BK-ABC123"
                  required
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm text-[#040b11] placeholder-[#b0b0b0] outline-none transition-colors focus:border-[#235784]"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-[13px] font-semibold text-[#040b11]"
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="guest@email.com"
                  required
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm text-[#040b11] placeholder-[#b0b0b0] outline-none transition-colors focus:border-[#235784]"
                />
              </div>
              {error && (
                <p className="text-[13px] text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#235784] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a4a6d] disabled:opacity-50"
                style={{ fontFamily: "Mulish, sans-serif" }}
              >
                {loading ? (
                  <Loader2 size={16} className="mx-auto animate-spin" />
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <div className="rounded-2xl border border-[#e8edf2] bg-white p-6 shadow-sm">
            <h2
              className="text-lg text-[#040b11] mb-1"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              Enter Verification Code
            </h2>
            <p className="text-[13px] text-[#808385] mb-5">
              We've sent a 6-digit code to <strong>{identity}</strong>.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label
                  className="mb-1 block text-[13px] font-semibold text-[#040b11]"
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-center text-lg font-mono tracking-widest text-[#040b11] outline-none transition-colors focus:border-[#235784]"
                />
              </div>
              {error && (
                <p className="text-[13px] text-red-500">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("lookup");
                    setError("");
                  }}
                  className="flex-1 rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm font-semibold text-[#808385] transition-colors hover:bg-[#f8fafc]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#235784] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a4a6d] disabled:opacity-50"
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  {loading ? (
                    <Loader2 size={16} className="mx-auto animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === "complete" && (
          <div className="space-y-4">
            {/* Booking summary */}
            {bookingInfo && (
              <div className="rounded-2xl border border-[#e8edf2] bg-white p-5">
                <p
                  className="text-[13px] uppercase tracking-wider text-[#808385] mb-3"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
                >
                  Your Booking
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[#808385] text-xs">Room</p>
                    <p className="font-semibold text-[#040b11]">
                      {(bookingInfo.room as { name?: string })?.name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#808385] text-xs">Total</p>
                    <p className="font-semibold text-[#040b11]">
                      ${Number(bookingInfo.total ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#808385] text-xs">Paid</p>
                    <p className="font-semibold text-emerald-600">
                      ${Number(bookingInfo.paid ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#808385] text-xs">Due</p>
                    <p
                      className={`font-semibold ${Number(bookingInfo.due ?? 0) > 0 ? "text-red-500" : "text-[#808385]"}`}
                    >
                      ${Number(bookingInfo.due ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[#e8edf2] bg-white p-6 shadow-sm">
              <h2
                className="text-lg text-[#040b11] mb-1"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Complete Check-in
              </h2>
              <p className="text-[13px] text-[#808385] mb-5">
                You're verified. Add any notes and complete your check-in.
              </p>
              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label
                    className="mb-1 block text-[13px] font-semibold text-[#040b11]"
                    style={{ fontFamily: "Mulish, sans-serif" }}
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requests, early arrival, etc."
                    rows={3}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm text-[#040b11] placeholder-[#b0b0b0] outline-none transition-colors focus:border-[#235784] resize-none"
                  />
                </div>
                {error && (
                  <p className="text-[13px] text-red-500">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#235784] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a4a6d] disabled:opacity-50"
                  style={{ fontFamily: "Mulish, sans-serif" }}
                >
                  {loading ? (
                    <Loader2 size={16} className="mx-auto animate-spin" />
                  ) : (
                    "Complete Check-in"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="rounded-2xl border border-[#e8edf2] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2
              className="text-xl text-[#040b11] mb-2"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
            >
              You're Checked In!
            </h2>
            <p className="text-[14px] text-[#808385] mb-6">
              Your online check-in is complete. Show this confirmation at the
              front desk when you arrive.
            </p>
            <div className="inline-block rounded-xl bg-[#f0f5fa] px-6 py-3 mb-6">
              <p className="text-xs text-[#808385] mb-1">Booking Code</p>
              <p
                className="text-xl text-[#235784] font-mono"
                style={{ fontWeight: 800 }}
              >
                {bookingCode}
              </p>
            </div>
            <div>
              <a
                href="/profile?tab=bookings"
                className="inline-block rounded-lg bg-[#235784] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a4a6d]"
                style={{ fontFamily: "Mulish, sans-serif" }}
              >
                View My Bookings
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#235784]" />
        </div>
      }
    >
      <CheckinPageContent />
    </Suspense>
  );
}
