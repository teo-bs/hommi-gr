import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { StepTransition } from "@/components/ui/step-transition";
import { useSearchCacheRefresh } from "@/hooks/useSearchCacheRefresh";
import PublishStepZero from "@/components/publish/PublishStepZero";
import PublishStepOne from "@/components/publish/PublishStepOne";
import PublishStepTwo from "@/components/publish/PublishStepTwo";
import PublishStepThree from "@/components/publish/PublishStepThree";
import PublishStepFour from "@/components/publish/PublishStepFour";
import PublishStepFive from "@/components/publish/PublishStepFive";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useListingValidation } from "@/hooks/useListingValidation";
import { useVerifications } from "@/hooks/useVerifications";
import { PublishWarningsBanner } from "@/components/publish/PublishWarningsBanner";
import { PublishProfileModal } from "@/components/publish/PublishProfileModal";
import { PublishVerificationModal } from "@/components/publish/PublishVerificationModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { handleAmenitiesUpdate } from "@/components/publish/AmenitiesHandler";

interface ListingDraft {
  id?: string;
  title: string;
  city: string;
  neighborhood: string;
  street_address?: string;
  lat?: number;
  lng?: number;
  property_type: 'room' | 'apartment';
  property_size_m2?: number;
  room_size_m2?: number;
  price_month?: number;
  deposit_required: boolean;
  has_lift: boolean;
  bedrooms_single: number;
  bedrooms_double: number;
  bathrooms: number;
  wc_count: number;
  flatmates_count: number;
  i_live_here: boolean;
  orientation: 'exterior' | 'interior';
  bed_type?: string;
  has_bed?: boolean;
  amenities_property: string[];
  amenities_room: string[];
  house_rules: string[];
  availability_date?: Date;
  availability_to?: Date;
  min_stay_months?: number;
  max_stay_months?: number;
  bills_note?: string;
  services: string[];
  photos: string[];
  description?: string;
  preferred_gender?: string[];
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_situation?: string[];
  step_completed: number;
  couples_accepted: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
}

const STEPS = [
  { id: 0, title: "Τύπος λογαριασμού" },
  { id: 1, title: "Τοποθεσία & Τύπος" },
  { id: 2, title: "Λεπτομέρειες" },
  { id: 3, title: "Όροι ενοικίασης" },
  { id: 4, title: "Φωτογραφίες & Περιγραφή" },
  { id: 5, title: "Προτιμήσεις συγκατοίκων" }
];

export default function Publish() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { validateListing, isValidating } = useListingValidation();
  const { verifications, refetch: refetchVerifications } = useVerifications();
  
  const editingId = searchParams.get('id'); // Check if we're editing an existing listing
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [publishWarnings, setPublishWarnings] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishingStage, setPublishingStage] = useState<string>("");
  const [publishProgress, setPublishProgress] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Search cache refresh hook
  const { mutateAsync: refreshSearchCache } = useSearchCacheRefresh();
  
  const currentStep = parseInt(searchParams.get('step') || '0');
  const [draft, setDraft] = useState<ListingDraft>({
    title: '',
    city: '',
    neighborhood: '',
    property_type: 'room',
    deposit_required: true,
    has_lift: false,
    bedrooms_single: 0,
    bedrooms_double: 0,
    bathrooms: 1,
    wc_count: 1,
    flatmates_count: 0,
    i_live_here: false,
    orientation: 'exterior',
    amenities_property: [],
    amenities_room: [],
    house_rules: [],
    services: [],
    photos: [],
    step_completed: 0,
    couples_accepted: false,
    pets_allowed: false,
    smoking_allowed: false,
    preferred_age_min: 18,
    preferred_age_max: 35
  });

  // Load existing draft or specific listing for editing
  useEffect(() => {
    if (user && profile) {
      loadDraft();
    }
  }, [user, profile, editingId]);

  const loadDraft = async () => {
    if (!user || !profile) return;

    try {
      let existingDraft = null;
      
      if (editingId) {
        // Load specific listing for editing
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('id', editingId)
          .eq('owner_id', profile.id)
          .single();
        existingDraft = data;
      } else {
        // Load most recent draft
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', profile.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        existingDraft = data;
      }

      if (existingDraft) {
          setDraft({
          id: existingDraft.id,
          title: existingDraft.title || '',
          city: existingDraft.city || '',
          neighborhood: existingDraft.neighborhood || '',
          street_address: existingDraft.street_address || '',
          lat: existingDraft.lat ? Number(existingDraft.lat) : undefined,
          lng: existingDraft.lng ? Number(existingDraft.lng) : undefined,
          property_type: (existingDraft.property_type as 'room' | 'apartment') || 'room',
          property_size_m2: existingDraft.property_size_m2 || undefined,
          room_size_m2: existingDraft.room_size_m2 || undefined,
          price_month: existingDraft.price_month || undefined,
          deposit_required: existingDraft.deposit_required ?? true,
          has_lift: existingDraft.has_lift || false,
          bedrooms_single: existingDraft.bedrooms_single || 0,
          bedrooms_double: existingDraft.bedrooms_double || 0,
          bathrooms: existingDraft.bathrooms || 1,
          wc_count: existingDraft.wc_count || 1,
          flatmates_count: existingDraft.flatmates_count || 0,
          i_live_here: existingDraft.i_live_here || false,
          orientation: (existingDraft.orientation as 'exterior' | 'interior') || 'exterior',
          bed_type: existingDraft.bed_type || undefined,
          house_rules: Array.isArray(existingDraft.house_rules) ? existingDraft.house_rules as string[] : [],
          amenities_property: [], // Handle separately via listing_amenities table
          amenities_room: [], // Handle separately via room_amenities table
          availability_date: existingDraft.availability_date ? new Date(existingDraft.availability_date) : undefined,
          availability_to: existingDraft.availability_to ? new Date(existingDraft.availability_to) : undefined,
          min_stay_months: existingDraft.min_stay_months || undefined,
          max_stay_months: existingDraft.max_stay_months || undefined,
          bills_note: existingDraft.bills_note || '',
          services: Array.isArray(existingDraft.services) ? existingDraft.services as string[] : [],
          photos: Array.isArray(existingDraft.photos) ? existingDraft.photos as string[] : [],
          description: existingDraft.description || '',
          preferred_gender: Array.isArray(existingDraft.preferred_gender) ? existingDraft.preferred_gender as string[] : [],
          preferred_age_min: existingDraft.preferred_age_min || 18,
          preferred_age_max: existingDraft.preferred_age_max || 35,
          preferred_situation: Array.isArray(existingDraft.preferred_situation) ? existingDraft.preferred_situation as string[] : [],
          step_completed: existingDraft.step_completed || 0,
          couples_accepted: existingDraft.couples_accepted || false,
          pets_allowed: existingDraft.pets_allowed || false,
          smoking_allowed: existingDraft.smoking_allowed || false
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async (updates: Partial<ListingDraft>) => {
    if (!user || !profile) return;

    setIsSaving(true);
    const updatedDraft = { ...draft, ...updates };
    setDraft(updatedDraft);
    
    console.log('Saving draft with updates:', updates, 'Full draft:', updatedDraft);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    try {
      const draftData = {
        title: updatedDraft.title,
        city: updatedDraft.city,
        neighborhood: updatedDraft.neighborhood,
        street_address: updatedDraft.street_address,
        lat: updatedDraft.lat,
        lng: updatedDraft.lng,
        property_type: updatedDraft.property_type,
        property_size_m2: updatedDraft.property_size_m2,
        room_size_m2: updatedDraft.room_size_m2,
        price_month: updatedDraft.price_month,
        deposit_required: updatedDraft.deposit_required,
        has_lift: updatedDraft.has_lift,
        bedrooms_single: updatedDraft.bedrooms_single,
        bedrooms_double: updatedDraft.bedrooms_double,
        bathrooms: updatedDraft.bathrooms,
        wc_count: updatedDraft.wc_count,
        flatmates_count: updatedDraft.flatmates_count,
        i_live_here: updatedDraft.i_live_here,
        orientation: updatedDraft.orientation,
        bed_type: updatedDraft.bed_type,
        // Don't save amenities to listing table - handle via separate tables
        // amenities_property and amenities_room are stored in listing_amenities and room_amenities
        availability_date: updatedDraft.availability_date?.toISOString().split('T')[0],
        availability_to: updatedDraft.availability_to?.toISOString().split('T')[0],
        min_stay_months: updatedDraft.min_stay_months,
        max_stay_months: updatedDraft.max_stay_months,
        bills_note: updatedDraft.bills_note,
        services: updatedDraft.services,
        photos: updatedDraft.photos,
        description: updatedDraft.description,
        preferred_gender: updatedDraft.preferred_gender,
        preferred_age_min: updatedDraft.preferred_age_min,
        preferred_age_max: updatedDraft.preferred_age_max,
        preferred_situation: updatedDraft.preferred_situation,
        step_completed: Math.max(updatedDraft.step_completed, currentStep),
        couples_accepted: updatedDraft.couples_accepted,
        pets_allowed: updatedDraft.pets_allowed,
        smoking_allowed: updatedDraft.smoking_allowed,
        status: 'draft' as const
      };

      if (updatedDraft.id) {
        await supabase
          .from('listings')
          .update(draftData)
          .eq('id', updatedDraft.id);
          
        // Handle amenities via separate tables after save
        if (updates.amenities_room || updates.amenities_property) {
          await handleAmenitiesUpdate(updatedDraft.id, updatedDraft);
        }
      } else {
        const { data, error } = await supabase
          .from('listings')
          .insert({ ...draftData, owner_id: profile.id })
          .select()
          .single();
        
        if (data && !error) {
          setDraft(prev => ({ ...prev, id: data.id }));
          
          // Create room entry and handle amenities for this listing
          await createRoomForListing(data.id, updatedDraft);
          await handleAmenitiesUpdate(data.id, updatedDraft);
          
          // Create lister profile if it doesn't exist
          await ensureListerProfile();
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση των αλλαγών.",
        variant: "destructive"
      });
    }
  };

  const nextStep = (updates?: Partial<ListingDraft>) => {
    if (updates) {
      saveDraft(updates);
    }
    
    let next = currentStep + 1;
    // Skip step 5 for apartments
    if (next === 5 && draft.property_type === 'apartment') {
      next = 6;
    }
    
    if (next <= 5) {
      setSearchParams({ step: next.toString() });
    }
  };

  const prevStep = () => {
    let prev = currentStep - 1;
    // Skip step 5 for apartments when going back
    if (prev === 5 && draft.property_type === 'apartment') {
      prev = 4;
    }
    
    if (prev >= 0) {
      setSearchParams({ step: prev.toString() });
    }
  };

  const handleRoleSelected = (role: 'individual' | 'agency') => {
    if (role === 'agency') {
      navigate('/agencies');
    } else {
      nextStep();
    }
  };

  // Helper function to update room amenities
  const updateRoomAmenities = async (listingId: string, amenities: string[]) => {
    try {
      // Find the room for this listing
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('listing_id', listingId)
        .single();

      if (!room) return;

      // Remove existing amenities
      await supabase
        .from('room_amenities')
        .delete()
        .eq('room_id', room.id);

      // Add new amenities
      if (amenities.length > 0) {
        const { data: amenityRecords } = await supabase
          .from('amenities')
          .select('id, name_en')
          .in('name_en', amenities);

        if (amenityRecords?.length > 0) {
          const roomAmenities = amenityRecords.map(amenity => ({
            room_id: room.id,
            amenity_id: amenity.id
          }));

          await supabase
            .from('room_amenities')
            .insert(roomAmenities);
        }
      }
    } catch (error) {
      console.error('Error updating room amenities:', error);
    }
  };

  // Helper function to create room for listing
  const createRoomForListing = async (listingId: string, listingData: ListingDraft) => {
    try {
      // Create room slug from listing title
      const slug = listingData.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + listingId.slice(0, 8);

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          listing_id: listingId,
          slug: slug,
          room_type: listingData.property_type === 'room' ? 'private' : 'entire_place',
          room_size_m2: listingData.room_size_m2 || listingData.property_size_m2,
          has_bed: listingData.bed_type ? true : false,
          is_interior: listingData.orientation === 'interior'
        })
        .select()
        .single();

      if (roomError) {
        console.error('Error creating room:', roomError);
        return;
      }

    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Helper function to ensure lister role is set
  const ensureListerProfile = async () => {
    if (!profile) return;
    
    try {
      // Update profile role to lister if not already set
      if (profile.role !== 'lister') {
        await supabase
          .from('profiles')
          .update({ role: 'lister' })
          .eq('user_id', profile.user_id);
      }
    } catch (error) {
      console.error('Error updating profile role to lister:', error);
    }
  };

  const publishListing = async () => {
    console.log('🚀 Starting publish process...');
    setIsPublishing(true);
    setPublishError(null);
    setPublishProgress(0);

    try {
      if (!draft.id) {
        const error = "Δεν υπάρχει αγγελία για δημοσίευση. Παρακαλώ αποθηκεύστε τα στοιχεία σας πρώτα.";
        setPublishError(error);
        toast({
          title: "Σφάλμα",
          description: error,
          variant: "destructive"
        });
        return;
      }

      setPublishingStage("Αποθήκευση αλλαγών...");
      setPublishProgress(10);
      console.log('💾 Saving current draft before validation...');
      await saveDraft({});

      setPublishingStage("Έλεγχος προφίλ...");
      setPublishProgress(20);
      console.log('👤 Checking profile completion...');
      if (!profile || profile.profile_completion_pct < 80) {
        console.log('❌ Profile completion check failed:', {
          profile: !!profile,
          completion: profile?.profile_completion_pct
        });
        setShowProfileModal(true);
        return;
      }
      console.log('✅ Profile completion check passed');

      setPublishingStage("Έλεγχος επαλήθευσης...");
      setPublishProgress(30);
      console.log('📱 Checking phone verification...');
      const phoneVerification = verifications.find(v => v.kind === 'phone');
      console.log('📱 Phone verification status:', {
        hasVerification: !!phoneVerification,
        status: phoneVerification?.status,
        allVerifications: verifications
      });
      if (!phoneVerification || phoneVerification.status !== 'verified') {
        console.log('❌ Phone verification required');
        setShowVerificationModal(true);
        return;
      }
      console.log('✅ Phone verification check passed');

      setPublishingStage("Επικύρωση στοιχείων...");
      setPublishProgress(40);
      console.log('🔍 Validating listing data...');
      const validationResult = await validateListing(draft);
      
      console.log('🔍 Validation result:', validationResult);
      if (validationResult.warnings.length > 0) {
        setPublishWarnings(validationResult.warnings);
        console.log('⚠️ Validation warnings found:', validationResult.warnings);
        
        if (!validationResult.canPublish) {
          const errorFields = validationResult.warnings
            .filter(w => w.severity === 'error')
            .map(w => w.message)
            .join(', ');
          const errorMsg = `Παρακαλώ διορθώστε: ${errorFields}`;
          console.log('❌ Validation errors prevent publishing:', errorMsg);
          setPublishError(errorMsg);
          toast({
            title: "Απαιτούνται διορθώσεις",
            description: errorMsg,
            variant: "destructive"
          });
          return;
        }
      }
      console.log('✅ Validation passed');

      setPublishingStage("Δημοσίευση αγγελίας...");
      setPublishProgress(60);
      console.log('📝 Using atomic publish function with transaction safety...');
      
      // Use atomic publishing function with transaction safety and Greek slug support
      const { data: result, error: atomicError } = await supabase.rpc(
        'publish_listing_atomic',
        {
          p_listing_id: draft.id!,
          p_room_slug: null // Let function generate Greek-safe slug
        }
      );

      if (atomicError) {
        console.error('Atomic publish error:', atomicError);
        throw new Error(`Publication failed: ${atomicError.message}`);
      }

      if (!result || typeof result !== 'object' || !(result as any).success) {
        console.error('Atomic publish failed:', result);
        throw new Error((result as any)?.error || 'Publication failed unexpectedly');
      }

      console.log('✅ Listing published atomically:', result);
      
      const atomicResult = result as { success: boolean; room_id: string; slug: string; listing_id: string; error?: string };

      // Insert photos into room_photos table
      if (draft.photos && draft.photos.length > 0 && atomicResult.room_id) {
        console.log('📸 Inserting photos into room_photos...');
        try {
          const roomPhotos = draft.photos
            .filter(photo => typeof photo === 'string' && photo.startsWith('http')) // Only proper URLs
            .map((photo, index) => ({
              room_id: atomicResult.room_id,
              url: photo as string,
              sort_order: index,
              alt_text: `Room photo ${index + 1}`
            }));

          if (roomPhotos.length > 0) {
            const { error: photosError } = await supabase
              .from('room_photos')
              .insert(roomPhotos);

            if (photosError) {
              console.error('Error inserting room photos:', photosError);
              // Don't fail the publish for photo insertion errors
            } else {
              console.log('✅ Room photos inserted successfully');
            }
          }
        } catch (error) {
          console.error('Error handling room photos:', error);
          // Don't fail the publish for photo errors
        }
      }

      setPublishingStage("Ενημέρωση αναζήτησης...");
      setPublishProgress(85);
      console.log('🔄 Refreshing search cache...');
      try {
        await refreshSearchCache();
        console.log('✅ Search cache refreshed successfully');
      } catch (error) {
        // Don't fail the entire publish if cache refresh fails
        console.warn('⚠️ Search cache refresh failed, but listing was published:', error);
      }

      setPublishingStage("Ολοκληρώθηκε!");
      setPublishProgress(100);

      console.log('✅ Listing published successfully!');
      
      // Show success message with celebration
      toast({
        title: "🎉 Επιτυχής δημοσίευση!",
        description: "Η αγγελία σας είναι τώρα διαθέσιμη στην αναζήτηση!"
      });

      // Small delay to show completion before navigating
      setTimeout(() => {
        navigate('/my-listings');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error publishing listing:', error);
      const errorMsg = error instanceof Error ? error.message : "Παρουσιάστηκε απρόσμενο σφάλμα κατά τη δημοσίευση";
      setPublishError(errorMsg);
      setPublishingStage("Σφάλμα δημοσίευσης");
      toast({
        title: "Σφάλμα δημοσίευσης",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
      setPublishProgress(0);
      setPublishingStage("");
    }
  };

  const handleProfileCompleted = async () => {
    setShowProfileModal(false);
    // Refetch profile to get updated completion percentage
    window.location.reload(); // Simple way to refresh profile data
    // Then attempt to publish again
    setTimeout(() => {
      publishListing();
    }, 1000);
  };

  const handleVerificationCompleted = async () => {
    setShowVerificationModal(false);
    // Refetch verifications to get updated status
    await refetchVerifications();
    // Then attempt to publish again
    setTimeout(() => {
      publishListing();
    }, 500);
  };

  const handleFixField = (field: string) => {
    // Navigate to appropriate step based on field
    const fieldStepMap: Record<string, number> = {
      title: 4,
      city: 1,
      price_month: 2,
      photos: 4,
      date_of_birth: 0 // Will redirect to profile
    };

    const targetStep = fieldStepMap[field];
    if (targetStep !== undefined) {
      if (field === 'date_of_birth') {
        navigate('/me');
      } else {
        setSearchParams({ step: targetStep.toString() });
      }
    }
    setPublishWarnings([]);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const maxStep = draft.property_type === 'apartment' ? 4 : 5;

  return (
    <>
      <Helmet>
        <title>Δημοσίευση αγγελίας | Hommi</title>
        <meta name="description" content="Δημιουργήστε την αγγελία σας στο Hommi" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Publish Warnings */}
          {publishWarnings.length > 0 && (
            <PublishWarningsBanner
              warnings={publishWarnings}
              onFixField={handleFixField}
              onDismiss={() => setPublishWarnings([])}
            />
          )}

          {/* Publish Errors */}
          {publishError && (
            <div className="mb-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="text-destructive font-medium">Σφάλμα δημοσίευσης</div>
                </div>
                <p className="text-sm text-destructive mt-1">{publishError}</p>
                <button 
                  onClick={() => setPublishError(null)}
                  className="text-xs text-destructive/70 hover:text-destructive mt-2 underline"
                >
                  Απόκρυψη
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Δημιουργία αγγελίας</h1>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Αποθήκευση...
                </div>
              )}
            </div>
            <AnimatedProgress
              currentStep={currentStep}
              totalSteps={STEPS.length}
              stepTitles={STEPS.map(s => s.title)}
              completedSteps={completedSteps}
            />
          </div>

          {/* Step Content with Transitions */}
          <StepTransition isVisible={currentStep === 0}>
            {currentStep === 0 && (
              <PublishStepZero onRoleSelected={handleRoleSelected} />
            )}
          </StepTransition>
          
          <StepTransition isVisible={currentStep === 1} direction="forward">
            {currentStep === 1 && (
              <PublishStepOne
                draft={draft}
                onUpdate={saveDraft}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
          </StepTransition>
          
          <StepTransition isVisible={currentStep === 2} direction="forward">
            {currentStep === 2 && (
              <PublishStepTwo
                draft={draft}
                onUpdate={saveDraft}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
          </StepTransition>
          
          <StepTransition isVisible={currentStep === 3} direction="forward">
            {currentStep === 3 && (
              <PublishStepThree
                draft={draft}
                onUpdate={saveDraft}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
          </StepTransition>
          
          <StepTransition isVisible={currentStep === 4} direction="forward">
            {currentStep === 4 && (
              <PublishStepFour
                draft={draft}
                onUpdate={saveDraft}
                onNext={draft.property_type === 'room' ? nextStep : publishListing}
                onPrev={prevStep}
                isLastStep={draft.property_type === 'apartment'}
              />
            )}
          </StepTransition>
          
          <StepTransition isVisible={currentStep === 5 && draft.property_type === 'room'} direction="forward">
            {currentStep === 5 && draft.property_type === 'room' && (
              <PublishStepFive
                draft={draft}
                onUpdate={saveDraft}
                onPublish={publishListing}
                onPrev={prevStep}
                isPublishing={isPublishing}
              />
            )}
          </StepTransition>
        </div>

        {/* Publishing Loading Overlay */}
        <LoadingOverlay
          isVisible={isPublishing}
          message={publishingStage || "Δημοσίευση σε εξέλιξη..."}
          progress={publishProgress}
        />

        {/* Enhanced Profile Completion Modal */}
        <PublishProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSuccess={handleProfileCompleted}
        />

        {/* Enhanced Verification Modal */}
        <PublishVerificationModal 
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationCompleted}
        />
      </div>
    </>
  );
}