import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Camera } from "lucide-react";
import { OwnerGalleryActions } from "@/components/owner/OwnerGalleryActions";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";
import { ShareButton } from "@/components/room/ShareButton";

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
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
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

      {/* Gallery grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96">
        {/* Main image */}
        <div 
          className="col-span-2 row-span-2 cursor-pointer relative group overflow-hidden rounded-2xl"
          onClick={() => setCurrentImage(0)}
        >
          <img
            src={displayPhotos[0]?.large_url || displayPhotos[0]?.medium_url || displayPhotos[0]?.url}
            alt={displayPhotos[0]?.alt_text || title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={() => handleImageError(displayPhotos[0]?.url)}
          />
        </div>

        {/* Thumbnail grid */}
        {displayPhotos.slice(1, 5).map((photo, index) => (
          <div
            key={photo.id || index}
            className="cursor-pointer relative group overflow-hidden rounded-xl"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              setCurrentImage(index + 1);
            }}
          >
            <img
              src={photo.thumbnail_url || photo.medium_url || photo.url}
              alt={photo.alt_text || `${title} photo ${index + 2}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => handleImageError(photo.url)}
            />
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
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">
                    See {totalPhotos} photos
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Title and location */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
      </div>
    </div>
  );
};