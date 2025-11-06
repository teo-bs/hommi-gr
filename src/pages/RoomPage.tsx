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
import { HouseRules } from "@/components/room/HouseRules";
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
  houseRules: string[];
}

const RoomPage = () => {
  const { slug, id } = useParams(); // Support both slug and legacy id
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile: authProfile } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Message flow management
  const messageFlow = useMessageFlow();

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

        // Fetch lister profile data with verifications
        const { data: lister, error: listerError } = await supabase
          .from('profiles')
          .select('*, verifications_json, avg_response_time_minutes')
          .eq('id', listing.owner_id)
          .maybeSingle();

        console.log('Lister fetch result:', { lister, listerError });

        // Fetch amenities using proper joins for better performance and clarity
        // Junction table determines category: listing_amenities = property, room_amenities = room
        const { data: listingAmenitiesJoined } = await supabase
          .from('listing_amenities')
          .select('amenities(id, name_el, name_en, icon, key)')
          .eq('listing_id', listing.id);

        const { data: roomAmenitiesJoined } = await supabase
          .from('room_amenities')
          .select('amenities(id, name_el, name_en, icon, key)')
          .eq('room_id', room.id);
        
        // Fetch house rules
        const { data: houseRulesData } = await supabase
          .from('listing_house_rules')
          .select('house_rule_types(name_el)')
          .eq('listing_id', listing.id);
        
        console.log('🏠 Property amenities (from listing_amenities):', listingAmenitiesJoined?.length || 0);
        console.log('🛏️ Room amenities (from room_amenities):', roomAmenitiesJoined?.length || 0);
        console.log('📋 House rules:', houseRulesData?.length || 0);

        // Process room amenities - prefer Greek names
        const processedRoomAmenities = (roomAmenitiesJoined || [])
          .map((ra: any) => ra.amenities)
          .filter(Boolean)
          .map((amenity: any) => ({
            name: amenity.name_el || amenity.name_en || 'Δεν έχει καθοριστεί',
            icon: amenity.key || amenity.icon || 'home',
            key: amenity.key
          }));

        // Process listing/property amenities - prefer Greek names
        const processedPropertyAmenities = (listingAmenitiesJoined || [])
          .map((la: any) => la.amenities)
          .filter(Boolean)
          .map((amenity: any) => ({
            name: amenity.name_el || amenity.name_en || 'Δεν έχει καθοριστεί',
            icon: amenity.key || amenity.icon || 'home',
            key: amenity.key
          }));
        
        console.log('✅ Processed property amenities:', processedPropertyAmenities);
        console.log('✅ Processed room amenities:', processedRoomAmenities);

        // Process house rules - extract Greek labels
        const houseRules = (houseRulesData || [])
          .map((hr: any) => hr.house_rule_types?.name_el)
          .filter(Boolean);

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
          stats,
          houseRules
        };

        console.log('🔍 Final room data:', {
          listing_id: listing.id,
          has_lift: listing.has_lift,
          floor: listing.floor,
          deposit: listing.deposit,
          deposit_required: listing.deposit_required,
          bills_included: listing.bills_included,
          flatmates_count: listing.flatmates_count,
          bathrooms: listing.bathrooms,
          amenities_property_count: processedPropertyAmenities.length,
          amenities_room_count: processedRoomAmenities.length,
          published_at: listing.published_at,
          created_at: listing.created_at
        });
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
    if (!roomData?.listing?.id) {
      console.error('Cannot create chat request: missing listing data');
      return;
    }
    
    console.log('Initiating chat request for listing:', roomData.listing.id);
    await messageFlow.createChatRequest(roomData.listing.id);
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
        
        {/* Open Graph for rich social sharing */}
        <meta property="og:title" content={listing?.title || 'Room on Hommi'} />
        <meta property="og:description" content={`${listing?.title || 'Room'} in ${listing?.neighborhood || 'Athens'}. €${listing?.price_month || '0'}/month. Trusted coliving in Greece.`} />
        <meta property="og:image" content={photos?.[0]?.photo_url || 'https://hommi.gr/og-image.png'} />
        <meta property="og:url" content={`https://hommi.gr/listing/${slug || id}`} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(listing?.price_month || '0')} />
        <meta property="product:price:currency" content="EUR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={listing?.title || 'Room on Hommi'} />
        <meta name="twitter:description" content={`${listing?.title || 'Room'} in ${listing?.neighborhood || 'Athens'}. €${listing?.price_month || '0'}/month.`} />
        <meta name="twitter:image" content={photos?.[0]?.photo_url || 'https://hommi.gr/og-image.png'} />
      </Helmet>

      <div className="container mx-auto px-4 py-3 sm:py-6 pb-20 sm:pb-24 lg:pb-8">
        {/* Back to Search Button */}
        {location.state?.fromSearch && (
          <div className="mb-2 sm:mb-4 animate-fade-in">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <Gallery 
              photos={photos} 
              title={listing.title}
              roomId={room.id}
              listingSlug={slug || id || ''}
              listingTitle={listing.title}
              flatmatesCount={listing.flatmates_count}
              roomType={room.room_type}
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
                publishedDate={listing.published_at || listing.created_at}
                viewCount={stats?.view_count || 0}
                requestCount={stats?.request_count || 0}
              />
              
              <QuickFacts room={room} listing={listing} />
              
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
              
              <HouseRules houseRules={roomData.houseRules} />
              
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
                deposit={listing.deposit}
                depositRequired={listing.deposit_required}
                billsIncluded={listing.bills_included}
                billsNote={listing.bills_note}
              />
              
              <CTAStack onRequestChat={handleRequestChat} />
              
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
              listingId={roomData.listing.id}
              listingTitle={roomData.listing.title}
              listingCoverImage={roomData.photos[0]?.url}
              listingPrice={roomData.listing.price_month}
              listingCity={roomData.listing.city}
              listingNeighborhood={roomData.listing.neighborhood}
              listerName={roomData.profile?.display_name || 'Ιδιοκτήτης'}
              listerAvatar={roomData.profile?.avatar_url}
              listerVerifications={roomData.profile?.verifications_json}
              listerResponseTime={roomData.profile?.avg_response_time_minutes}
              listerUserId={roomData.profile?.id}
              onClose={messageFlow.closeConversation}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RoomPage;