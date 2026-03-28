"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useVerifyOtp } from "@/hooks/useAuth";
import { otpSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type OtpValues = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "register";
  const email = searchParams.get("email") ?? "";
  const [generalError, setGeneralError] = useState<string | null>(null);
  const verifyOtpMutation = useVerifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: OtpValues) => {
    setGeneralError(null);
    try {
      if (mode === "forgot") {
        // Store OTP in sessionStorage for the reset-password page
        sessionStorage.setItem("reset-otp", values.code);
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        return;
      }

      // For register mode: verify OTP to confirm email
      await verifyOtpMutation.mutateAsync({
        email,
        otp: values.code,
      });
      router.push("/login");
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Verification failed",
      );
    }
  };

  return (
    <AuthLayout
      title="Verify your code"
      subtitle={
        email
          ? `Enter the 6-digit code sent to ${email}.`
          : "Enter the 6-digit code we sent to your email."
      }
      icon={<ShieldCheck size={22} />}
      quote="One final step before we get you securely back in."
      quoteAuthor="Sylcchi Palace Security"
    >
      <Link
        href={mode === "forgot" ? "/forgot-password" : "/register"}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#808385] transition-colors hover:text-[#235784]"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {generalError && (
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} /> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="otp-code"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            Verification code
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            {...register("code", {
              onChange: (event) => {
                event.target.value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);
                clearErrors("code");
              },
            })}
            className={`w-full rounded-[8px] border-2 px-4 py-3 text-center font-mulish text-2xl tracking-[0.45em] text-[#2c3c4a] outline-none transition-colors ${
              errors.code
                ? "border-red-400 bg-red-50/30"
                : "border-[#e0e0e0] focus:border-[#235784]"
            }`}
          />
          {errors.code?.message && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500">
              <AlertCircle size={11} /> {errors.code.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Verifying...
            </>
          ) : (
            <>
              Verify Code <CheckCircle2 size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyOtpClient() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}
