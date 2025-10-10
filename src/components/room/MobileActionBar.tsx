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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-elevated animate-slide-in-bottom">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Price Display */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Τιμή</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-lg tabular-nums">€{price}</span>
              <span className="text-xs text-muted-foreground">/μήνα</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <SaveRoomButton 
              roomId={roomId}
              className="min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
            />

            {/* Share Button Wrapper */}
            <div className="min-h-[44px] min-w-[44px]">
              <ShareButton 
                listingSlug={listingSlug}
                listingTitle={listingTitle}
              />
            </div>

            {/* Request to Chat Button */}
            <Button 
              onClick={onRequestChat}
              className="flex-1 min-h-[44px] touch-manipulation active:scale-95 transition-transform font-semibold"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Επικοινωνία
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
