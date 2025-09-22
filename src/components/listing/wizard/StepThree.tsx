import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Users, Calendar, Home } from "lucide-react";
import { ListingDraft } from "../ListingWizard";

interface StepThreeProps {
  draft: ListingDraft;
  role: 'individual' | 'agency';
  canPublish: boolean;
  onPublish: () => void;
}

export const StepThree = ({ draft, role, canPublish, onPublish }: StepThreeProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Immediately';
    return new Date(dateStr).toLocaleDateString('el-GR');
  };

  const missingRequiredFields = [];
  if (!draft.title) missingRequiredFields.push('Title');
  if (!draft.city) missingRequiredFields.push('City');
  if (!draft.neighborhood) missingRequiredFields.push('Neighborhood');
  if (!draft.price_month) missingRequiredFields.push('Monthly Price');
  if (!draft.photos.length) missingRequiredFields.push('Photos');

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Review Your Listing</h2>
        <p className="text-muted-foreground">
          Make sure everything looks perfect before publishing
        </p>
      </div>

      {/* Validation Errors */}
      {!canPublish && (
        <Card className="p-4 border-destructive">
          <div className="text-destructive font-medium mb-2">
            Required fields missing:
          </div>
          <ul className="list-disc list-inside text-sm text-destructive">
            {missingRequiredFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Preview Card */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        {draft.photos.length > 0 && (
          <div className="aspect-video bg-muted relative">
            <img
              src={draft.photos[0]}
              alt="Cover photo"
              className="w-full h-full object-cover"
            />
            {draft.photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                +{draft.photos.length - 1} more
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Title and Location */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">{draft.title || 'Untitled Listing'}</h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{draft.neighborhood && draft.city ? `${draft.neighborhood}, ${draft.city}` : 'Location not set'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center mb-4">
            <Euro className="h-5 w-5 text-primary mr-1" />
            <span className="text-2xl font-bold text-primary">
              {draft.price_month || '0'}
            </span>
            <span className="text-muted-foreground ml-1">/month</span>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mb-4">
            {draft.room_type && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Home className="h-4 w-4 mr-1" />
                {draft.room_type.charAt(0).toUpperCase() + draft.room_type.slice(1)}
              </div>
            )}
            
            {draft.flatmates_count !== null && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {draft.flatmates_count} flatmates
              </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Available {formatDate(draft.availability_date)}
            </div>

            {draft.room_size_m2 && (
              <div className="text-sm text-muted-foreground">
                {draft.room_size_m2}m²
              </div>
            )}
          </div>

          {/* Description */}
          {draft.description && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {draft.description}
              </p>
            </div>
          )}

          {/* Amenities Preview */}
          {(draft.amenities_property?.length || draft.amenities_room?.length) && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Amenities</div>
              <div className="flex flex-wrap gap-1">
                {[...(draft.amenities_property || []), ...(draft.amenities_room || [])]
                  .slice(0, 6)
                  .map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                {(draft.amenities_property?.length || 0) + (draft.amenities_room?.length || 0) > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{(draft.amenities_property?.length || 0) + (draft.amenities_room?.length || 0) - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Special Conditions */}
          <div className="flex flex-wrap gap-2">
            {draft.couples_accepted && (
              <Badge variant="outline" className="text-xs">Couples welcome</Badge>
            )}
            {draft.pets_allowed && (
              <Badge variant="outline" className="text-xs">Pets allowed</Badge>
            )}
            {draft.smoking_allowed && (
              <Badge variant="outline" className="text-xs">Smoking allowed</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Bills Note */}
      {draft.bills_note && (
        <Card className="p-4">
          <div className="text-sm font-medium mb-2">Bills & Utilities</div>
          <p className="text-sm text-muted-foreground">{draft.bills_note}</p>
        </Card>
      )}

      {/* Publish Button */}
      <Card className="p-6 text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Ready to Publish?</h3>
          <p className="text-muted-foreground text-sm">
            Your listing will be visible to potential {role === 'individual' ? 'flatmates' : 'tenants'} immediately
          </p>
        </div>

        <Button
          onClick={onPublish}
          disabled={!canPublish}
          size="lg"
          variant="hero"
          className="px-8"
        >
          Publish Listing
        </Button>

        {!canPublish && (
          <p className="text-sm text-muted-foreground mt-2">
            Complete the required fields above to publish
          </p>
        )}
      </Card>
    </div>
  );
};