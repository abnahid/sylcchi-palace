"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setGeneralError(null);
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email });
      setSentEmail(values.email);
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Failed to send reset code",
      );
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we will send a verification code."
      icon={<KeyRound size={22} />}
      quote="Forgot your password? No worries, we will get you back in moments."
      quoteAuthor="Sylcchi Palace Support"
    >
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#808385] transition-colors hover:text-[#235784]"
      >
        <ArrowLeft size={14} /> Back to Sign In
      </Link>

      {generalError && (
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} /> {generalError}
        </div>
      )}

      {sentEmail ? (
        <div>
          <div className="mb-6 flex items-start gap-4 rounded-[12px] border border-green-200 bg-green-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="mb-1 text-[15px] font-bold text-[#040b11]">
                Reset code sent
              </p>
              <p className="text-[13px] leading-[1.6] text-[#5f6d79]">
                We sent a 6-digit code to{" "}
                <strong className="text-[#2c3c4a]">{sentEmail}</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/verify-otp?mode=forgot&email=${encodeURIComponent(sentEmail)}`,
              )
            }
            className="w-full rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d]"
          >
            Enter Verification Code
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="forgot-email"
              className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
              />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                {...register("email", { onChange: () => clearErrors("email") })}
                className={`w-full rounded-[8px] border-2 py-3 pr-4 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors ${
                  errors.email
                    ? "border-red-400 bg-red-50/30"
                    : "border-[#e0e0e0] focus:border-[#235784]"
                }`}
              />
            </div>
            {errors.email?.message && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500">
                <AlertCircle size={11} /> {errors.email.message}
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
                <Loader2 size={17} className="animate-spin" /> Sending code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
