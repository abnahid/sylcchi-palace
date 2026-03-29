"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

type ColorTheme = "purple" | "blue" | "orange" | "teal";

const colorMap: Record<ColorTheme, { bg: string; text: string; glow: string }> =
  {
    purple: {
      bg: "bg-[#f5f3ff]",
      text: "text-primary",
      glow: "hover:shadow-[0_8px_30px_-4px_rgba(88,2,247,0.08)]",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      glow: "hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.08)]",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      glow: "hover:shadow-[0_8px_30px_-4px_rgba(249,115,22,0.08)]",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      glow: "hover:shadow-[0_8px_30px_-4px_rgba(13,148,136,0.08)]",
    },
  };

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: ColorTheme;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "purple",
  trend,
  className,
}: StatsCardProps) {
  const theme = colorMap[color];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 group transition-all duration-300",
        theme.glow,
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
            theme.bg,
            theme.text,
          )}
        >
          <Icon icon={icon} width={24} />
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
              trend.positive
                ? "text-emerald-600 bg-emerald-50"
                : "text-rose-600 bg-rose-50",
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
            <Icon
              icon={
                trend.positive
                  ? "solar:arrow-right-up-linear"
                  : "solar:arrow-right-down-linear"
              }
              className="ml-1"
              width={12}
            />
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-[#1a1a1a] text-2xl font-bold font-mulish">{value}</p>
    </div>
  );
}
