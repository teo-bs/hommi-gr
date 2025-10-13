import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MapPin, Calendar, Euro } from 'lucide-react';

interface ListingQuickViewProps {
  listing: any;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ListingQuickView({ listing, open, onClose, onApprove, onReject }: ListingQuickViewProps) {
  const photos = listing.photos || [];
  const coverPhoto = photos.find((p: any) => p.is_cover) || photos[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{listing.title}</DialogTitle>
          <DialogDescription>
            Αγγελία από {listing.owner?.display_name || 'Unknown'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photos */}
          {coverPhoto && (
            <img
              src={coverPhoto.url}
              alt={listing.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(1, 5).map((photo: any, i: number) => (
                <img
                  key={i}
                  src={photo.url}
                  alt={`Photo ${i + 2}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold">{listing.price_month}€/μήνα</div>
                <div className="text-xs text-muted-foreground">Τιμή</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold">{listing.city}</div>
                <div className="text-xs text-muted-foreground">Περιοχή</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold">
                  {listing.availability_date ? new Date(listing.availability_date).toLocaleDateString('el-GR') : 'Άμεσα'}
                </div>
                <div className="text-xs text-muted-foreground">Διαθεσιμότητα</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Περιγραφή</h4>
            <p className="text-sm text-muted-foreground">{listing.description || 'Χωρίς περιγραφή'}</p>
          </div>

          {/* Details */}
          <div>
            <h4 className="font-semibold mb-2">Λεπτομέρειες</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Τύπος: <span className="font-medium">{listing.property_type || 'room'}</span></div>
              <div>Μέγεθος: <span className="font-medium">{listing.room_size_m2}m²</span></div>
              <div>Όροφος: <span className="font-medium">{listing.floor || '-'}</span></div>
              <div>Συγκάτοικοι: <span className="font-medium">{listing.flatmates_count || 0}</span></div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <h4 className="font-semibold mb-2">Ιδιοκτήτης</h4>
            <div className="flex items-center gap-3">
              {listing.owner?.avatar_url && (
                <img
                  src={listing.owner.avatar_url}
                  alt={listing.owner.display_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{listing.owner?.display_name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{listing.owner?.email}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Κλείσιμο
          </Button>
          {listing.status === 'draft' && (
            <>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={onReject}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Απόρριψη
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Έγκριση
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
