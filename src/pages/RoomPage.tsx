import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthFlowManager } from "@/components/auth/AuthFlowManager";
import { TermsPrivacyModal } from "@/components/auth/TermsPrivacyModal";
import { MessageComposer } from "@/components/room/MessageComposer";
import { ConversationViewEnhanced } from "@/components/room/ConversationViewEnhanced";
import { useMessageFlow } from "@/hooks/useMessageFlow";
import { Gallery } from "@/components/room/Gallery";
import { PriceBox } from "@/components/room/PriceBox";
import { CTAStack } from "@/components/room/CTAStack";
import { RequestStatus } from "@/components/room/RequestStatus";
import { QuickFacts } from "@/components/room/QuickFacts";
import { StatsBar } from "@/components/room/StatsBar";
import { Description } from "@/components/room/Description";
import { PropertyDetails } from "@/components/room/PropertyDetails";
import { FlatmatesBlock } from "@/components/room/FlatmatesBlock";
import { PreferredFlatmateBlock } from "@/components/room/PreferredFlatmateBlock";
import { AmenitiesGrid } from "@/components/room/AmenitiesGrid";
import { LocationMiniMap } from "@/components/room/LocationMiniMap";
import { ListerCard } from "@/components/room/ListerCard";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";
import { ShareButton } from "@/components/room/ShareButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MobileActionBar } from "@/components/room/MobileActionBar";

interface RoomData {
  room: any;
  listing: any;
  lister: any;
  profile: any;
  photos: any[];
  amenities: {
    property: any[];
    room: any[];
  };
  stats: any;
}

const RoomPage = () => {
  const { slug, id } = useParams(); // Support both slug and legacy id
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile: authProfile } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Message flow management - use slug or id as identifier
  const roomIdentifier = slug || id || '';
  const messageFlow = useMessageFlow(roomIdentifier);

  // Track referral from shared link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    
    if (utmSource === 'share') {
      console.log('listing_viewed_from_share', {
        listing_slug: slug,
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign')
      });
    }
  }, [slug]);

  useEffect(() => {
    if (!slug && !id) {
      navigate('/404');
      return;
    }

    const fetchRoom = async () => {
      try {
        const searchParam = slug || id;
        console.log('Fetching room data for:', { slug, id, searchParam });
        
        // Fetch room by slug or id
        let roomQuery = supabase.from('rooms').select('*');
        
        if (slug) {
          roomQuery = roomQuery.eq('slug', slug);
        } else {
          roomQuery = roomQuery.eq('id', id);
        }
        
        const { data: room, error: roomError } = await roomQuery.maybeSingle();

        console.log('Room fetch result:', { room, roomError });

        if (roomError) {
          console.error('Room fetch error:', roomError);
          navigate('/404');
          return;
        }

        if (!room) {
          console.error('Room not found:', searchParam);
          navigate('/404');
          return;
        }

        // If accessed by ID, redirect to slug URL for SEO
        if (id && !slug && room.slug) {
          navigate(`/listing/${room.slug}`, { replace: true });
          return;
        }

        // Fetch listing data
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', room.listing_id)
          .maybeSingle();

        console.log('Listing fetch result:', { listing, listingError });

        if (listingError) {
          console.error('Listing fetch error:', listingError);
          navigate('/404');
          return;
        }

        if (!listing) {
          console.error('Listing not found for room:', searchParam);
          navigate('/404');
          return;
        }

        // Fetch photos with proper ordering (cover first)
        const { data: photos, error: photosError } = await supabase
          .from('room_photos')
          .select('id, url, is_cover, sort_order, created_at, thumbnail_url, medium_url, large_url, alt_text')
          .eq('room_id', room.id)
          .is('deleted_at', null)
          .order('is_cover', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        console.log('Photos fetch result:', { photos, photosError });

        // Fetch stats
        const { data: stats, error: statsError } = await supabase
          .from('room_stats')
          .select('*')
          .eq('room_id', room.id)
          .maybeSingle();

        console.log('Stats fetch result:', { stats, statsError });

        // Fetch lister profile data
        const { data: lister, error: listerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', listing.owner_id)
          .maybeSingle();

        console.log('Lister fetch result:', { lister, listerError });

        // Fetch room amenities (with type assertion to bypass TS issues)
        const roomAmenitiesQuery = await (supabase as any)
          .from('room_amenities')
          .select('amenity_id')
          .eq('room_id', room.id);

        console.log('Room amenities raw:', roomAmenitiesQuery);

        // Fetch amenities data for room amenities
        let roomAmenitiesData: any[] = [];
        if (roomAmenitiesQuery.data && roomAmenitiesQuery.data.length > 0) {
          const roomAmenityIds = roomAmenitiesQuery.data.map((ra: any) => ra.amenity_id);
          const amenitiesQuery = await (supabase as any)
            .from('amenities')
            .select('*')
            .in('id', roomAmenityIds)
            .eq('is_active', true);
          console.log('Room amenities data fetch:', amenitiesQuery);
          roomAmenitiesData = amenitiesQuery.data || [];
        }

        // Fetch listing amenities from listing_amenities table
        const listingAmenitiesQuery = await (supabase as any)
          .from('listing_amenities')
          .select('amenity_id')
          .eq('listing_id', listing.id);

        console.log('Listing amenities raw:', listingAmenitiesQuery);

        let listingAmenitiesData: any[] = [];
        if (listingAmenitiesQuery.data && listingAmenitiesQuery.data.length > 0) {
          const listingAmenityIds = listingAmenitiesQuery.data.map((la: any) => la.amenity_id);
          const amenitiesQuery = await (supabase as any)
            .from('amenities')
            .select('*')
            .in('id', listingAmenityIds)
            .eq('is_active', true);
          console.log('Listing amenities data fetch:', amenitiesQuery);
          listingAmenitiesData = amenitiesQuery.data || [];
        }

        console.log('Amenities data:', { 
          roomAmenitiesData,
          listingAmenitiesData
        });

        // Process room amenities
        const processedRoomAmenities = roomAmenitiesData.map(amenity => ({
          name: amenity.name_en || amenity.name_el || 'Unknown',
          icon: amenity.key || amenity.icon || 'home'
        }));

        // Process listing/property amenities
        const processedPropertyAmenities = listingAmenitiesData.map(amenity => ({
          name: amenity.name_en || amenity.name_el || 'Unknown',
          icon: amenity.key || amenity.icon || 'home'
        }));

        const roomData = {
          room,
          listing,
          lister,
          profile: lister,
          photos: photos || [],
          amenities: {
            property: processedPropertyAmenities,
            room: processedRoomAmenities
          },
          stats
        };

        console.log('Setting room data:', roomData);
        setRoomData(roomData);

        // Increment view count
        try {
          await supabase.rpc('increment_room_views', { rid: room.id });
          console.log('View count incremented for room:', room.id);
        } catch (viewError) {
          console.error('Error incrementing view count:', viewError);
        }

      } catch (error) {
        console.error('Error fetching room:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [slug, id, navigate, authProfile?.id]);

  const handleRequestChat = async () => {
    if (!roomData) return;
    
    // Use the new chat request flow
    await messageFlow.createChatRequest();
  };

  const handleMessageSent = (message: string) => {
    messageFlow.handleMessageSent(message);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Skeleton className="h-64 sm:h-80 md:h-96 w-full rounded-2xl animate-pulse" />
            <div className="space-y-3 sm:space-y-4 animate-fade-in">
              <Skeleton className="h-8 sm:h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
              <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-48 sm:h-64 w-full rounded-2xl" />
            <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
            <Skeleton className="h-16 sm:h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return null;
  }

  const { room, listing, profile: listerProfile, photos, amenities, stats } = roomData;

  return (
    <>
      <Helmet>
        <title>{`${listing?.title || 'Room'} - €${listing?.price_month || '0'}/month - Hommi`}</title>
        <meta 
          name="description" 
          content={`${listing?.title || 'Room'} in ${listing?.neighborhood || 'Athens'}, ${listing?.city || 'Greece'}. €${listing?.price_month || '0'}/month. Find your perfect co-living space on Hommi.`} 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-4 sm:py-8 pb-24 lg:pb-8">
        {/* Back to Search Button */}
        {location.state?.fromSearch && (
          <div className="mb-3 sm:mb-4 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/search', { state: { fromListing: true } })}
              className="gap-2 -ml-2 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Επιστροφή στα αποτελέσματα</span>
              <span className="sm:hidden">Πίσω</span>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 animate-fade-in">
            <Gallery 
              photos={photos} 
              title={listing.title}
              isOwner={isOwner}
              photoType="room_photos"
              parentId={room.id}
              onPhotosUpdate={async () => {
                // Refetch room photos after actions
                const { data: updatedPhotos } = await supabase
                  .from('room_photos')
                  .select('id, url, is_cover, sort_order, created_at, thumbnail_url, medium_url, large_url, alt_text')
                  .eq('room_id', room.id)
                  .is('deleted_at', null)
                  .order('is_cover', { ascending: false })
                  .order('sort_order', { ascending: true })
                  .order('created_at', { ascending: true });
                
                if (updatedPhotos) {
                  setRoomData(prev => prev ? { ...prev, photos: updatedPhotos } : null);
                }
              }}
            />
            
            <div className="space-y-6">
              <StatsBar 
                publishedDate={listing.created_at}
                viewCount={stats?.view_count || 0}
                requestCount={stats?.request_count || 0}
              />
              
              <Description 
                title={listing.title}
                description={listing.description || "Όμορφο δωμάτιο στην καρδιά της πόλης..."}
              />
              
              <PropertyDetails 
                room={room}
                listing={listing}
              />
              
              <FlatmatesBlock 
                flatmatesCount={listing.flatmates_count}
              />
              
              <PreferredFlatmateBlock 
                listing={listing}
              />
              
              <AmenitiesGrid 
                propertyAmenities={amenities.property}
                roomAmenities={amenities.room}
              />
              
              <LocationMiniMap 
                geo={listing?.lat && listing?.lng ? { lat: Number(listing.lat), lng: Number(listing.lng) } : undefined}
                neighborhood={listing.neighborhood}
                city={listing.city}
                formatted_address={listing.formatted_address}
                street_address={listing.street_address}
                is_location_approx={listing.is_location_approx}
              />
            </div>
          </div>

          {/* Right Sidebar - Sticky on desktop, natural flow on mobile */}
          <div className="lg:col-span-1">
            {/* Lister Card - Not Sticky */}
            <div className="mb-3 sm:mb-4 animate-scale-in">
              <ListerCard 
                lister={listerProfile}
                verificationBadge={listerProfile?.kyc_status === 'approved'}
                languages={listerProfile?.languages || []}
                memberSince={listerProfile?.member_since}
                lastActive={listerProfile?.last_active}
                profession={listerProfile?.profession}
              />
            </div>
            
            {/* Sticky Section on desktop, fixed bottom bar on mobile */}
            <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
              <PriceBox 
                price={listing.price_month}
                billsIncluded={!listing.bills_note || listing.bills_note.toLowerCase().includes('included')}
                deposit={listing.deposit || 0}
              />
              
              <div className="space-y-2">
                <SaveRoomButton roomId={room.id} />
                <ShareButton 
                  listingSlug={slug || id || ''}
                  listingTitle={listing.title}
                />
              </div>
              
              <CTAStack onRequestChat={handleRequestChat} />
              
              <QuickFacts room={room} listing={listing} />
              
              <RequestStatus 
                status={messageFlow.requestStatus}
                onOpenConversation={() => messageFlow.handleMessageSent("")}
                onRequestAgain={handleRequestChat}
              />
          </div>
        </div>

        {/* Mobile Action Bar - Fixed at bottom */}
        <MobileActionBar 
          roomId={room.id}
          listingSlug={slug || id || ''}
          listingTitle={listing.title}
          price={listing.price_month}
          onRequestChat={handleRequestChat}
        />
      </div>
      </div>

      <AuthFlowManager 
        isAuthOpen={messageFlow.authModalOpen} 
        onAuthClose={messageFlow.closeAuth}
        onAuthSuccess={messageFlow.handleAuthSuccess}
      />
      
      <TermsPrivacyModal
        isOpen={messageFlow.termsModalOpen}
        onAccept={messageFlow.handleTermsAccepted}
      />
      
      {messageFlow.conversationOpen && roomData && messageFlow.threadId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <ConversationViewEnhanced
              threadId={messageFlow.threadId}
              listingTitle={roomData.listing.title}
              listerName={roomData.profile?.display_name || 'Ιδιοκτήτης'}
              listerAvatar={roomData.profile?.avatar_url}
              onClose={messageFlow.closeConversation}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RoomPage;