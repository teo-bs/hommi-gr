import { Button } from "@/components/ui/button";
import { MessageSquare, Zap } from "lucide-react";

interface CTAStackProps {
  onRequestChat: () => void;
}

export const CTAStack = ({ onRequestChat }: CTAStackProps) => {
  return (
    <div className="hidden lg:block space-y-2">
      <Button 
        className="w-full h-14 text-lg" 
        variant="hero"
        onClick={onRequestChat}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Επικοινωνία
      </Button>
    </div>
  );
};