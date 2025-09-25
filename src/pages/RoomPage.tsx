import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthFlowManager } from "@/components/auth/AuthFlowManager";
import { TermsPrivacyModal } from "@/components/auth/TermsPrivacyModal";
import { MessageComposer } from "@/components/room/MessageComposer";
import { ConversationView } from "@/components/room/ConversationView";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Message flow management - use slug or id as identifier
  const roomIdentifier = slug || id || '';
  const messageFlow = useMessageFlow(roomIdentifier);

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

        // Fetch photos
        const { data: photos, error: photosError } = await supabase
          .from('room_photos')
          .select('*')
          .eq('room_id', room.id)
          .order('sort_order');

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

        // Fetch amenities
        const { data: roomAmenities, error: amenitiesError } = await supabase
          .from('room_amenities')
          .select(`
            amenity:amenities(*)
          `)
          .eq('room_id', room.id);

        console.log('Amenities fetch result:', { roomAmenities, amenitiesError });

        // Process amenities safely  
        const allAmenities = roomAmenities?.map(ra => ra.amenity) || [];
        const validAmenities = allAmenities.filter((amenity): amenity is NonNullable<typeof amenity> => 
          amenity !== null && amenity !== undefined && typeof amenity === 'object'
        );
        const propertyAmenities = validAmenities.filter(amenity => 
          'category' in amenity && (amenity as any).category === 'property'
        );
        const roomAmenitiesFiltered = validAmenities.filter(amenity => 
          'category' in amenity && (amenity as any).category === 'room'
        );

        const roomData = {
          room,
          listing,
          lister,
          profile: lister,
          photos: photos || [],
          amenities: {
            property: propertyAmenities,
            room: roomAmenitiesFiltered
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
  }, [slug, id, navigate]);

  const handleRequestChat = async () => {
    if (!roomData) return;
    
    // Use the new chat request flow
    await messageFlow.initiateMessageFlow(
      "Γεια σας! Ενδιαφέρομαι για το δωμάτιο. Μπορούμε να μιλήσουμε;",
      roomData.listing.id,
      roomData.listing.owner_id
    );
  };

  const handleMessageSent = (message: string) => {
    messageFlow.handleMessageSent(message);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return null;
  }

  const { room, listing, profile, photos, amenities, stats } = roomData;

  return (
    <>
      <Helmet>
        <title>{`${listing?.title || 'Room'} - €${listing?.price_month || '0'}/month - Hommi`}</title>
        <meta 
          name="description" 
          content={`${listing?.title || 'Room'} in ${listing?.neighborhood || 'Athens'}, ${listing?.city || 'Greece'}. €${listing?.price_month || '0'}/month. Find your perfect co-living space on Hommi.`} 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Gallery photos={photos} title={listing.title} />
            
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
                geo={listing.geo}
                neighborhood={listing.neighborhood}
                city={listing.city}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-8 space-y-4">
              <PriceBox 
                price={listing.price_month}
                deposit={listing.price_month}
                billsIncluded={true}
              />
              
              {/* Show request status if request was sent */}
              <RequestStatus 
                status={messageFlow.requestStatus}
                onOpenConversation={() => {
                  // Open the conversation by setting the state directly
                  messageFlow.handleMessageSent(messageFlow.messageToSend || "");
                }}
                onRequestAgain={() => handleRequestChat()}
              />
              
              {/* Show CTA buttons only if no request sent yet */}
              {messageFlow.requestStatus === 'none' && (
                <CTAStack onRequestChat={handleRequestChat} />
              )}
              
              <MessageComposer
                roomId={roomIdentifier}
                listingTitle={listing.title}
                onAuthRequired={() => messageFlow.initiateMessageFlow("", undefined, undefined, handleRequestChat)}
                onMessageSent={handleMessageSent}
              />
              
              <QuickFacts 
                room={room}
                listing={listing}
              />
            </div>
            
            <ListerCard profile={profile} />
          </div>
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
      
      {messageFlow.conversationOpen && roomData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <ConversationView
              roomId={roomIdentifier}
              listingTitle={roomData.listing.title}
              listerName={roomData.profile?.display_name || 'Ιδιοκτήτης'}
              listerAvatar={roomData.profile?.avatar_url}
              initialMessage={messageFlow.messageToSend || undefined}
              onClose={messageFlow.closeConversation}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RoomPage;