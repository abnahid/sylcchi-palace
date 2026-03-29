"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
      <div>
        <h1 className="text-3xl md:text-4xl text-[#1a1a1a] font-semibold tracking-tight font-mulish mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
