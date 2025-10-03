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
import { Camera, MapPin, Calendar, Star, Users, ExternalLink, Plus, X, Check, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ProfileCompletionBanner } from "@/components/onboarding/ProfileCompletionBanner";
import { ProfileCompletionModal } from "@/components/onboarding/ProfileCompletionModal";
import { ProfileEditModal } from "@/components/onboarding/ProfileEditModal";
import { ProfileField } from "@/components/profile/ProfileField";
import { VerificationPanel } from '@/components/verification/VerificationPanel';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type GenderType = 'male' | 'female' | 'other' | '';

interface FormData {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
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
    if (!profile) return false;
    
    // Show for tenants with less than 80% completion
    return profile.role === 'tenant' && (profile.profile_completion_pct || 0) < 80;
  };

  // Calculate missing fields for the banner
  const getMissingFields = () => {
    if (!profile) return [];
    const missing = [];
    
    // Core required fields for completion calculation
    if (!profile.first_name) missing.push('Όνομα');
    if (!profile.last_name) missing.push('Επώνυμο');
    if (!profile.date_of_birth) missing.push('Ηλικία');
    if (!profile.profession) missing.push('Επάγγελμα');
    if (!profile.country) missing.push('Χώρα');
    
    // Conditional extras based on what they do
    const whatYouDo = (profile.profile_extras as any)?.what_you_do;
    if (whatYouDo === 'study' || whatYouDo === 'study_work') {
      if (!(profile.profile_extras as any)?.study_level) {
        missing.push('Επίπεδο σπουδών');
      }
    }
    if (whatYouDo === 'work' || whatYouDo === 'study_work') {
      if (!(profile.profile_extras as any)?.work_profession) {
        missing.push('Τομέας εργασίας');
      }
    }
    
    return missing;
  };

  // Auto-show completion modal after onboarding
  useEffect(() => {
    const completedOnboarding = searchParams.get('completed_onboarding');
    if (completedOnboarding === 'true' && profile) {
      setShowCompletionModal(true);
      // Remove the parameter to avoid showing the modal again
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('completed_onboarding');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams, profile]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
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
    if (formData.gender && ['male', 'female', 'other'].includes(formData.gender)) {
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

  const getCountryLabel = (country: string): string => {
    const countries: Record<string, string> = {
      'GR': 'Ελλάδα',
      'CY': 'Κύπρος',
      'US': 'ΗΠΑ',
      'GB': 'Ηνωμένο Βασίλειο',
      'DE': 'Γερμανία',
      'FR': 'Γαλλία',
      'IT': 'Ιταλία',
      'ES': 'Ισπανία',
    };
    return countries[country] || country;
  };

  const getLanguageLabel = (code: string): string => {
    const languages: Record<string, string> = {
      'el': 'Ελληνικά',
      'en': 'Αγγλικά',
      'fr': 'Γαλλικά',
      'de': 'Γερμανικά',
      'it': 'Ιταλικά',
      'es': 'Ισπανικά',
    };
    return languages[code] || code;
  };

  const socialLinks = [
    { key: 'social_instagram' as keyof FormData, label: 'Instagram', icon: '📷' },
    { key: 'social_linkedin' as keyof FormData, label: 'LinkedIn', icon: '💼' },
    { key: 'social_twitter_x' as keyof FormData, label: 'Twitter/X', icon: '🐦' },
    // TikTok hidden for now
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
            <div className="mb-6" data-testid="profile-completion-banner">
              <ProfileCompletionBanner
                completionPercent={profile.profile_completion_pct || 0}
                onComplete={() => setShowCompletionModal(true)}
                missingFields={getMissingFields()}
              />
            </div>
          )}

          {/* Profile Completion Data as Bubbles */}
          {profile && profile.profile_extras && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Στοιχεία Προφίλ</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEditModal(true)}
                      data-testid="profile-details-edit-btn"
                    >
                      Επεξεργασία
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Professional & Study Info */}
                  {(profile.profession || profile.country) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Δραστηριότητα</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.profession && (
                          <Badge variant="secondary">{profile.profession}</Badge>
                        )}
                        {profile.country && (
                          <Badge variant="secondary">
                            {getCountryLabel(profile.country)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Γλώσσες</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang) => (
                          <Badge key={lang} variant="secondary">
                            {getLanguageLabel(lang)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                      {/* Profile Extras - Interest Bubbles */}
                      {(profile.profile_extras as any)?.personality && Array.isArray((profile.profile_extras as any).personality) && (profile.profile_extras as any).personality.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Προσωπικότητα</h4>
                          <div className="flex flex-wrap gap-2">
                            {(profile.profile_extras as any).personality.map((item: string) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lifestyle */}
                      {(profile.profile_extras as any)?.lifestyle && Array.isArray((profile.profile_extras as any).lifestyle) && (profile.profile_extras as any).lifestyle.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Στυλ ζωής</h4>
                          <div className="flex flex-wrap gap-2">
                            {(profile.profile_extras as any).lifestyle.map((item: string) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Music */}
                      {(profile.profile_extras as any)?.music && Array.isArray((profile.profile_extras as any).music) && (profile.profile_extras as any).music.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Μουσική</h4>
                          <div className="flex flex-wrap gap-2">
                            {(profile.profile_extras as any).music.map((item: string) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sports */}
                      {(profile.profile_extras as any)?.sports && Array.isArray((profile.profile_extras as any).sports) && (profile.profile_extras as any).sports.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Σπορ</h4>
                          <div className="flex flex-wrap gap-2">
                            {(profile.profile_extras as any).sports.map((item: string) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Movies */}
                      {(profile.profile_extras as any)?.movies && Array.isArray((profile.profile_extras as any).movies) && (profile.profile_extras as any).movies.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Ταινίες</h4>
                          <div className="flex flex-wrap gap-2">
                            {(profile.profile_extras as any).movies.map((item: string) => (
                              <Badge key={item} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Who's Moving */}
                      {(profile.profile_extras as any)?.who_moving && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Ποιος μετακομίζει</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {(profile.profile_extras as any).who_moving === 'just_me' ? 'Μόνος μου' : 'Με κάποιον'}
                            </Badge>
                          </div>
                        </div>
                      )}
                </CardContent>
              </Card>
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
                          {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;
                        
                        try {
                          // Upload to user-specific folder in avatars bucket
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                          
                          const { data, error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file, {
                              upsert: true
                            });

                          if (uploadError) {
                            throw uploadError;
                          }

                          // Get public URL
                          const { data: publicUrlData } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(data.path);

                          // Update profile with new avatar
                          const { error: updateError } = await updateProfile({
                            avatar_url: publicUrlData.publicUrl
                          });

                          if (updateError) {
                            throw updateError;
                          }

                          toast({
                            title: "Επιτυχία",
                            description: "Η φωτογραφία προφίλ ενημερώθηκε επιτυχώς",
                          });
                        } catch (error) {
                          console.error('Upload error:', error);
                          toast({
                            title: "Σφάλμα",
                            description: "Δεν ήταν δυνατή η αποθήκευση της φωτογραφίας. Βεβαιωθείτε ότι το αρχείο είναι εικόνα.",
                            variant: "destructive",
                          });
                        }
                      }}
                    />

                    <div className="space-y-2">
                      {/* Display name is read-only, computed from first/last name */}
                      <h2 className="text-xl font-semibold text-foreground">
                        {profile?.display_name || user?.email}
                      </h2>
                      
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
                  <div data-testid="field-about-me">
                    <ProfileField
                      type="textarea"
                      label="Σχετικά με εμένα"
                      value={formData.about_me}
                      onChange={(value) => setFormData({ ...formData, about_me: value })}
                      placeholder="Πείτε μας λίγα λόγια για εσάς..."
                      isEditing={isEditing}
                      maxLength={500}
                    />
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-testid="field-profession">
                      <ProfileField
                        type="text"
                        label="Επάγγελμα"
                        value={formData.profession}
                        onChange={(value) => setFormData({ ...formData, profession: value })}
                        placeholder="π.χ. Μηχανικός"
                        isEditing={isEditing}
                        isRequired={true}
                      />
                    </div>

                    <div data-testid="field-gender">
                      <ProfileField
                        type="select"
                        label="Φύλο"
                        value={formData.gender}
                        onChange={(value) => setFormData({ ...formData, gender: value as GenderType })}
                        placeholder="Επιλέξτε φύλο"
                        isEditing={isEditing}
                        options={[
                          { value: 'male', label: 'Άνδρας' },
                          { value: 'female', label: 'Γυναίκα' },
                          { value: 'other', label: 'Άλλο' }
                        ]}
                      />
                    </div>

                    <div data-testid="field-country">
                      <ProfileField
                        type="select"
                        label="Χώρα"
                        value={formData.country}
                        onChange={(value) => setFormData({ ...formData, country: value })}
                        placeholder="Επιλέξτε χώρα"
                        isEditing={isEditing}
                        isRequired={true}
                        options={[
                          { value: 'GR', label: 'Ελλάδα' },
                          { value: 'CY', label: 'Κύπρος' },
                          { value: 'US', label: 'Η.Π.Α.' },
                          { value: 'GB', label: 'Ηνωμένο Βασίλειο' },
                          { value: 'DE', label: 'Γερμανία' },
                          { value: 'FR', label: 'Γαλλία' }
                        ]}
                      />
                    </div>

                    <div data-testid="field-languages">
                      <ProfileField
                        type="multiselect"
                        label="Γλώσσες"
                        value={formData.languages}
                        onChange={(value) => setFormData({ ...formData, languages: value })}
                        isEditing={false} // Languages are not editable in this view for now
                        options={[
                          { value: 'el', label: 'Ελληνικά' },
                          { value: 'en', label: 'Αγγλικά' },
                          { value: 'fr', label: 'Γαλλικά' },
                          { value: 'de', label: 'Γερμανικά' },
                          { value: 'es', label: 'Ισπανικά' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Role Switching Section */}
                  {profile?.can_switch_roles ? (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium mb-2 block">Ρόλος</Label>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">
                            {profile.role === 'tenant' ? 'Ενοικιαστής' : 'Ιδιοκτήτης'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Μπορείτε να εναλλάξετε ρόλους οποτεδήποτε
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const newRole = profile.role === 'tenant' ? 'lister' : 'tenant';
                            const { error } = await supabase
                              .from('profiles')
                              .update({ role: newRole })
                              .eq('user_id', user.id);
                            
                            if (error) {
                              toast({
                                title: "Σφάλμα",
                                description: error.message || "Δεν ήταν δυνατή η αλλαγή ρόλου",
                                variant: "destructive"
                              });
                            } else {
                              toast({
                                title: "Επιτυχία",
                                description: "Ο ρόλος άλλαξε επιτυχώς"
                              });
                              window.location.reload();
                            }
                          }}
                        >
                          Αλλαγή σε {profile.role === 'tenant' ? 'Ιδιοκτήτη' : 'Ενοικιαστή'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium mb-2 block">Τύπος Λογαριασμού</Label>
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Home className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {profile?.lister_type === 'agency' ? 'Μεσιτικό Γραφείο' : 'Λογαριασμός Ιδιώτη'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Η εναλλαγή ρόλου δεν είναι διαθέσιμη για αυτόν τον τύπο λογαριασμού
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Listings Section - Only show for listers */}
                  {profile.role === 'lister' && (
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
                  )}
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
        data-testid="profile-completion-modal"
      />
      
      <ProfileEditModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data-testid="profile-edit-modal"
      />
    </>
  );
}