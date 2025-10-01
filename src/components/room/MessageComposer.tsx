import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MessageComposerProps {
  roomId: string;
  listingTitle: string;
  onAuthRequired: () => void;
  onMessageSent: (message: string) => void;
}

export const MessageComposer = ({ 
  roomId, 
  listingTitle, 
  onAuthRequired, 
  onMessageSent 
}: MessageComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Load saved draft when component mounts
  useEffect(() => {
    const savedDraft = localStorage.getItem(`message-draft-${roomId}`);
    if (savedDraft) {
      setMessage(savedDraft);
    }
  }, [roomId]);

  // Save draft to localStorage whenever message changes
  useEffect(() => {
    const draftKey = `message-draft-${roomId}`;
    if (message.trim()) {
      localStorage.setItem(draftKey, message);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [message, roomId]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Κενό μήνυμα",
        description: "Παρακαλώ γράψτε ένα μήνυμα πριν το στείλετε",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      onAuthRequired();
      return;
    }

    setSending(true);
    
    try {
      console.log('Sending message via onMessageSent callback');
      
      // Call the parent handler which will create thread and send message
      onMessageSent(message);
      
      // Clear the draft after successful send
      localStorage.removeItem(`message-draft-${roomId}`);
      setMessage("");
      
      toast({
        title: "Μήνυμα στάλθηκε!",
        description: "Το μήνυμά σας στάλθηκε επιτυχώς",
      });
      
      // Analytics
      console.log('message_sent', {
        roomId,
        messageLength: message.length,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Σφάλμα αποστολής",
        description: "Δοκιμάστε ξανά σε λίγο",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Στείλτε μήνυμα</h3>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Για το δωμάτιο: <span className="font-medium">{listingTitle}</span>
      </div>

      <Textarea
        placeholder="Γεια σας! Ενδιαφέρομαι για το δωμάτιο. Μπορούμε να μιλήσουμε;"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        className="min-h-24 resize-none"
        maxLength={500}
      />
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {message.length}/500 χαρακτήρες
          {message.trim() && !user && (
            <span className="ml-2 text-warning">
              • Θα σας ζητηθεί να συνδεθείτε
            </span>
          )}
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={sending || !message.trim()}
          variant="hero"
          size="sm"
        >
          <Send className="h-4 w-4 mr-1" />
          {sending ? "Αποστολή..." : "Αποστολή"}
        </Button>
      </div>
      
      {!user && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          💡 Μπορείτε να γράψετε το μήνυμά σας τώρα. Θα σας ζητηθεί να συνδεθείτε όταν πατήσετε Αποστολή.
        </div>
      )}
    </Card>
  );
};