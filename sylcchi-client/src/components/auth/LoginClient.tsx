"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useSession, useSignIn, useSocialSignIn } from "@/hooks/useAuth";
import { api, toApiError } from "@/lib/api";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const searchParams = useSearchParams();
  const { data: sessionUser, isLoading: sessionLoading } = useSession();

  const nextParam = searchParams.get("next");
  const safeNextPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  useEffect(() => {
    if (!sessionLoading && sessionUser) {
      router.replace(safeNextPath);
    }
  }, [router, safeNextPath, sessionLoading, sessionUser]);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const signInMutation = useSignIn();
  const socialSignInMutation = useSocialSignIn();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  type DemoAccount = { role: string; email: string; password: string };
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[] | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDemoLoading(true);
    api
      .get<{ data: { accounts: DemoAccount[] } }>("/auth/demo-credentials")
      .then((res) => {
        if (!cancelled) setDemoAccounts(res.data?.data?.accounts ?? []);
      })
      .catch((err) => {
        // 404 = demo mode off; just hide the panel silently.
        const message = toApiError(err).message;
        if (!cancelled && !/disabled|not found/i.test(message)) {
          setDemoError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setDemoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fillDemo = (account: DemoAccount) => {
    setGeneralError(null);
    clearErrors();
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  };

  const handleGoogleSignIn = async () => {
    setGeneralError(null);
    try {
      const { url } = await socialSignInMutation.mutateAsync({
        provider: "google",
        callbackURL: window.location.origin,
      });
      window.location.href = url;
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Google sign in failed",
      );
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setGeneralError(null);
    try {
      await signInMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      router.push(safeNextPath);
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
            className="font-semibold text-[#235784] hover:underline dark:text-[#7fb3df]"
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
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={15} /> {generalError}
        </div>
      )}

      {demoAccounts && demoAccounts.length > 0 && (
        <div className="mb-5 rounded-[10px] border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
              Demo
            </span>
            <p className="text-[13px] font-bold text-[#040b11] dark:text-white">
              Try the dashboard with a demo account
            </p>
          </div>
          <p className="mb-3 text-[12px] text-[#5b6770] dark:text-[#9aa5b0]">
            Click a role to autofill the form, then press Sign In.
          </p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="rounded-full border border-amber-300 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#235784] transition hover:border-[#235784] hover:bg-[#235784] hover:text-white dark:border-amber-500/40 dark:bg-[#1a2632] dark:text-[#7fb3df] dark:hover:border-[#7fb3df] dark:hover:bg-[#235784] dark:hover:text-white"
              >
                Use {acc.role} demo
              </button>
            ))}
          </div>
        </div>
      )}
      {demoLoading && !demoAccounts && (
        <div className="mb-5 h-[88px] animate-pulse rounded-[10px] bg-gray-100 dark:bg-[#1a2632]" />
      )}
      {demoError && (
        <div className="mb-4 rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {demoError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11] dark:text-white"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385] dark:text-[#6b7785]"
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
              className={`w-full rounded-[8px] border-2 py-3 pr-4 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors dark:bg-[#0e1820] dark:text-white dark:placeholder:text-[#5a6775] ${
                errors.email
                  ? "border-red-400 bg-red-50/30 dark:border-red-500/50 dark:bg-red-500/10"
                  : "border-[#e0e0e0] focus:border-[#235784] dark:border-[#243443] dark:focus:border-[#7fb3df]"
              }`}
            />
          </div>
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[14px] font-bold text-[#040b11] dark:text-white"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#235784] hover:underline dark:text-[#7fb3df]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385] dark:text-[#6b7785]"
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
              className={`w-full rounded-[8px] border-2 py-3 pr-11 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors dark:bg-[#0e1820] dark:text-white dark:placeholder:text-[#5a6775] ${
                errors.password
                  ? "border-red-400 bg-red-50/30 dark:border-red-500/50 dark:bg-red-500/10"
                  : "border-[#e0e0e0] focus:border-[#235784] dark:border-[#243443] dark:focus:border-[#7fb3df]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#808385] transition-colors hover:text-[#235784] dark:text-[#6b7785] dark:hover:text-[#7fb3df]"
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
                ? "border-[#235784] bg-[#235784] dark:border-[#7fb3df] dark:bg-[#235784]"
                : "border-[#c0cdd6] bg-white dark:border-[#3a4a5a] dark:bg-[#0e1820]"
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
          <span className="text-[14px] text-[#2c3c4a] dark:text-[#cbd2da]">
            Remember me for 30 days
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#3a7eb8] dark:hover:bg-[#4a8ec8]"
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
          <div className="flex-1 border-t border-[#f0f0f0] dark:border-[#243443]" />
          <span className="text-[12px] text-[#c0cdd6] dark:text-[#5a6775]">or continue with</span>
          <div className="flex-1 border-t border-[#f0f0f0] dark:border-[#243443]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={socialSignInMutation.isPending}
          className="flex w-full items-center justify-center gap-2.5 rounded-[8px] border-2 border-[#e0e0e0] py-3 text-[14px] font-semibold text-[#2c3c4a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-[#243443] dark:text-white dark:hover:bg-[#1a2632]"
        >
          {socialSignInMutation.isPending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#808385] dark:text-[#9aa5b0]">
        New to Sylcchi Palace?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#235784] hover:underline dark:text-[#7fb3df]"
        >
          Create a free account
        </Link>
      </p>
    </AuthLayout>
  );
}
