import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { useTourRequests } from "@/hooks/useTourRequests";
import { useAuth } from "@/hooks/useAuth";

interface TourRequestCardProps {
  tour: {
    id: string;
    thread_id: string;
    requested_by: string;
    requested_time: string;
    status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
    notes?: string;
  };
  isHost: boolean;
}

export const TourRequestCard = ({ tour, isHost }: TourRequestCardProps) => {
  const { updateTourStatus } = useTourRequests(tour.thread_id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = () => {
    const statusMap = {
      pending: { label: 'Εκκρεμεί', variant: 'secondary' as const },
      confirmed: { label: 'Επιβεβαιώθηκε', variant: 'default' as const },
      declined: { label: 'Απορρίφθηκε', variant: 'destructive' as const },
      completed: { label: 'Ολοκληρώθηκε', variant: 'outline' as const },
      cancelled: { label: 'Ακυρώθηκε', variant: 'outline' as const }
    };

    const status = statusMap[tour.status];
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  return (
    <Card className="p-4 bg-accent/30 border-accent">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Αίτημα Επίσκεψης</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(tour.requested_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTime(tour.requested_time)}</span>
        </div>
        {tour.notes && (
          <div className="mt-2 p-2 bg-background rounded text-xs">
            <span className="text-muted-foreground">Σημείωση: </span>
            {tour.notes}
          </div>
        )}
      </div>

      {/* Actions for host */}
      {isHost && tour.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => updateTourStatus(tour.id, 'confirmed')}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Αποδοχή
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateTourStatus(tour.id, 'declined')}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Απόρριψη
          </Button>
        </div>
      )}

      {/* Actions for tenant */}
      {!isHost && tour.status === 'confirmed' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateTourStatus(tour.id, 'completed')}
          className="w-full mt-4"
        >
          Σήμανση ως ολοκληρωμένη
        </Button>
      )}
    </Card>
  );
};
