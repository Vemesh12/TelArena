"use client";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "angular" | "standard" | "cyan";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ variant = "angular", children, className, onClick, hover = false }: CardProps) {
  const variantClass =
    variant === "angular" ? "card-angular" :
    variant === "cyan" ? "card-angular-cyan" :
    "bg-bg-card rounded-lg border border-white/5";

  return (
    <div
      onClick={onClick}
      className={cn(
        variantClass,
        "p-5",
        hover && "cursor-pointer transition-transform duration-200 hover:-translate-y-1",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h3 className="font-display font-bold text-text-primary uppercase tracking-wide text-sm">{title}</h3>
        {subtitle && <p className="text-text-secondary text-xs mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
