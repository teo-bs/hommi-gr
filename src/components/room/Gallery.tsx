import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Camera } from "lucide-react";
import { OwnerGalleryActions } from "@/components/owner/OwnerGalleryActions";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";
import { ShareButton } from "@/components/room/ShareButton";
import { PhotoLightbox } from "@/components/room/PhotoLightbox";

interface GalleryProps {
  photos: Array<{
    id?: string;
    url: string;
    alt_text?: string;
    thumbnail_url?: string;
    medium_url?: string;
    large_url?: string;
    is_cover?: boolean;
  }>;
  title: string;
  roomId: string;
  listingSlug: string;
  listingTitle: string;
  flatmatesCount?: number;
  roomType?: string;
  isOwner?: boolean;
  photoType?: 'listing_photos' | 'room_photos';
  parentId?: string; // listing_id or room_id
  onPhotosUpdate?: () => void;
}

export const Gallery = ({ 
  photos, 
  title,
  roomId,
  listingSlug,
  listingTitle,
  flatmatesCount,
  roomType,
  isOwner = false,
  photoType = 'room_photos',
  parentId,
  onPhotosUpdate
}: GalleryProps) => {
  const getRoomTypeLabel = (type?: string) => {
    if (!type) return '';
    const labels: Record<string, string> = {
      'private': 'Ιδιωτικό Δωμάτιο',
      'shared': 'Κοινόχρηστο Δωμάτιο',
      'entire': 'Ολόκληρο Διαμέρισμα'
    };
    return labels[type] || type;
  };
  const [currentImage, setCurrentImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Filter out broken images
  const displayPhotos = photos.filter(photo => !failedImages.has(photo.url));
  const totalPhotos = displayPhotos.length;

  // Empty state if no photos
  if (displayPhotos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="bg-muted rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No photos available</p>
          </div>
        </div>
      </div>
    );
  }

  const handleImageError = async (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
    
    // Log broken photo for lister notification
    const { logBrokenPhoto } = await import('@/lib/log-broken-photo');
    const roomId = window.location.pathname.split('/').pop();
    if (roomId) {
      logBrokenPhoto(roomId, url);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Action buttons - hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground uppercase tracking-wide">
            {roomType && getRoomTypeLabel(roomType)}
            {flatmatesCount && flatmatesCount > 0 && ` • ${flatmatesCount} Συγκάτοικοι`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton 
            listingSlug={listingSlug}
            listingTitle={listingTitle}
            variant="ghost"
            size="sm"
          />
          <SaveRoomButton 
            roomId={roomId}
            variant="ghost"
            size="sm"
            showText
          />
        </div>
      </div>

      {/* Gallery grid - responsive: swipeable carousel on mobile, grid on desktop */}
      <div className="lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:gap-3 lg:h-[500px]">
        {/* Main image - full width carousel on mobile */}
        <div 
          className="lg:col-span-2 lg:row-span-2 cursor-pointer relative group overflow-hidden rounded-xl lg:rounded-2xl aspect-[4/3] lg:aspect-auto lg:h-full shadow-lg hover:shadow-2xl transition-all duration-300"
          onClick={() => {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }}
        >
          <img
            src={displayPhotos[0]?.large_url || displayPhotos[0]?.medium_url || displayPhotos[0]?.url}
            alt={displayPhotos[0]?.alt_text || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => handleImageError(displayPhotos[0]?.url)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Thumbnail grid - hidden on mobile, shown on desktop */}
        {displayPhotos.slice(1, 5).map((photo, index) => (
          <div
            key={photo.id || index}
            className="hidden lg:block cursor-pointer relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              setLightboxIndex(index + 1);
              setLightboxOpen(true);
            }}
          >
            <img
              src={photo.thumbnail_url || photo.medium_url || photo.url}
              alt={photo.alt_text || `${title} photo ${index + 2}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => handleImageError(photo.url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isOwner && photo.id && parentId && onPhotosUpdate && (
              <OwnerGalleryActions
                photoId={photo.id}
                isCover={photo.is_cover || false}
                photoType={photoType}
                parentId={parentId}
                onUpdate={onPhotosUpdate}
              />
            )}
            {index === 3 && totalPhotos > 5 && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-black/80">
                <div className="text-white text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-base font-semibold">
                    Δες όλες τις {totalPhotos} φωτογραφίες
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Room type badge and title - mobile */}
      <div className="lg:hidden space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {roomType && getRoomTypeLabel(roomType)}
          {flatmatesCount && flatmatesCount > 0 && ` • ${flatmatesCount} Συγκάτοικοι`}
        </span>
        <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h1>
      </div>

      {/* Title - desktop */}
      <div className="hidden lg:block">
        <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">{title}</h1>
      </div>

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={displayPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};