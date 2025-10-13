import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
}

export function ImageViewer({ imageUrl }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleFullscreen = () => window.open(imageUrl, '_blank');

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleFullscreen}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="ml-auto text-sm text-muted-foreground flex items-center">
          {Math.round(zoom * 100)}%
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center min-h-[400px]">
        <img
          src={imageUrl}
          alt="Verification document"
          className="max-w-full transition-transform"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  );
}
