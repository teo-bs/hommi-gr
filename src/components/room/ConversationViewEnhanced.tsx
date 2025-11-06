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
import { useTourRequests } from "@/hooks/useTourRequests";
import { QuickActions } from "@/components/messaging/QuickActions";
import { TypingIndicator } from "@/components/messaging/TypingIndicator";
import { ReadReceipt } from "@/components/messaging/ReadReceipt";
import { ListingCardMini } from "@/components/messaging/ListingCardMini";
import { PhotoUploader } from "@/components/messaging/PhotoUploader";
import { MessageAttachment } from "@/components/messaging/MessageAttachment";
import { TemplateSelector } from "@/components/messaging/TemplateSelector";
import { TourScheduler } from "@/components/messaging/TourScheduler";
import { TourRequestCard } from "@/components/messaging/TourRequestCard";
import { ReactionPicker } from "@/components/messaging/ReactionPicker";
import { VoiceRecorder } from "@/components/messaging/VoiceRecorder";
import { MessageWithReactions } from "@/components/messaging/MessageWithReactions";
import { ResponseTimeBadge } from "@/components/messaging/ResponseTimeBadge";
import { MessageSearch } from "@/components/messaging/MessageSearch";
import { BlockReportMenu } from "@/components/messaging/BlockReportMenu";

interface ConversationViewEnhancedProps {
  threadId: string;
  listingId: string;
  listingTitle: string;
  listingCoverImage?: string;
  listingPrice: number;
  listingCity?: string;
  listingNeighborhood?: string;
  listingAvailableFrom?: string;
  listerName: string;
  listerAvatar?: string;
  listerVerifications?: any;
  listerResponseTime?: number | null;
  listerUserId?: string;
  isHost?: boolean;
  onClose: () => void;
}

export const ConversationViewEnhanced = ({
  threadId,
  listingId,
  listingTitle,
  listingCoverImage,
  listingPrice,
  listingCity,
  listingNeighborhood,
  listingAvailableFrom,
  listerName,
  listerAvatar,
  listerVerifications,
  listerResponseTime,
  listerUserId,
  isHost = false,
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
  const { tours } = useTourRequests(threadId);


  const handleSend = async (messageContent?: string) => {
    const content = messageContent || newMessage.trim();
    if (!content || !profile || sending) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: profile.id,
          body: content
        });
      
      if (error) throw error;
      
      if (!messageContent) {
        setNewMessage('');
      }
      
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
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{listerName}</p>
            <ResponseTimeBadge avgResponseTimeMinutes={listerResponseTime} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <MessageSearch threadId={threadId} />
          {listerUserId && (
            <BlockReportMenu
              userId={listerUserId}
              userName={listerName}
              threadId={threadId}
              onBlock={onClose}
            />
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* Listing Card */}
        <ListingCardMini
          listingId={listingId}
          title={listingTitle}
          coverImage={listingCoverImage}
          price={listingPrice}
          city={listingCity}
          neighborhood={listingNeighborhood}
          availableFrom={listingAvailableFrom}
        />
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
              const isVoiceMessage = message.body?.startsWith('voice:');
              const voiceUrl = isVoiceMessage ? message.body.replace('voice:', '') : null;
              
              return (
                <MessageWithReactions
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  voiceUrl={voiceUrl}
                />
              );
            })}
            
            {/* Tour requests */}
            {tours.filter(t => t.status === 'pending' || t.status === 'confirmed').map((tour) => (
              <TourRequestCard
                key={tour.id}
                tour={tour}
                isHost={isHost}
              />
            ))}

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
      <div className="border-t">
        {/* Quick Actions & Tools */}
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-1">
            <PhotoUploader
              onPhotoSent={(url) => {
                // Send message with photo attachment
                setNewMessage(`📷 [Φωτογραφία]`);
              }}
              disabled={sending}
            />
            <TemplateSelector
              onSelect={(content) => setNewMessage(content)}
              disabled={sending}
            />
          </div>
          
          <TourScheduler
            threadId={threadId}
            listingId={listingId}
            disabled={sending}
          />
        </div>

        {showQuickActions && messages.length === 0 && (
          <div className="px-4 pt-3">
            <QuickActions 
              onActionClick={handleQuickAction}
              listingTitle={listingTitle}
            />
          </div>
        )}
        
        <div className="p-4">
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
              onClick={() => handleSend()}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
