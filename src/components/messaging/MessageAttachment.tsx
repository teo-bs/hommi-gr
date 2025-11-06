import { useState } from "react";
import { PhotoLightbox } from "@/components/room/PhotoLightbox";

interface MessageAttachmentProps {
  url: string;
  type: 'image' | 'document' | 'voice';
  alt?: string;
}

export const MessageAttachment = ({ url, type, alt }: MessageAttachmentProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (type === 'image') {
    return (
      <>
        <img
          src={url}
          alt={alt || 'Attachment'}
          className="max-w-[250px] max-h-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
          onClick={() => setLightboxOpen(true)}
        />
        <PhotoLightbox
          photos={[{ url, alt_text: alt }]}
          initialIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Add handlers for other types (document, voice) later
  return null;
};
