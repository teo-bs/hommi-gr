import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Calendar, Euro, Image, FileText, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface ListingDraft {
  city?: string;
  neighborhood?: string;
  property_size_m2?: number;
  room_size_m2?: number;
  floor?: number;
  has_lift?: boolean;
  bathrooms?: number;
  flatmates_count?: number;
  i_live_here?: boolean;
  amenities_property?: string[];
  amenities_room?: string[];
  house_rules?: string[];
  photos?: string[];
  title?: string;
  description?: string;
  required_verifications?: string[];
  availability_date?: Date;
  availability_to?: Date;
  min_stay_months?: number;
  max_stay_months?: number;
  price_month?: number;
  bills_note?: string;
  [key: string]: any;
}

interface PublishStepReviewProps {
  draft: ListingDraft;
  canPublish: boolean;
  missingFields?: string[];
  onJumpToStep: (step: number) => void;
  onPublish: () => void;
  onPrev: () => void;
  isPublishing?: boolean;
}

export default function PublishStepReview({ 
  draft, 
  canPublish,
  missingFields = [],
  onJumpToStep,
  onPublish, 
  onPrev,
  isPublishing = false
}: PublishStepReviewProps) {

  const totalFlatmates = (draft.flatmates_count || 0) + (draft.i_live_here ? 1 : 0);
  const hasDraftId = !!draft.id;
  const canActuallyPublish = canPublish && hasDraftId;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Είμαστε έτοιμοι, ελέξτε ότι όλα είναι καλά</h2>
        <p className="text-muted-foreground">
          Θα μπορείτε να επεξεργαστείτε τις πληροφορίες αργότερα
        </p>
      </div>

      {/* Save Warning - Critical */}
      {!hasDraftId && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Η αγγελία σας δεν έχει αποθηκευτεί
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-2">
              Παρακαλώ επιστρέψτε στο βήμα 1 και συμπληρώστε τα υποχρεωτικά πεδία (Τίτλος, Πόλη) για να αποθηκευτεί η αγγελία.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onJumpToStep(1)}
              className="mt-2"
            >
              Πήγαινε στο Βήμα 1
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validation Warnings */}
      {!canPublish && hasDraftId && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Λείπουν κάποια στοιχεία
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-destructive">
              {missingFields.map((field, index) => (
                <li key={index}>• {field}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Τοποθεσία
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(1)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Πόλη:</strong> {draft.city || '-'}
            </p>
            <p className="text-sm">
              <strong>Γειτονιά:</strong> {draft.neighborhood || '-'}
            </p>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Ακίνητο & Δωμάτιο
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(2)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Μέγεθος ακινήτου:</strong> {draft.property_size_m2 || '-'} m²
            </p>
            <p className="text-sm">
              <strong>Μέγεθος δωματίου:</strong> {draft.room_size_m2 || '-'} m²
            </p>
            {draft.floor !== undefined && (
              <p className="text-sm">
                <strong>Όροφος:</strong> {draft.floor}
              </p>
            )}
            {totalFlatmates > 0 && (
              <p className="text-sm">
                <strong>Συγκάτοικοι:</strong> {totalFlatmates}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Φωτογραφίες
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(4)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {draft.photos && draft.photos.length > 0 ? (
              <div className="flex gap-2">
                {draft.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
                {draft.photos.length > 3 && (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-sm">
                    +{draft.photos.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Δεν έχουν προστεθεί φωτογραφίες</p>
            )}
          </CardContent>
        </Card>

        {/* Title & Description */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Τίτλος & Περιγραφή
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(5)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold">{draft.title || 'Χωρίς τίτλο'}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {draft.description || 'Χωρίς περιγραφή'}
            </p>
          </CardContent>
        </Card>

        {/* Verifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Απαιτούμενες Επαληθεύσεις
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(6)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {draft.required_verifications && draft.required_verifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draft.required_verifications.map((v) => (
                  <Badge key={v} variant="secondary">
                    {v === 'phone' ? 'Τηλέφωνο' : v === 'email' ? 'Email' : 'Ταυτότητα'}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Δεν απαιτούνται επαληθεύσεις</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Τιμή & Διαθεσιμότητα
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onJumpToStep(7)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Μηνιαίο ενοίκιο:</strong> {draft.price_month ? `${draft.price_month}€` : '-'}
            </p>
            <p className="text-sm">
              <strong>Διαθέσιμο από:</strong>{' '}
              {draft.availability_date 
                ? format(draft.availability_date, 'dd/MM/yyyy', { locale: el })
                : '-'
              }
            </p>
            {draft.min_stay_months && (
              <p className="text-sm">
                <strong>Διάρκεια:</strong> {draft.min_stay_months}-{draft.max_stay_months || '∞'} μήνες
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Amenities Summary */}
      {((draft.amenities_property && draft.amenities_property.length > 0) || 
        (draft.amenities_room && draft.amenities_room.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Ανέσεις</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.amenities_property && draft.amenities_property.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Ακίνητο:</p>
                <div className="flex flex-wrap gap-2">
                  {draft.amenities_property.slice(0, 10).map((amenity) => (
                    <Badge key={amenity} variant="secondary">{amenity}</Badge>
                  ))}
                  {draft.amenities_property.length > 10 && (
                    <Badge variant="outline">+{draft.amenities_property.length - 10}</Badge>
                  )}
                </div>
              </div>
            )}
            {draft.amenities_room && draft.amenities_room.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Δωμάτιο:</p>
                <div className="flex flex-wrap gap-2">
                  {draft.amenities_room.slice(0, 10).map((amenity) => (
                    <Badge key={amenity} variant="secondary">{amenity}</Badge>
                  ))}
                  {draft.amenities_room.length > 10 && (
                    <Badge variant="outline">+{draft.amenities_room.length - 10}</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publish Button */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Έτοιμοι για δημοσίευση!</h3>
              <p className="text-sm text-muted-foreground">
                Μόλις δημοσιευτεί, η καταχώρησή σας θα είναι ορατή σε χιλιάδες αναζητήσεις
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} disabled={isPublishing}>
          Πίσω
        </Button>
        <Button 
          size="lg" 
          onClick={onPublish} 
          disabled={!canActuallyPublish || isPublishing}
          className="min-w-[200px]"
        >
          {isPublishing ? 'Δημοσίευση...' : '🚀 Δημοσίευση'}
        </Button>
      </div>
    </div>
  );
}
