import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced";
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const variants = {
    beginner: "bg-difficulty-beginner/10 text-difficulty-beginner border-difficulty-beginner/20",
    intermediate: "bg-difficulty-intermediate/10 text-difficulty-intermediate border-difficulty-intermediate/20",
    advanced: "bg-difficulty-advanced/10 text-difficulty-advanced border-difficulty-advanced/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn(variants[difficulty], className)}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}