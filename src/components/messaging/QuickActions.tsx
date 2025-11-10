import { Button } from "@/components/ui/button";
import { Calendar, Clock, Info, ImageIcon } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (template: string) => void;
  listingTitle: string;
}

const QUICK_ACTIONS = [
  {
    id: 'tour',
    icon: Calendar,
    label: 'Κλείσε επίσκεψη',
    template: 'Γεια σου! Θα ήθελα να κλείσω μια επίσκεψη για το "{title}". Ποιες ημερομηνίες είναι διαθέσιμες;'
  },
  {
    id: 'availability',
    icon: Clock,
    label: 'Διαθεσιμότητα',
    template: 'Γεια σου! Είναι ακόμα διαθέσιμο το "{title}";'
  },
  {
    id: 'details',
    icon: Info,
    label: 'Περισσότερα',
    template: 'Γεια σου! Θα ήθελα να μάθω περισσότερες λεπτομέρειες για το "{title}". Τι περιλαμβάνεται στα λογαριασμοί;'
  },
  {
    id: 'photos',
    icon: ImageIcon,
    label: 'Περισσότερες φωτό',
    template: 'Γεια σου! Θα μπορούσες να μου στείλεις περισσότερες φωτογραφίες του "{title}";'
  }
];

export const QuickActions = ({ onActionClick, listingTitle }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 pb-3 pt-1 px-1">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.template.replace('{title}', listingTitle))}
            className="rounded-full text-xs hover:scale-105 transition-transform shadow-sm hover:shadow-md"
          >
            <Icon className="h-3 w-3 mr-1.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
