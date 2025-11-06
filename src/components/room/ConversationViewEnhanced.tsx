import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { X, Send, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useThreadMessages } from "@/hooks/useThreadMessages";
import { useToast } from "@/hooks/use-toast";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { QuickActions } from "@/components/messaging/QuickActions";
import { TypingIndicator } from "@/components/messaging/TypingIndicator";
import { ReadReceipt } from "@/components/messaging/ReadReceipt";

interface ConversationViewEnhancedProps {
  threadId: string;
  listingTitle: string;
  listerName: string;
  listerAvatar?: string;
  listerVerifications?: any;
  onClose: () => void;
}

export const ConversationViewEnhanced = ({
  threadId,
  listingTitle,
  listerName,
  listerAvatar,
  listerVerifications,
  onClose
}: ConversationViewEnhancedProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

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

  const { typingUsers, setTyping } = useTypingIndicator(threadId);


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

  const handleQuickAction = (template: string) => {
    setNewMessage(template);
    setShowQuickActions(false);
  };

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.trim()) {
      setTyping(true);
      const timeout = setTimeout(() => setTyping(false), 3000);
      return () => {
        clearTimeout(timeout);
        setTyping(false);
      };
    } else {
      setTyping(false);
    }
  }, [newMessage]);

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh] w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <AvatarWithBadge
            src={listerAvatar}
            alt={listerName}
            fallback={listerName[0]}
            verificationsJson={listerVerifications}
            className="h-10 w-10"
          />
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
          <>
            {messages.map((message: any) => {
              const isOwn = message.sender_id === profile?.id;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} animate-message-slide-in`}
                >
                  {!isOwn && (
                    <AvatarWithBadge
                      src={message.sender?.avatar_url}
                      alt={message.sender?.display_name || 'User'}
                      fallback={message.sender?.display_name?.[0] || 'U'}
                      verificationsJson={message.sender?.verifications_json}
                      className="h-8 w-8 mt-1"
                    />
                  )}
                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <span className="text-xs text-muted-foreground mb-1">
                        {message.sender?.display_name || 'User'}
                      </span>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 transition-all hover:scale-[1.02] ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    </div>
                    {isOwn ? (
                      <ReadReceipt 
                        delivered={!!message.delivered_at}
                        read={!!message.read_at}
                        timestamp={message.created_at}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(message.created_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator userName={typingUsers[0].userName} />
            )}
          </>
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
        {/* Quick Actions */}
        {showQuickActions && messages.length === 0 && (
          <QuickActions 
            onActionClick={handleQuickAction}
            listingTitle={listingTitle}
          />
        )}
        
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
