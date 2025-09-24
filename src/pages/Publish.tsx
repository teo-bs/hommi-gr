import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import PublishStepZero from "@/components/publish/PublishStepZero";
import PublishStepOne from "@/components/publish/PublishStepOne";
import PublishStepTwo from "@/components/publish/PublishStepTwo";
import PublishStepThree from "@/components/publish/PublishStepThree";
import PublishStepFour from "@/components/publish/PublishStepFour";
import PublishStepFive from "@/components/publish/PublishStepFive";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  // Load existing draft
  useEffect(() => {
    if (user) {
      loadDraft();
    }
  }, [user]);

  const loadDraft = async () => {
    if (!user) return;

    try {
      const { data: existingDraft } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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
          amenities_property: Array.isArray(existingDraft.amenities_property) ? existingDraft.amenities_property as string[] : [],
          amenities_room: Array.isArray(existingDraft.amenities_room) ? existingDraft.amenities_room as string[] : [],
          house_rules: Array.isArray(existingDraft.house_rules) ? existingDraft.house_rules as string[] : [],
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
    if (!user) return;

    const updatedDraft = { ...draft, ...updates };
    setDraft(updatedDraft);

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
        amenities_property: updatedDraft.amenities_property,
        amenities_room: updatedDraft.amenities_room,
        house_rules: updatedDraft.house_rules,
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
      } else {
        const { data, error } = await supabase
          .from('listings')
          .insert({ ...draftData, owner_id: user.id })
          .select()
          .single();
        
        if (data && !error) {
          setDraft(prev => ({ ...prev, id: data.id }));
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

  const publishListing = async () => {
    if (!draft.id) return;

    try {
      await supabase
        .from('listings')
        .update({ status: 'published' })
        .eq('id', draft.id);

      toast({
        title: "Επιτυχής δημοσίευση!",
        description: "Η αγγελία σας έχει δημοσιευτεί επιτυχώς."
      });

      navigate('/my-listings');
    } catch (error) {
      console.error('Error publishing listing:', error);
      toast({
        title: "Σφάλμα δημοσίευσης",
        description: "Δεν ήταν δυνατή η δημοσίευση της αγγελίας.",
        variant: "destructive"
      });
    }
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
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">Δημιουργία αγγελίας</h1>
              <span className="text-sm text-muted-foreground">
                Βήμα {currentStep + 1} από {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {STEPS[currentStep]?.title}
            </p>
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <PublishStepZero onRoleSelected={handleRoleSelected} />
          )}
          
          {currentStep === 1 && (
            <PublishStepOne
              draft={draft}
              onUpdate={saveDraft}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 2 && (
            <PublishStepTwo
              draft={draft}
              onUpdate={saveDraft}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <PublishStepThree
              draft={draft}
              onUpdate={saveDraft}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 4 && (
            <PublishStepFour
              draft={draft}
              onUpdate={saveDraft}
              onNext={draft.property_type === 'room' ? nextStep : publishListing}
              onPrev={prevStep}
              isLastStep={draft.property_type === 'apartment'}
            />
          )}
          
          {currentStep === 5 && draft.property_type === 'room' && (
            <PublishStepFive
              draft={draft}
              onUpdate={saveDraft}
              onPublish={publishListing}
              onPrev={prevStep}
            />
          )}
        </div>
      </div>
    </>
  );
}