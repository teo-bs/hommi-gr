import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    if (!threadId) return;

    const loadMessages = async () => {
      try {
        console.log('Loading messages for thread:', threadId);
        
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`
            id,
            body,
            sender_id,
            created_at,
            profiles:sender_id (
              display_name,
              avatar_url
            )
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          throw error;
        }

        console.log('Loaded messages:', messagesData);

        const formattedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id,
          content: msg.body,
          sender_id: msg.sender_id,
          sender_name: msg.profiles?.display_name || 'Unknown',
          sender_avatar: msg.profiles?.avatar_url,
          sent_at: msg.created_at,
          is_own: msg.sender_id === profile?.id
        }));

        setMessages(formattedMessages);

        // Reset unread count
        if (profile) {
          const userRole = profile.id === (await getThreadHost()) ? 'host' : 'seeker';
          await supabase.rpc('reset_unread_count', {
            p_thread_id: threadId,
            p_user_role: userRole
          });
        }

      } catch (error) {
        console.error('Failed to load messages:', error);
        toast({
          title: 'Σφάλμα φόρτωσης',
          description: 'Δεν ήταν δυνατή η φόρτωση των μηνυμάτων',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMsg: Message = {
            id: payload.new.id,
            content: payload.new.body,
            sender_id: payload.new.sender_id,
            sender_name: senderProfile?.display_name || 'Unknown',
            sender_avatar: senderProfile?.avatar_url,
            sent_at: payload.new.created_at,
            is_own: payload.new.sender_id === profile?.id
          };

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, profile, toast]);

  // Helper to get thread host
  const getThreadHost = async () => {
    const { data } = await supabase
      .from('threads')
      .select('host_id')
      .eq('id', threadId)
      .single();
    return data?.host_id;
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !profile) return;
    
    setSending(true);
    try {
      console.log('Sending message to thread:', threadId);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: profile.id,
          body: newMessage.trim()
        });
      
      if (error) throw error;
      
      console.log('Message sent successfully');
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Φόρτωση μηνυμάτων...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">Δεν υπάρχουν μηνύματα ακόμα</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.is_own ? 'justify-end' : 'justify-start'}`}
            >
              {!message.is_own && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={message.sender_avatar} />
                  <AvatarFallback>{message.sender_name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col max-w-[70%] ${message.is_own ? 'items-end' : 'items-start'}`}>
                {!message.is_own && (
                  <span className="text-xs text-muted-foreground mb-1">{message.sender_name}</span>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.is_own
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.sent_at)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
