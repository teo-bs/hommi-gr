import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useVerifications } from "@/hooks/useVerifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, Shield, CheckCircle2, Upload, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PublishStepEightProps {
  onNext: () => void;
  onBack: () => void;
}

const PublishStepEight = ({ onNext, onBack }: PublishStepEightProps) => {
  const { user, profile } = useAuth();
  const { verifications, loading: verificationsLoading, verifyEmail, refetch } = useVerifications();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUploadingIDFront, setIsUploadingIDFront] = useState(false);
  const [isUploadingIDBack, setIsUploadingIDBack] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [uploadedIDFront, setUploadedIDFront] = useState<string | null>(null);
  const [uploadedIDBack, setUploadedIDBack] = useState<string | null>(null);

  // Calculate trust score
  const calculateTrustScore = () => {
    let score = 0;
    const emailVerified = verifications.find(v => v.kind === 'email' && v.status === 'verified');
    const phoneVerified = verifications.find(v => v.kind === 'phone' && v.status === 'verified');
    const idFrontVerified = verifications.find(v => v.kind === 'govgr' && (v.metadata as any)?.side === 'front' && v.status === 'verified');
    const idBackVerified = verifications.find(v => v.kind === 'govgr' && (v.metadata as any)?.side === 'back' && v.status === 'verified');

    if (emailVerified) score += 10;
    if (phoneVerified) score += 15;
    // Full ID verification bonus only if both sides verified
    if (idFrontVerified && idBackVerified) score += 25;

    return score;
  };

  const trustScore = calculateTrustScore();

  const emailVerification = verifications.find(v => v.kind === 'email');
  const phoneVerification = verifications.find(v => v.kind === 'phone');
  const idVerificationFront = verifications.find(v => v.kind === 'govgr' && (v.metadata as any)?.side === 'front');
  const idVerificationBack = verifications.find(v => v.kind === 'govgr' && (v.metadata as any)?.side === 'back');
  
  // Check if both sides are verified or pending
  const bothIDSidesUploaded = idVerificationFront && idVerificationBack;
  const idFullyVerified = idVerificationFront?.status === 'verified' && idVerificationBack?.status === 'verified';

  const normalizeGreekPhone = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 30, it's already in international format
    if (cleaned.startsWith('30')) {
      return '+' + cleaned;
    }
    
    // If starts with 69, add +30
    if (cleaned.startsWith('69')) {
      return '+30' + cleaned;
    }
    
    // If starts with 0, replace with +30
    if (cleaned.startsWith('0')) {
      return '+30' + cleaned.substring(1);
    }
    
    // Otherwise add +30
    return '+30' + cleaned;
  };

  const handleEmailVerify = async () => {
    const result = await verifyEmail();
    if (!result.error) {
      toast({
        title: "Επιτυχία",
        description: "Σας στείλαμε email επαλήθευσης. Ελέγξτε τα εισερχόμενά σας.",
      });
    } else {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αποστολή email επαλήθευσης.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneVerify = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε έγκυρο αριθμό τηλεφώνου",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const normalized = normalizeGreekPhone(phoneNumber);
      
      // Create pending verification
      const { error } = await supabase.from('verifications').insert({
        user_id: user!.id,
        kind: 'phone',
        value: normalized,
        status: 'pending',
        metadata: {
          method: 'manual',
          requested_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      await refetch();
      toast({
        title: "Επιτυχία",
        description: "Το αίτημα επαλήθευσης στάλθηκε. Θα σας ειδοποιήσουμε όταν επαληθευτεί.",
      });
      setPhoneNumber("");
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η αποστολή αιτήματος επαλήθευσης",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleIDUpload = async (file: File, side: 'front' | 'back') => {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Σφάλμα",
        description: "Μόνο εικόνες (JPG, PNG) ή PDF επιτρέπονται",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "Σφάλμα",
        description: "Το αρχείο πρέπει να είναι μικρότερο από 5MB",
        variant: "destructive",
      });
      return;
    }

    const setUploading = side === 'front' ? setIsUploadingIDFront : setIsUploadingIDBack;
    const setUploaded = side === 'front' ? setUploadedIDFront : setUploadedIDBack;
    
    setUploading(true);
    try {
      // Upload to storage
      const timestamp = Date.now();
      const fileName = `id-${side}-${timestamp}.${file.name.split('.').pop()}`;
      const filePath = `${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      // Create verification record
      const { error: verificationError } = await supabase.from('verifications').insert({
        user_id: user!.id,
        kind: 'govgr',
        value: publicUrl,
        status: 'pending',
        metadata: {
          side: side,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        }
      });

      if (verificationError) throw verificationError;

      setUploaded(publicUrl);
      await refetch();
      
      // Enhanced user feedback
      toast({
        title: "Επιτυχία",
        description: `Η ${side === 'front' ? 'μπροστινή' : 'πίσω'} όψη ανέβηκε. Θα ελέγξουμε την ταυτότητά σας εντός 24 ωρών.`,
        duration: 5000
      });

      // Trigger admin notification if both sides uploaded
      const bothSidesNow = (side === 'front' && (idVerificationBack || uploadedIDBack)) || 
                          (side === 'back' && (idVerificationFront || uploadedIDFront));
      
      if (bothSidesNow) {
        try {
          await supabase.functions.invoke('notify-admin-verification', {
            body: { 
              user_id: user!.id,
              verification_type: 'govgr',
              user_email: profile?.email
            }
          });
        } catch (err) {
          console.error('Failed to notify admin:', err);
          // Don't show error to user - notification failure shouldn't block upload
        }
      }
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η μεταφόρτωση του εγγράφου",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const renderVerificationCard = (
    icon: React.ReactNode,
    title: string,
    description: string,
    points: number,
    status: 'verified' | 'pending' | 'unverified',
    action?: React.ReactNode
  ) => {
    return (
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{title}</h3>
              {status === 'verified' ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Επαληθευμένο
                </Badge>
              ) : status === 'pending' ? (
                <Badge variant="secondary" className="gap-1">
                  Εκκρεμεί
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  Μη επαληθευμένο
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-sm font-medium text-primary">
              Κερδίστε +{points} πόντους εμπιστοσύνης
            </p>
            {action && <div className="pt-2">{action}</div>}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Επαληθεύσεις (Προαιρετικό)</h2>
        <p className="text-muted-foreground">
          Επαληθεύστε την ταυτότητά σας για να αυξήσετε την εμπιστοσύνη και να λαμβάνετε περισσότερες αιτήσεις
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Οι επαληθεύσεις είναι προαιρετικές αλλά προτεινόμενες. Αυξάνουν την εμπιστοσύνη των ενοικιαστών και βελτιώνουν την ορατότητα της αγγελίας σας.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Email Verification */}
        {renderVerificationCard(
          <Mail className="h-5 w-5 text-primary" />,
          'Email',
          profile?.email || 'Επαλήθευση email',
          10,
          emailVerification?.status === 'verified' ? 'verified' : emailVerification?.status === 'pending' ? 'pending' : 'unverified',
          !emailVerification || emailVerification.status === 'unverified' ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEmailVerify}
              disabled={verificationsLoading}
            >
              Αποστολή email επαλήθευσης
            </Button>
          ) : null
        )}

        {/* Phone Verification */}
        {renderVerificationCard(
          <Phone className="h-5 w-5 text-primary" />,
          'Τηλέφωνο',
          phoneVerification?.value || 'Επαλήθευση μέσω τηλεφώνου',
          15,
          phoneVerification?.status === 'verified' ? 'verified' : phoneVerification?.status === 'pending' ? 'pending' : 'unverified',
          !phoneVerification || phoneVerification.status === 'unverified' ? (
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+30 69X XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePhoneVerify}
                disabled={isVerifyingPhone || !phoneNumber.trim()}
              >
                Επαλήθευση
              </Button>
            </div>
          ) : null
        )}

        {/* ID Upload - Two Sides */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ταυτότητα (Δύο όψεις)</h3>
                {idFullyVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Επαληθευμένο
                  </Badge>
                ) : bothIDSidesUploaded ? (
                  <Badge variant="secondary" className="gap-1">
                    Εκκρεμεί
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    Μη επαληθευμένο
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Ανεβάστε και τις δύο όψεις της ταυτότητάς σας για πλήρη επαλήθευση
              </p>
              <p className="text-sm font-medium text-primary">
                Κερδίστε +25 πόντους εμπιστοσύνης
              </p>
              
              {/* Two-sided upload UI */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Front Side */}
                <div className="space-y-2">
                  <div className="aspect-[3/2] border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30 relative overflow-hidden">
                    {idVerificationFront || uploadedIDFront ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-xs font-medium">Μπροστινή όψη ✓</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-xs font-medium">Μπροστινή όψη</p>
                      </>
                    )}
                  </div>
                  {!idVerificationFront && !uploadedIDFront && (
                    <>
                      <label htmlFor="id-upload-front">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                          disabled={isUploadingIDFront}
                        >
                          <div className="cursor-pointer">
                            {isUploadingIDFront ? 'Μεταφόρτωση...' : 'Επιλογή αρχείου'}
                          </div>
                        </Button>
                      </label>
                      <input
                        id="id-upload-front"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIDUpload(file, 'front');
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Back Side */}
                <div className="space-y-2">
                  <div className="aspect-[3/2] border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30 relative overflow-hidden">
                    {idVerificationBack || uploadedIDBack ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-xs font-medium">Πίσω όψη ✓</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-xs font-medium">Πίσω όψη</p>
                      </>
                    )}
                  </div>
                  {!idVerificationBack && !uploadedIDBack && (
                    <>
                      <label htmlFor="id-upload-back">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                          disabled={isUploadingIDBack}
                        >
                          <div className="cursor-pointer">
                            {isUploadingIDBack ? 'Μεταφόρτωση...' : 'Επιλογή αρχείου'}
                          </div>
                        </Button>
                      </label>
                      <input
                        id="id-upload-back"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIDUpload(file, 'back');
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground pt-1">
                {bothIDSidesUploaded ? (
                  <span className="text-green-600 font-medium">✓ Και οι δύο όψεις ανέβηκαν</span>
                ) : idVerificationFront || uploadedIDFront ? (
                  <span>1/2 όψεις ανέβηκαν - Ανεβάστε την πίσω όψη</span>
                ) : (
                  <span>Αποδεκτά: Δελτίο Ταυτότητας, Διαβατήριο, Άδεια Οδήγησης (μέγιστο 5MB ανά όψη)</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Trust Score Preview */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Πόντοι Εμπιστοσύνης</h3>
            <p className="text-sm text-muted-foreground">
              Όσο περισσότερες επαληθεύσεις, τόσο υψηλότερη η εμπιστοσύνη
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{trustScore}/50</div>
            <div className="text-xs text-muted-foreground">πόντοι</div>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Πίσω
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext}>
            Παράλειψη για τώρα
          </Button>
          <Button onClick={onNext}>
            Συνέχεια
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublishStepEight;

