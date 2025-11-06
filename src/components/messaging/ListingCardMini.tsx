import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardMiniProps {
  listingId: string;
  title: string;
  coverImage?: string;
  price: number;
  city?: string;
  neighborhood?: string;
  availableFrom?: string;
}

export const ListingCardMini = ({
  listingId,
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
      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors mb-4"
      onClick={() => navigate(`/listing/${listingId}`)}
    >
      <div className="flex gap-3">
        {/* Cover Image */}
        {coverImage && (
          <img
            src={coverImage}
            alt={title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate mb-1">{title}</h3>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {(city || neighborhood) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{neighborhood || city}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3" />
              <span className="font-semibold text-foreground">{price}€/μήνα</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(availableFrom)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
