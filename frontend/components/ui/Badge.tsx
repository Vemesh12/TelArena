"use client";
import { cn } from "@/lib/utils";

type BadgeVariant = "live" | "upcoming" | "verified" | "pending" | "rejected" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  live: "badge-live",
  upcoming: "badge-upcoming",
  verified: "badge-verified",
  pending: "badge-pending",
  rejected: "badge-rejected",
  default: "bg-white/10 text-text-secondary border border-white/20",
};

export function Badge({ variant = "default", children, className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-display font-medium tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {pulse && variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-live" />
        </span>
      )}
      {children}
    </span>
  );
}

// Convenience exports
export const LiveBadge = ({ className }: { className?: string }) => (
  <Badge variant="live" pulse className={className}>LIVE</Badge>
);
export const VerifiedBadge = () => <Badge variant="verified">Verified</Badge>;
export const PendingBadge = () => <Badge variant="pending">Pending</Badge>;
export const RejectedBadge = () => <Badge variant="rejected">Rejected</Badge>;
export const UpcomingBadge = () => <Badge variant="upcoming">Upcoming</Badge>;
