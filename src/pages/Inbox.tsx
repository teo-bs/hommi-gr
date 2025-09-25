import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConversationView } from "@/components/room/ConversationView";
import { PendingRequests } from "@/components/messaging/PendingRequests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Filter, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Chat {
  id: string;
  listing_title: string;
  lister_name: string;
  lister_avatar?: string;
  status: 'active' | 'booking' | 'ongoing' | 'pending' | 'closed';
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Inbox = () => {
  const { user, profile } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Chat | null>(null);
  const [chatFilter, setChatFilter] = useState<string>("all");
  const [listingFilter, setListingFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const isLister = profile?.role === 'lister';

  useEffect(() => {
    if (user) {
      loadChats();
      loadPendingRequestsCount();
    }
  }, [user]);

  useEffect(() => {
    filterChats();
  }, [chats, chatFilter, listingFilter]);

  const loadChats = async () => {
    try {
      setLoading(true);
      
      // Load accepted threads as chats
      const { data: threads, error } = await supabase
        .from('threads')
        .select(`
          *,
          listings!threads_listing_id_fkey (title, id),
          messages (body, created_at)
        `)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile data for each thread
      const chatData = [];
      for (const thread of threads || []) {
        const isHost = thread.host_id === profile?.id;
        const otherProfileId = isHost ? thread.seeker_id : thread.host_id;
        
        // Get the other user's profile
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', otherProfileId)
          .single();
        
        const lastMessage = thread.messages?.[0];
        
        chatData.push({
          id: thread.id,
          listing_title: thread.listings?.title || 'Unknown Listing',
          lister_name: otherProfile?.display_name || 'Unknown User',
          lister_avatar: otherProfile?.avatar_url,
          status: 'active' as const, // Simplified for MVP
          last_message: lastMessage?.body || 'No messages yet',
          last_message_time: lastMessage?.created_at || thread.created_at,
          unread_count: 0 // Simplified for MVP
        });
      }

      setChats(chatData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequestsCount = async () => {
    try {
      setRequestsLoading(true);
      const { count } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('host_id', profile?.id);
      
      setPendingRequestsCount(count || 0);
    } catch (error) {
      console.error('Error loading pending requests count:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = chats;

    if (chatFilter !== "all") {
      filtered = filtered.filter(chat => chat.status === chatFilter);
    }

    setFilteredChats(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'booking': return 'bg-blue-500';
      case 'ongoing': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-background">
        <ConversationView
          roomId={selectedConversation.id}
          listingTitle={selectedConversation.listing_title}
          listerName={selectedConversation.lister_name}
          listerAvatar={selectedConversation.lister_avatar}
          onClose={() => setSelectedConversation(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Μηνύματα</h1>
      </div>

      {isLister ? (
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Αιτήματα ({pendingRequestsCount})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Συνομιλίες ({filteredChats.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Εκκρεμή Αιτήματα</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">Φόρτωση...</div>
                ) : (
                  <PendingRequests />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chats" className="mt-6">
            <div className="flex items-center gap-4 mb-4">
              <Select value={listingFilter} onValueChange={setListingFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Φίλτρο αγγελίας" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι αγγελίες</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Φόρτωση συνομιλιών...</div>
              ) : filteredChats.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Δεν υπάρχουν συνομιλίες</p>
                  </CardContent>
                </Card>
              ) : (
                filteredChats.map((chat) => (
                  <Card 
                    key={chat.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedConversation(chat)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              {chat.lister_avatar ? (
                                <img 
                                  src={chat.lister_avatar} 
                                  alt={chat.lister_name}
                                  className="w-12 h-12 rounded-full object-cover" 
                                />
                              ) : (
                                <Users className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(chat.status)}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{chat.lister_name}</h3>
                            <p className="text-sm text-muted-foreground">{chat.listing_title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {chat.last_message}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            {chat.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.last_message_time).toLocaleDateString('el-GR')}
                          </p>
                          {chat.unread_count > 0 && (
                            <Badge variant="destructive" className="mt-1">
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Tenant view - only chats with filters
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Select value={chatFilter} onValueChange={setChatFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Φίλτρο κατάστασης" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες</SelectItem>
                <SelectItem value="active">Ενεργές</SelectItem>
                <SelectItem value="booking">Κράτηση</SelectItem>
                <SelectItem value="ongoing">Σε εξέλιξη</SelectItem>
                <SelectItem value="pending">Εκκρεμείς</SelectItem>
                <SelectItem value="closed">Κλειστές</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Φόρτωση συνομιλιών...</div>
            ) : filteredChats.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Δεν υπάρχουν συνομιλίες</p>
                </CardContent>
              </Card>
            ) : (
              filteredChats.map((chat) => (
                <Card 
                  key={chat.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedConversation(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {chat.lister_avatar ? (
                              <img 
                                src={chat.lister_avatar} 
                                alt={chat.lister_name}
                                className="w-12 h-12 rounded-full object-cover" 
                              />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(chat.status)}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{chat.lister_name}</h3>
                          <p className="text-sm text-muted-foreground">{chat.listing_title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {chat.last_message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {chat.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.last_message_time).toLocaleDateString('el-GR')}
                        </p>
                        {chat.unread_count > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;