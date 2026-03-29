"use client";

import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

const statusMap: Record<string, StatusVariant> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "danger",
  PAID: "success",
  PARTIAL: "info",
  NONE: "neutral",
  COMPLETED: "success",
  CHECKED_IN: "success",
  CHECKED_OUT: "neutral",
  SUCCESS: "success",
  FAILED: "danger",
  AVAILABLE: "success",
  UNAVAILABLE: "danger",
  ADMIN: "info",
  MANAGER: "warning",
  CUSTOMER: "neutral",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-slate-100 text-slate-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusMap[status] ?? "neutral";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        variantStyles[variant],
        className,
      )}
    >
      {label.toLowerCase()}
    </span>
  );
}
