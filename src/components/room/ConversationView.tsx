import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sent_at: string;
  is_own: boolean;
}

interface ConversationViewProps {
  roomId: string;
  listingTitle: string;
  listerName: string;
  listerAvatar?: string;
  initialMessage?: string;
  onClose: () => void;
}

export const ConversationView = ({
  roomId,
  listingTitle,
  listerName,
  listerAvatar,
  initialMessage,
  onClose
}: ConversationViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add initial message if provided
    if (initialMessage) {
      const initialMsg: Message = {
        id: 'initial',
        content: initialMessage,
        sender_id: user?.id || '',
        sender_name: user?.email || 'Εσείς',
        sent_at: new Date().toISOString(),
        is_own: true
      };
      setMessages([initialMsg]);
    }
    
    // TODO: Load existing conversation from Supabase
    setLoading(false);
  }, [initialMessage, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    
    try {
      // TODO: Send message via Supabase
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: user.id,
        sender_name: user.email || 'Εσείς',
        sent_at: new Date().toISOString(),
        is_own: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      toast({
        title: "Μήνυμα στάλθηκε!",
        description: "Το μήνυμά σας στάλθηκε επιτυχώς",
      });
      
    } catch (error) {
      toast({
        title: "Σφάλμα αποστολής",
        description: "Δοκιμάστε ξανά σε λίγο",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('el-GR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={listerAvatar} alt={listerName} />
          <AvatarFallback>{listerName?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{listerName}</div>
          <div className="text-xs text-muted-foreground truncate">{listingTitle}</div>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Ενεργό
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Φόρτωση συνομιλίας...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-sm">Ξεκινήστε τη συνομιλία!</div>
            <div className="text-xs mt-1">Το μήνυμά σας θα σταλεί στον ιδιοκτήτη</div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex gap-2 ${message.is_own ? 'justify-end' : 'justify-start'}`}
            >
              {!message.is_own && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={listerAvatar} alt={message.sender_name} />
                  <AvatarFallback className="text-xs">
                    {message.sender_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[70%] ${message.is_own ? 'order-last' : ''}`}>
                <div 
                  className={`p-3 rounded-2xl text-sm ${
                    message.is_own 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${
                  message.is_own ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.sent_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Πληκτρολογήστε το μήνυμά σας..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 min-h-[40px] max-h-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            variant="hero"
            size="sm"
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Πατήστε Cmd+Enter για αποστολή
        </div>
      </div>
    </Card>
  );
};