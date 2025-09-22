import { Button } from "@/components/ui/button";
import { MessageSquare, Zap } from "lucide-react";

interface CTAStackProps {
  onRequestChat: () => void;
}

export const CTAStack = ({ onRequestChat }: CTAStackProps) => {
  return (
    <div className="space-y-2">
      <Button 
        className="w-full h-12 text-base font-semibold" 
        variant="hero"
        onClick={onRequestChat}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Request to chat
      </Button>
      
      <Button 
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-warning to-yellow-500 hover:from-warning/90 hover:to-yellow-500/90 text-foreground border-2 border-warning/20" 
        variant="secondary"
        onClick={() => console.log('fast_track_clicked')}
      >
        <Zap className="h-5 w-5 mr-2" />
        Fast-Track
      </Button>
    </div>
  );
};