import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Send, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useThreadMessages } from "@/hooks/useThreadMessages";
import { useToast } from "@/hooks/use-toast";

interface ConversationViewEnhancedProps {
  threadId: string;
  listingTitle: string;
  listerName: string;
  listerAvatar?: string;
  onClose: () => void;
}

export const ConversationViewEnhanced = ({
  threadId,
  listingTitle,
  listerName,
  listerAvatar,
  onClose
}: ConversationViewEnhancedProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const {
    messages,
    isLoading,
    hasMore,
    loadMore,
    scrollRef,
    showNewMessageBadge,
    setShowNewMessageBadge,
    scrollToBottom
  } = useThreadMessages({ threadId });


  const handleSend = async () => {
    if (!newMessage.trim() || !profile || sending) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: profile.id,
          body: newMessage.trim()
        });
      
      if (error) throw error;
      
      setNewMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Σφάλμα αποστολής',
        description: 'Δεν ήταν δυνατή η αποστολή του μηνύματος',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh] w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={listerAvatar} />
            <AvatarFallback>{listerName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{listerName}</p>
            <p className="text-sm text-muted-foreground">{listingTitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {hasMore && (
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Φόρτωση...' : 'Φόρτωση παλαιότερων'}
            </Button>
          </div>
        )}
        
        {isLoading && messages.length === 0 ? (
          <div className="text-center text-muted-foreground">Φόρτωση μηνυμάτων...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">Δεν υπάρχουν μηνύματα ακόμα</div>
        ) : (
          messages.map((message: any) => {
            const isOwn = message.sender_id === profile?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback>{message.sender?.display_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground mb-1">
                      {message.sender?.display_name || 'User'}
                    </span>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* New message badge */}
        {showNewMessageBadge && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                scrollToBottom();
                setShowNewMessageBadge(false);
              }}
              className="shadow-lg"
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              Νέο μήνυμα
            </Button>
          </div>
        )}
      </div>

      {/* Safety Banner */}
      <div className="px-4 py-2 bg-warning/10 border-t border-warning/20">
        <p className="text-xs text-warning-foreground">
          ⚠️ Μείνε στην εφαρμογή. Μην στέλνεις χρήματα εκτός Hommi.
        </p>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Γράψε ένα μήνυμα..."
            className="min-h-[60px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
