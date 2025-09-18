import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: "major" | "minor" | "capstone";
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const variants = {
    major: "bg-category-major text-white border-category-major",
    minor: "bg-category-minor text-white border-category-minor",
    capstone: "bg-category-capstone text-white border-category-capstone",
  };

  return (
    <Badge
      className={cn(variants[category], className)}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}