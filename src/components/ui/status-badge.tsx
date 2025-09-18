import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "draft" | "active" | "archived";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    draft: "bg-status-draft/10 text-status-draft border-status-draft/20",
    active: "bg-status-active/10 text-status-active border-status-active/20",
    archived: "bg-status-archived/10 text-status-archived border-status-archived/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn(variants[status], className)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}