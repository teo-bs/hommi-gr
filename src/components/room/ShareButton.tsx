import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ShareButtonProps {
  listingSlug: string;
  listingTitle: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ShareButton = ({ 
  listingSlug, 
  listingTitle,
  variant = 'outline',
  size = 'sm',
  className
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/listing/${listingSlug}?utm_source=share&utm_medium=web&utm_campaign=listing_share`;
  
  const handleShare = async () => {
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: listingTitle,
          text: `Δες αυτό το δωμάτιο: ${listingTitle}`,
          url: shareUrl
        });
        
        console.log('share_success', { 
          method: 'native',
          listing_slug: listingSlug 
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        console.log('share_success', { 
          method: 'copy',
          listing_slug: listingSlug 
        });
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Αντιγράφηκε!
        </>
      ) : navigator.share ? (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Κοινοποίηση
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Αντιγραφή συνδέσμου
        </>
      )}
    </Button>
  );
};
