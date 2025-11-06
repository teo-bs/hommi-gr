import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuickInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
  delay?: number;
}

export const QuickInfoCard = ({ icon: Icon, label, value, className, delay = 0 }: QuickInfoCardProps) => {
  return (
    <Card 
      className={cn(
        "p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
            {label}
          </p>
          <div className="text-sm sm:text-base font-medium text-foreground">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
};
