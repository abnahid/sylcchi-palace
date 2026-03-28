"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { useRequestOtp, useSignUp } from "@/hooks/useAuth";
import { getPasswordStrength, registerSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof registerSchema>;

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

function GeneralError({ msg }: { msg: string | null }) {
  if (!msg) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
      <AlertCircle size={15} /> {msg}
    </div>
  );
}

export default function RegisterClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const signUpMutation = useSignUp();
  const requestOtpMutation = useRequestOtp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const password = watch("password");
  const confirm = watch("confirmPassword");
  const agree = watch("agree") === true;
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: RegisterFormValues) => {
    setGeneralError(null);
    try {
      await signUpMutation.mutateAsync({
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        password: values.password,
      });
      await requestOtpMutation.mutateAsync({
        email: values.email,
        type: "email-verification",
      });
      router.push(
        `/verify-otp?mode=register&email=${encodeURIComponent(values.email)}`,
      );
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#235784] hover:underline"
          >
            Sign in
          </Link>
        </>
      }
      icon={<UserPlus size={22} />}
      quote="Join travellers who trust Sylcchi Palace as their home away from home."
      quoteAuthor="Sylcchi Palace Community"
    >
      <GeneralError msg={generalError} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-first"
              className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
            >
              First name
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
              />
              <input
                id="reg-first"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                {...register("firstName", {
                  onChange: () => clearErrors("firstName"),
                })}
                className={`w-full rounded-[8px] border-2 py-3 pr-3 pl-9 text-[14px] text-[#2c3c4a] outline-none transition-colors ${
                  errors.firstName
                    ? "border-red-400 bg-red-50/30"
                    : "border-[#e0e0e0] focus:border-[#235784]"
                }`}
              />
            </div>
            <FieldError msg={errors.firstName?.message} />
          </div>

          <div>
            <label
              htmlFor="reg-last"
              className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
            >
              Last name
            </label>
            <input
              id="reg-last"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              {...register("lastName", {
                onChange: () => clearErrors("lastName"),
              })}
              className={`w-full rounded-[8px] border-2 px-3 py-3 text-[14px] text-[#2c3c4a] outline-none transition-colors ${
                errors.lastName
                  ? "border-red-400 bg-red-50/30"
                  : "border-[#e0e0e0] focus:border-[#235784]"
              }`}
            />
            <FieldError msg={errors.lastName?.message} />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="reg-email"
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
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <label
            htmlFor="reg-password"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
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
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
            htmlFor="reg-confirm"
            className="mb-1.5 block text-[14px] font-bold text-[#040b11]"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#808385]"
            />
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register("confirmPassword", {
                onChange: () => clearErrors("confirmPassword"),
              })}
              className={`w-full rounded-[8px] border-2 py-3 pr-11 pl-10 text-[15px] text-[#2c3c4a] outline-none transition-colors ${
                errors.confirmPassword
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
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            {confirm && password === confirm && (
              <CheckCircle
                size={15}
                className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 text-green-500"
              />
            )}
          </div>
          <FieldError msg={errors.confirmPassword?.message} />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="sr-only"
              checked={agree}
              onChange={(event) => {
                setValue("agree", event.target.checked, {
                  shouldValidate: true,
                });
                clearErrors("agree");
              }}
            />
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[4px] border-2 transition-all ${
                agree
                  ? "border-[#235784] bg-[#235784]"
                  : errors.agree
                    ? "border-red-400"
                    : "border-[#c0cdd6] bg-white"
              }`}
            >
              {agree && (
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
            <span className="text-[13px] leading-[1.6] text-[#2c3c4a]">
              I agree to the terms and privacy policy.
            </span>
          </label>
          <FieldError msg={errors.agree?.message} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#235784] py-3.5 text-[15px] font-extrabold text-white transition-all hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Create Account <UserPlus size={16} />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[#808385]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#235784] hover:underline"
        >
          Sign in to your account
        </Link>
      </p>
    </AuthLayout>
  );
}
