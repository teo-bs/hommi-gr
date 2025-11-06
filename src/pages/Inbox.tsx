import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useThreads } from "@/hooks/useThreads";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ConversationViewEnhanced } from "@/components/room/ConversationViewEnhanced";
import { PendingRequests } from "@/components/messaging/PendingRequests";
import { NotificationPrompt } from "@/components/messaging/NotificationPrompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { MessageCircle, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Inbox = () => {
  const { user, profile } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('accepted');
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const isLister = profile?.role === 'lister';

  // Enable real-time notifications with refetch callback
  useRealtimeNotifications({
    activeThreadId: selectedThread?.id,
    onNewMessage: () => refetch()
  });

  // Use the new threads hook
  const { threads, totalCount, isLoading, refetch } = useThreads({
    page: currentPage,
    pageSize: 20,
    status: statusFilter
  });

  const totalPages = Math.ceil(totalCount / 20);

  useEffect(() => {
    if (user && isLister) {
      loadPendingRequestsCount();
    }
  }, [user, isLister]);

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

  if (selectedThread) {
    return (
      <div className="min-h-screen bg-background pb-safe">
        <ConversationViewEnhanced
          threadId={selectedThread.id}
          listingId={selectedThread.listingId}
          listingTitle={selectedThread.listingTitle}
          listingCoverImage=""
          listingPrice={0}
          listingCity=""
          listingNeighborhood=""
          listerName={selectedThread.listing?.profiles?.display_name || 'Lister'}
          listerAvatar={selectedThread.listing?.profiles?.avatar_url}
          listerVerifications={selectedThread.listing?.profiles?.verifications_json}
          listerResponseTime={selectedThread.listing?.profiles?.avg_response_time_minutes}
          listerUserId={selectedThread.otherUserId}
          isHost={selectedThread.isHost}
          onClose={() => {
            setSelectedThread(null);
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold">Μηνύματα</h1>
      </div>

      {/* Notification Permission Prompt */}
      <div className="mb-4 sm:mb-6">
        <NotificationPrompt />
      </div>

      {isLister ? (
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 min-h-[44px]">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Αιτήματα ({pendingRequestsCount})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Συνομιλίες ({threads.length})
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
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Φόρτωση συνομιλιών...</div>
              ) : threads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Δεν υπάρχουν συνομιλίες</p>
                  </CardContent>
                </Card>
              ) : (
                threads.map((thread) => (
                   <Card 
                    key={thread.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation active:scale-[0.98]"
                    onClick={() => setSelectedThread(thread)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <AvatarWithBadge
                            src={thread.otherUserAvatar}
                            alt={thread.otherUserName}
                            fallback={thread.otherUserName?.[0]?.toUpperCase() || 'U'}
                            verificationsJson={thread.otherUserVerifications}
                            className="h-12 w-12"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{thread.otherUserName}</h3>
                            <p className="text-sm text-muted-foreground">{thread.listingTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-2">
                            {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString('el-GR') : '-'}
                          </p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Σελίδα {currentPage} από {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Tenant view - only chats
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Φόρτωση συνομιλιών...</div>
          ) : threads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Δεν υπάρχουν συνομιλίες</p>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <Card 
                key={thread.id} 
                className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation active:scale-[0.98]"
                onClick={() => setSelectedThread(thread)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <AvatarWithBadge
                        src={thread.otherUserAvatar}
                        alt={thread.otherUserName}
                        fallback={thread.otherUserName?.[0]?.toUpperCase() || 'U'}
                        verificationsJson={thread.otherUserVerifications}
                        className="h-12 w-12"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{thread.otherUserName}</h3>
                        <p className="text-sm text-muted-foreground">{thread.listingTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-2">
                        {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString('el-GR') : '-'}
                      </p>
                      {thread.unreadCount > 0 && (
                        <Badge variant="destructive">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Σελίδα {currentPage} από {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inbox;