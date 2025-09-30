import { Badge } from "@/components/ui/badge";
import { FileEdit, Upload, UserCheck } from "lucide-react";

interface DataProvenanceLabelProps {
  source: 'onboarding' | 'listing' | 'manual' | 'verified';
  date?: string;
}

export const DataProvenanceLabel = ({ source, date }: DataProvenanceLabelProps) => {
  const getSourceInfo = () => {
    switch (source) {
      case 'onboarding':
        return { icon: UserCheck, label: 'Από onboarding', variant: 'secondary' as const };
      case 'listing':
        return { icon: Upload, label: 'Από αγγελία', variant: 'outline' as const };
      case 'manual':
        return { icon: FileEdit, label: 'Χειροκίνητα', variant: 'outline' as const };
      case 'verified':
        return { icon: UserCheck, label: 'Επαληθευμένο', variant: 'default' as const };
      default:
        return { icon: FileEdit, label: 'Άγνωστο', variant: 'outline' as const };
    }
  };

  const { icon: Icon, label, variant } = getSourceInfo();

  return (
    <Badge variant={variant} className="text-xs gap-1">
      <Icon className="h-3 w-3" />
      {label}
      {date && <span className="ml-1 opacity-70">· {new Date(date).toLocaleDateString('el-GR')}</span>}
    </Badge>
  );
};
