"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useSignIn } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

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

export default function LoginClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const signInMutation = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setGeneralError(null);
    try {
      await signInMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      router.push("/");
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Sign in failed",
      );
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#235784] hover:underline"
          >
            Create one free
          </Link>
        </>
      }
      icon={<LogIn size={22} />}
      quote="Welcome back! Your favourite room awaits."
      quoteAuthor="Sylcchi Palace"
    >
      {generalError && (
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} /> {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="login-email"
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
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              {...register("email", {
                onChange: () => {
                  clearErrors("email");
                  setGeneralError(null);
                },
              })}
              className={`w-full rounded-[8px] border-2 py-3 pr-4 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors ${
                errors.email
                  ? "border-red-400 bg-red-50/30"
                  : "border-[#e0e0e0] focus:border-[#235784]"
              }`}
            />
          </div>
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[14px] font-bold text-[#040b11]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#235784] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password", {
                onChange: () => {
                  clearErrors("password");
                  setGeneralError(null);
                },
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
          <FieldError msg={errors.password?.message} />
        </div>

        <label className="flex cursor-pointer items-center gap-3 select-none">
          <input
            type="checkbox"
            className="sr-only"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
              remember
                ? "border-[#235784] bg-[#235784]"
                : "border-[#c0cdd6] bg-white"
            }`}
          >
            {remember && (
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="text-[14px] text-[#2c3c4a]">
            Remember me for 30 days
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <LogIn size={16} />
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-[#f0f0f0]" />
          <span className="text-[12px] text-[#c0cdd6]">or continue with</span>
          <div className="flex-1 border-t border-[#f0f0f0]" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled
            title="Google login will be enabled when API integration is added"
            className="flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#e0e0e0] py-3 text-[14px] font-semibold text-[#9aa7b4] opacity-70"
          >
            Google
          </button>
          <button
            type="button"
            disabled
            title="Microsoft login will be enabled when API integration is added"
            className="flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#e0e0e0] py-3 text-[14px] font-semibold text-[#9aa7b4] opacity-70"
          >
            Microsoft
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#808385]">
        New to Sylcchi Palace?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#235784] hover:underline"
        >
          Create a free account
        </Link>
      </p>
    </AuthLayout>
  );
}
