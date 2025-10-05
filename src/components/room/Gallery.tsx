import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Camera } from "lucide-react";

interface GalleryProps {
  photos: Array<{
    url: string;
    alt_text?: string;
  }>;
  title: string;
}

export const Gallery = ({ photos, title }: GalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Mock photos if none provided
  const mockPhotos = [
    { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", alt_text: "Main room view" },
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", alt_text: "Room detail 1" },
    { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", alt_text: "Room detail 2" },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", alt_text: "Common area" },
    { url: "https://images.unsplash.com/photo-1556909075-f3e64e6b1065?w=800&h=600&fit=crop", alt_text: "Kitchen" }
  ];
  
  // Filter out broken images
  const validPhotos = (photos.length > 0 ? photos : mockPhotos).filter(
    photo => !failedImages.has(photo.url)
  );
  
  const displayPhotos = validPhotos.length > 0 ? validPhotos : mockPhotos;
  const totalPhotos = displayPhotos.length;

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
            Private Room • 2 Flatmates
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
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
            src={displayPhotos[0]?.url}
            alt={displayPhotos[0]?.alt_text || title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={() => handleImageError(displayPhotos[0]?.url)}
          />
        </div>

        {/* Thumbnail grid */}
        {displayPhotos.slice(1, 5).map((photo, index) => (
          <div
            key={index}
            className="cursor-pointer relative group overflow-hidden rounded-xl"
            onClick={() => setCurrentImage(index + 1)}
          >
            <img
              src={photo.url}
              alt={photo.alt_text || `${title} photo ${index + 2}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => handleImageError(photo.url)}
            />
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