import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifications } from "@/hooks/useVerifications";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Phone, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PublishVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PublishVerificationModal = ({ isOpen, onClose, onSuccess }: PublishVerificationModalProps) => {
  const { verifications, verifyPhone, refetch } = useVerifications();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneVerification = verifications.find(v => v.kind === 'phone');

  const validatePhoneNumber = (phone: string) => {
    // Basic Greek phone number validation
    const phoneRegex = /^(\+30|0030|30)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      newErrors.phone = "Το τηλέφωνο είναι υποχρεωτικό";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = "Παρακαλώ εισάγετε έγκυρο ελληνικό αριθμό τηλεφώνου";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      // Store phone number first if not already stored
      const { error } = await verifyPhone(phoneNumber);
      
      if (error) {
        toast({
          title: 'Σφάλμα',
          description: 'Δεν ήταν δυνατή η επαλήθευση τηλεφώνου.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Επιτυχής επαλήθευση',
        description: 'Το τηλέφωνό σας επαληθεύτηκε επιτυχώς!',
      });

      // Refetch verifications to get updated status
      await refetch();
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectVerification = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await verifyPhone();
      
      if (error) {
        toast({
          title: 'Σφάλμα',
          description: 'Δεν ήταν δυνατή η επαλήθευση τηλεφώνου.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Επιτυχής επαλήθευση',
        description: 'Το τηλέφωνό σας επαληθεύτηκε επιτυχώς!',
      });

      await refetch();
      onSuccess();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPhoneVerified = phoneVerification?.status === 'verified';
  const hasPhoneNumber = phoneVerification?.value;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Επαλήθευση τηλεφώνου
          </DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Η επαλήθευση τηλεφώνου είναι απαραίτητη για τη δημοσίευση αγγελιών. Αυτό βοηθά στη διασφάλιση της ασφάλειας της πλατφόρμας.
          </AlertDescription>
        </Alert>

        {isPhoneVerified ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Το τηλέφωνό σας είναι επαληθευμένο!</h3>
            <p className="text-muted-foreground mb-4">
              Μπορείτε τώρα να προχωρήσετε με τη δημοσίευση της αγγελίας σας.
            </p>
            <Button onClick={onSuccess}>
              Συνέχεια με δημοσίευση
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {hasPhoneNumber ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Τηλέφωνο: {phoneVerification?.value}</p>
                    <p className="text-sm text-muted-foreground">
                      Κάντε κλικ παρακάτω για επαλήθευση
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Ακύρωση
                  </Button>
                  <Button onClick={handleDirectVerification} disabled={isSubmitting}>
                    {isSubmitting ? 'Επαλήθευση...' : 'Επαλήθευση τηλεφώνου'}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePhoneVerification} className="space-y-4">
                <div>
                  <Label htmlFor="phone">
                    Αριθμός τηλεφώνου <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="π.χ. 6912345678 ή +306912345678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Εισάγετε τον αριθμό τηλεφώνου σας για επαλήθευση
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Ακύρωση
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Επαλήθευση...' : 'Επαλήθευση τηλεφώνου'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};