export function formatThreadForDisplay(thread: any, currentUserId: string) {
  const isHost = thread.host_id === currentUserId;
  const otherUser = isHost ? thread.seeker_profile : thread.host_profile;
  const unreadCount = isHost ? thread.unread_count_host : thread.unread_count_seeker;
  
  return {
    id: thread.id,
    listingTitle: thread.listing?.title || 'Listing',
    listingId: thread.listing_id,
    roomId: thread.room_id,
    otherUserId: otherUser?.id,
    otherUserName: otherUser?.display_name || 'User',
    otherUserAvatar: otherUser?.avatar_url,
    lastMessageAt: thread.last_message_at,
    unreadCount: unreadCount || 0,
    status: thread.status,
    isHost
  };
}

export function getUserRoleInThread(thread: any, currentUserId: string): 'host' | 'seeker' {
  return thread.host_id === currentUserId ? 'host' : 'seeker';
}
