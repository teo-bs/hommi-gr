import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Calendar, Star, Users, ExternalLink, Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ProfileCompletionBanner } from "@/components/onboarding/ProfileCompletionBanner";
import { ProfileCompletionModal } from "@/components/onboarding/ProfileCompletionModal";
import { VerificationPanel } from '@/components/verification/VerificationPanel';
import { supabase } from "@/integrations/supabase/client";

type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';

interface FormData {
  display_name: string;
  about_me: string;
  profession: string;
  gender: GenderType;
  country: string;
  languages: string[];
  social_instagram: string;
  social_linkedin: string;
  social_twitter_x: string;
  social_tiktok: string;
}

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    display_name: profile?.display_name || '',
    about_me: profile?.about_me || '',
    profession: profile?.profession || '',
    gender: (profile?.gender as GenderType) || '',
    country: profile?.country || 'GR',
    languages: profile?.languages || ['el'],
    social_instagram: profile?.social_instagram || '',
    social_linkedin: profile?.social_linkedin || '',
    social_twitter_x: profile?.social_twitter_x || '',
    social_tiktok: profile?.social_tiktok || '',
  });

  // Fetch onboarding progress
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'tenant')
        .maybeSingle();
      
      setOnboardingProgress(data);
    };

    fetchOnboardingProgress();
  }, [user]);

  // Check if we should show completion banner
  const shouldShowCompletionBanner = () => {
    if (!profile || !onboardingProgress) return false;
    
    // Show if basic onboarding is done (steps 1-3) but profile completion is low
    const basicOnboardingDone = onboardingProgress.completed_steps?.includes(3);
    const profileIncomplete = (profile.profile_completion_pct || 0) < 80;
    
    return basicOnboardingDone && profileIncomplete;
  };

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        about_me: profile.about_me || '',
        profession: profile.profession || '',
        gender: (profile.gender as GenderType) || '',
        country: profile.country || 'GR',
        languages: profile.languages || ['el'],
        social_instagram: profile.social_instagram || '',
        social_linkedin: profile.social_linkedin || '',
        social_twitter_x: profile.social_twitter_x || '',
        social_tiktok: profile.social_tiktok || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const updateData: any = {
      display_name: formData.display_name,
      about_me: formData.about_me,
      profession: formData.profession,
      country: formData.country,
      languages: formData.languages,
      social_instagram: formData.social_instagram,
      social_linkedin: formData.social_linkedin,
      social_twitter_x: formData.social_twitter_x,
      social_tiktok: formData.social_tiktok,
    };
    
    // Only add gender if it's a valid value
    if (formData.gender && ['male', 'female', 'other', 'prefer_not_to_say'].includes(formData.gender)) {
      updateData.gender = formData.gender;
    }
    
    const { error } = await updateProfile(updateData);
    
    if (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ενημέρωση του προφίλ",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(false);
    toast({
      title: "Επιτυχία",
      description: "Το προφίλ σας ενημερώθηκε επιτυχώς",
    });
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile?.display_name || '',
      about_me: profile?.about_me || '',
      profession: profile?.profession || '',
      gender: (profile?.gender as GenderType) || '',
      country: profile?.country || 'GR',
      languages: profile?.languages || ['el'],
      social_instagram: profile?.social_instagram || '',
      social_linkedin: profile?.social_linkedin || '',
      social_twitter_x: profile?.social_twitter_x || '',
      social_tiktok: profile?.social_tiktok || '',
    });
    setIsEditing(false);
  };

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const formatMemberSince = () => {
    if (!profile?.member_since) return '';
    const date = new Date(profile.member_since);
    return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long' });
  };

  const socialLinks = [
    { key: 'social_instagram' as keyof FormData, label: 'Instagram', icon: '📷' },
    { key: 'social_linkedin' as keyof FormData, label: 'LinkedIn', icon: '💼' },
    { key: 'social_twitter_x' as keyof FormData, label: 'Twitter/X', icon: '🐦' },
    { key: 'social_tiktok' as keyof FormData, label: 'TikTok', icon: '🎵' },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Φόρτωση προφίλ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Το προφίλ μου</h1>
            <p className="text-muted-foreground">Διαχειρίστε τις πληροφορίες του προφίλ σας</p>
          </div>

          {/* Completion Banner */}
          {shouldShowCompletionBanner() && (
            <div className="mb-6">
              <ProfileCompletionBanner
                completionPercent={profile.profile_completion_pct || 0}
                onComplete={() => setShowCompletionModal(true)}
              />
            </div>
          )}


          {/* ... keep existing profile content ... */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Image & Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-2xl">
                          {formData.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        // Handle image upload logic here
                        console.log('Image upload:', e.target.files?.[0]);
                      }}
                    />

                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          placeholder="Πλήρες όνομα"
                          className="text-center font-semibold"
                        />
                      ) : (
                        <h2 className="text-xl font-semibold text-foreground">
                          {formData.display_name || user?.email}
                        </h2>
                      )}
                      
                      {getAge() && (
                        <p className="text-muted-foreground">
                          {getAge()} ετών
                        </p>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Μέλος από {formatMemberSince()}</span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>12 κριτικές</span> {/* Placeholder */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Κοινωνικά δίκτυα</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {socialLinks.map((social) => (
                      <div key={social.key}>
                        <Label className="text-sm font-medium">{social.label}</Label>
                        {isEditing ? (
                          <Input
                            value={formData[social.key] as string}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              [social.key]: e.target.value 
                            })}
                            placeholder={`${social.label} username`}
                            className="mt-1"
                          />
                        ) : formData[social.key] ? (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{social.icon}</span>
                            <span>{formData[social.key] as string}</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground italic">Δεν έχει προστεθεί</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Πληροφορίες προφίλ</CardTitle>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          Ακύρωση
                        </Button>
                        <Button onClick={handleSave}>
                          Αποθήκευση
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Επεξεργασία
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* About Me */}
                  <div>
                    <Label className="text-sm font-medium">Σχετικά με εμένα</Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.about_me}
                        onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                        placeholder="Πείτε μας λίγα λόγια για εσάς..."
                        className="mt-1 min-h-[100px]"
                      />
                    ) : (
                      <p className="mt-1 text-foreground whitespace-pre-wrap">
                        {formData.about_me || "Δεν έχει προστεθεί περιγραφή"}
                      </p>
                    )}
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Επάγγελμα</Label>
                      {isEditing ? (
                        <Input
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          placeholder="π.χ. Μηχανικός"
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-foreground">
                          {formData.profession || "Δεν έχει προστεθεί"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Φύλο</Label>
                      {isEditing ? (
                        <Select
                          value={formData.gender}
                          onValueChange={(value: GenderType) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Επιλέξτε φύλο" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Άνδρας</SelectItem>
                            <SelectItem value="female">Γυναίκα</SelectItem>
                            <SelectItem value="other">Άλλο</SelectItem>
                            <SelectItem value="prefer_not_to_say">Προτιμώ να μην απαντήσω</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-foreground">
                          {formData.gender === 'male' ? 'Άνδρας' :
                           formData.gender === 'female' ? 'Γυναίκα' :
                           formData.gender === 'other' ? 'Άλλο' :
                           formData.gender === 'prefer_not_to_say' ? 'Προτιμώ να μην απαντήσω' :
                           'Δεν έχει προστεθεί'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Χώρα</Label>
                      {isEditing ? (
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Επιλέξτε χώρα" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GR">Ελλάδα</SelectItem>
                            <SelectItem value="CY">Κύπρος</SelectItem>
                            <SelectItem value="US">Η.Π.Α.</SelectItem>
                            <SelectItem value="GB">Ηνωμένο Βασίλειο</SelectItem>
                            <SelectItem value="DE">Γερμανία</SelectItem>
                            <SelectItem value="FR">Γαλλία</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-foreground">
                          {formData.country === 'GR' ? 'Ελλάδα' :
                           formData.country === 'CY' ? 'Κύπρος' :
                           formData.country || 'Δεν έχει προστεθεί'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Γλώσσες</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary">
                            {lang === 'el' ? 'Ελληνικά' :
                             lang === 'en' ? 'Αγγλικά' :
                             lang === 'fr' ? 'Γαλλικά' :
                             lang === 'de' ? 'Γερμανικά' :
                             lang === 'es' ? 'Ισπανικά' :
                             lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Listings Section */}
                  <div>
                    <Label className="text-sm font-medium">Δημοσιευμένες αγγελίες</Label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Δεν έχετε δημοσιεύσει ακόμη αγγελίες
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Δημιουργία αγγελίας
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Verification Panel */}
          <div className="mt-6">
            <VerificationPanel />
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </>
  );
}