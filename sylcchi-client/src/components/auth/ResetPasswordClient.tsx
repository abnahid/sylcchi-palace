"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useResetPassword } from "@/hooks/useAuth";
import { getPasswordStrength, resetPasswordSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) {
    return null;
  }

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const password = watch("password");
  const confirm = watch("confirm");
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: ResetPasswordValues) => {
    setGeneralError(null);
    const otp = sessionStorage.getItem("reset-otp");
    if (!otp) {
      setGeneralError("Verification code expired. Please start over.");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        email,
        otp,
        password: values.password,
      });
      sessionStorage.removeItem("reset-otp");
      setDone(true);
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Password reset failed",
      );
    }
  };

  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password is now secure."
        icon={<CheckCircle size={22} />}
        quote="Your account is protected with your new password."
        quoteAuthor="Sylcchi Palace Security"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#DDEAF6]">
            <CheckCircle size={44} className="text-[#235784]" />
          </div>
          <p className="mb-8 text-[15px] leading-[1.7] text-[#5f6d79]">
            Password updated successfully. You can now sign in with your new
            credentials.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mb-3 w-full rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d]"
          >
            Sign In Now
          </button>
          <Link
            href="/"
            className="text-[13px] text-[#808385] transition-colors hover:text-[#235784]"
          >
            Go to Homepage
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={
        email ? (
          <>
            Creating new password for{" "}
            <strong className="text-[#2c3c4a]">{email}</strong>
          </>
        ) : (
          "Enter and confirm your new password below."
        )
      }
      icon={<ShieldCheck size={22} />}
      quote="Choose a strong password to keep your account secure."
      quoteAuthor="Sylcchi Palace Security"
    >
      {generalError && (
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} /> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="reset-password"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            New password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register("password", {
                onChange: () => clearErrors("password"),
              })}
              className={`w-full rounded-[8px] border-2 py-3 pr-11 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors ${
                errors.password
                  ? "border-red-400 bg-red-50/30"
                  : "border-[#e0e0e0] focus:border-[#235784]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#808385] transition-colors hover:text-[#235784]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="mb-1.5 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i <= strength.score
                          ? strength.colors[strength.score]
                          : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[12px]"
                style={{ color: strength.colors[strength.score] }}
              >
                {strength.labels[strength.score]}
              </p>
            </div>
          )}
          <FieldError msg={errors.password?.message} />
        </div>

        <div>
          <label
            htmlFor="reset-confirm"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              {...register("confirm", {
                onChange: () => clearErrors("confirm"),
              })}
              className={`w-full rounded-[8px] border-2 py-3 pr-11 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors ${
                errors.confirm
                  ? "border-red-400 bg-red-50/30"
                  : "border-[#e0e0e0] focus:border-[#235784]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((value) => !value)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#808385] transition-colors hover:text-[#235784]"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {confirm && password === confirm && (
              <CheckCircle
                size={15}
                className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 text-green-500"
              />
            )}
          </div>
          <FieldError msg={errors.confirm?.message} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Updating
              password...
            </>
          ) : (
            <>
              <ShieldCheck size={16} /> Set New Password
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#808385]">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#235784] hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
