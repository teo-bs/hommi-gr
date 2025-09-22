import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { Gallery } from "@/components/room/Gallery";
import { PriceBox } from "@/components/room/PriceBox";
import { CTAStack } from "@/components/room/CTAStack";
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
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchRoom = async () => {
      try {
        // Fetch room with listing data
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', id)
          .single();

        if (roomError || !room) {
          navigate('/');
          return;
        }

        // Fetch listing data
        const { data: listing } = await supabase
          .from('listings')
          .select('*')
          .eq('id', room.listing_id)
          .single();

        if (!listing) {
          navigate('/');
          return;
        }

        // Fetch photos
        const { data: photos } = await supabase
          .from('room_photos')
          .select('*')
          .eq('room_id', room.id)
          .order('sort_order');

        // Fetch stats
        const { data: stats } = await supabase
          .from('room_stats')
          .select('*')
          .eq('room_id', room.id)
          .single();

        // Fetch lister data
        const { data: lister } = await supabase
          .from('listers')
          .select('*, profile:profiles(*)')
          .eq('profile_id', listing.owner_id)
          .single();

        // Fetch amenities
        const { data: roomAmenities } = await supabase
          .from('room_amenities')
          .select(`
            amenity:amenities(*)
          `)
          .eq('room_id', room.id);

        // Process amenities safely  
        const allAmenities = roomAmenities?.map(ra => ra.amenity).filter(Boolean) || [];
        const propertyAmenities = allAmenities.filter(amenity => {
          return amenity && typeof amenity === 'object' && 'category' in amenity && (amenity as any).category === 'property';
        });
        const roomAmenitiesFiltered = allAmenities.filter(amenity => {
          return amenity && typeof amenity === 'object' && 'category' in amenity && (amenity as any).category === 'room';
        });

        setRoomData({
          room,
          listing,
          lister,
          profile: lister?.profile,
          photos: photos || [],
          amenities: {
            property: propertyAmenities,
            room: roomAmenitiesFiltered
          },
          stats
        });

        // Increment view count
        await supabase.rpc('increment_room_views', { rid: room.id });

      } catch (error) {
        console.error('Error fetching room:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate]);

  const handleRequestChat = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // TODO: Implement chat request logic
    console.log('request_to_chat', { roomId: id, timestamp: Date.now() });
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
        <title>{listing.title} - €{listing.price_month}/month - Hommi</title>
        <meta 
          name="description" 
          content={`${listing.title} in ${listing.neighborhood}, ${listing.city}. €${listing.price_month}/month. Find your perfect co-living space on Hommi.`} 
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
              
              <CTAStack onRequestChat={handleRequestChat} />
              
              <QuickFacts 
                room={room}
                listing={listing}
              />
            </div>
            
            <ListerCard profile={profile} />
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default RoomPage;