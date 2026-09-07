import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { PAGE_CONTAINER_CLASS, READABLE_CONTAINER_CLASS } from "@/lib/layout";

export function PageShell({
  children,
  tone = "white",
  readable = false,
  className,
}: {
  children: ReactNode;
  tone?: "white" | "muted";
  readable?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-h-[70vh] py-14 sm:py-20 lg:py-24",
        tone === "muted" ? "bg-dg-canvas" : "bg-white",
        className,
      )}
    >
      <div className={readable ? READABLE_CONTAINER_CLASS : PAGE_CONTAINER_CLASS}>
        {children}
      </div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  kicker,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  kicker?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {kicker && <p className="dg-kicker mb-4">{kicker}</p>}
        <h1 className="dg-page-title">{title}</h1>
        {description && (
          <div className="mt-4 max-w-2xl text-sm leading-7 text-dg-muted sm:text-base">
            {description}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-14",
        className,
      )}
    >
      <div className="max-w-2xl">
        <h2 className="dg-section-title">{title}</h2>
        {description && (
          <div className="mt-4 text-sm leading-7 text-dg-muted sm:text-base">
            {description}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Surface({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  return (
    <Tag className={cn("border border-dg-line bg-white", className)}>
      {children}
    </Tag>
  );
}

export const fieldClassName =
  "w-full rounded-lg border border-dg-line bg-white px-3.5 py-2.5 text-sm text-dg-ink placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

export function TextField({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className="text-sm font-semibold text-dg-ink">{label}</span>}
      <input className={cn(fieldClassName, className)} {...props} />
      {hint && <span className="text-xs text-dg-muted">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className="text-sm font-semibold text-dg-ink">{label}</span>}
      <textarea
        className={cn(fieldClassName, "min-h-28 resize-y", className)}
        {...props}
      />
      {hint && <span className="text-xs text-dg-muted">{hint}</span>}
    </label>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-y border-dg-line px-4 py-20 text-center",
        className,
      )}
    >
      <p className="font-semibold text-dg-ink">{title}</p>
      {description && <p className="mt-2 text-sm text-dg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-800",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-800",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
