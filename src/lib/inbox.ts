export function formatThreadForDisplay(thread: any, currentUserId: string) {
  const isHost = thread.host_id === currentUserId;
  const otherUser = isHost ? thread.seeker_profile : thread.host_profile;
  const unreadCount = isHost ? thread.unread_count_host : thread.unread_count_seeker;
  
  // Get cover photo - prioritize is_cover true, fallback to first photo
  const coverPhoto = thread.listing?.listing_photos?.find((p: any) => p.is_cover) 
    || thread.listing?.listing_photos?.[0];
  
  return {
    id: thread.id,
    listingTitle: thread.listing?.title || 'Listing',
    listingId: thread.listing_id,
    listingSlug: thread.listing?.slug,
    listingPrice: thread.listing?.price_month || 0,
    listingCity: thread.listing?.city || '',
    listingNeighborhood: thread.listing?.neighborhood || '',
    listingCoverImage: coverPhoto?.url || '',
    listingAvailableFrom: thread.listing?.availability_date,
    listingBillsIncluded: thread.listing?.bills_included,
    roomId: thread.room_id,
    otherUserId: otherUser?.id,
    otherUserName: otherUser?.display_name || 'User',
    otherUserAvatar: otherUser?.avatar_url,
    otherUserVerifications: otherUser?.verifications_json,
    otherUserResponseTime: otherUser?.avg_response_time_minutes,
    lastMessageAt: thread.last_message_at,
    unreadCount: unreadCount || 0,
    status: thread.status,
    isHost,
    listing: thread.listing
  };
}

export function getUserRoleInThread(thread: any, currentUserId: string): 'host' | 'seeker' {
  return thread.host_id === currentUserId ? 'host' : 'seeker';
}
