import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { SaveRoomButton } from "./SaveRoomButton";
import { ShareButton } from "./ShareButton";

interface MobileActionBarProps {
  roomId: string;
  listingSlug: string;
  listingTitle: string;
  price: number;
  onRequestChat: () => void;
}

export const MobileActionBar = ({
  roomId,
  listingSlug,
  listingTitle,
  price,
  onRequestChat
}: MobileActionBarProps) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-elevated animate-slide-in-bottom pb-safe">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Price Display - Compact Inline */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">Τιμή:</span>
            <span className="font-bold text-lg tabular-nums">€{price}</span>
            <span className="text-xs text-muted-foreground">/μήνα</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <SaveRoomButton 
              roomId={roomId}
              className="min-h-[44px] min-w-[44px] shrink-0 touch-manipulation active:scale-95 transition-transform"
            />

            {/* Share Button - Icon Only */}
            <ShareButton 
              listingSlug={listingSlug}
              listingTitle={listingTitle}
              variant="outline"
              size="icon"
              iconOnly={true}
              className="min-h-[44px] min-w-[44px] shrink-0 touch-manipulation active:scale-95 transition-transform"
            />

            {/* Request to Chat Button - Icon Only */}
            <Button 
              onClick={onRequestChat}
              variant="hero"
              size="icon"
              className="min-h-[44px] min-w-[44px] shrink-0 touch-manipulation"
              aria-label="Επικοινωνία με τον ιδιοκτήτη"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
