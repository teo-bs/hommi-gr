import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardMiniProps {
  listingId: string;
  listingSlug: string;
  title: string;
  coverImage?: string;
  price: number;
  city?: string;
  neighborhood?: string;
  availableFrom?: string;
}

export const ListingCardMini = ({
  listingId,
  listingSlug,
  title,
  coverImage,
  price,
  city,
  neighborhood,
  availableFrom
}: ListingCardMiniProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Άμεσα διαθέσιμο';
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', { month: 'short', year: 'numeric' });
  };

  return (
    <Card 
      className="p-3 sm:p-4 cursor-pointer hover:shadow-md border-2 hover:border-primary/50 transition-all duration-200 bg-card"
      onClick={() => navigate(`/listing/${listingSlug}`)}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Cover Image */}
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 border"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{title}</h3>
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              Προβολή
            </Badge>
          </div>
          
          <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
            {(city || neighborhood) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{neighborhood}{neighborhood && city && ', '}{city}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <Euro className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-semibold text-foreground">{price}€/μήνα</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDate(availableFrom)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
