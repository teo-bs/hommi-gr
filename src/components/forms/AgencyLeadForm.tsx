import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Building2, User, Mail, Phone, Globe, MessageSquare } from 'lucide-react';

const agencyLeadSchema = z.object({
  company_name: z.string()
    .trim()
    .min(2, 'Το όνομα της εταιρείας πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(100, 'Το όνομα της εταιρείας δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες'),
  contact_name: z.string()
    .trim()
    .min(2, 'Το όνομα επικοινωνίας πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(100, 'Το όνομα επικοινωνίας δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες'),
  email: z.string()
    .trim()
    .email('Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email')
    .max(255, 'Το email δεν μπορεί να υπερβαίνει τους 255 χαρακτήρες'),
  phone: z.string()
    .trim()
    .max(20, 'Το τηλέφωνο δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .trim()
    .url('Παρακαλώ εισάγετε μια έγκυρη διεύθυνση ιστοσελίδας')
    .max(255, 'Η ιστοσελίδα δεν μπορεί να υπερβαίνει τους 255 χαρακτήρες')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .trim()
    .max(1000, 'Το μήνυμα δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες')
    .optional()
    .or(z.literal(''))
});

type AgencyLeadFormData = z.infer<typeof agencyLeadSchema>;

interface AgencyLeadFormProps {
  onSubmitSuccess?: () => void;
}

export const AgencyLeadForm = ({ onSubmitSuccess }: AgencyLeadFormProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isPendingAgency = profile?.account_status === 'pending_qualification';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<AgencyLeadFormData>({
    resolver: zodResolver(agencyLeadSchema)
  });

  // Pre-fill form values if authenticated
  useEffect(() => {
    if (user && profile) {
      setValue('email', profile.email);
      setValue('contact_name', profile.display_name || '');
    }
  }, [user, profile, setValue]);

  const onSubmit = async (data: AgencyLeadFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-agency-lead', {
        body: {
          company_name: data.company_name,
          contact_name: data.contact_name,
          email: data.email,
          phone: data.phone || null,
          website: data.website || null,
          message: data.message || null,
          user_id: user?.id || null, // NEW: Pass user_id if authenticated
        }
      });

      if (error) {
        console.error('Error submitting agency lead:', error);
        toast({
          title: "Σφάλμα αποστολής",
          description: "Κάτι πήγε στραβά κατά την αποστολή του αιτήματος. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive"
        });
        return;
      }

      // Success
      setIsSubmitted(true);
      reset();
      
      // Call success callback to trigger banner
      onSubmitSuccess?.();
      
      toast({
        title: "Επιτυχής αποστολή!",
        description: "Το αίτημά σας στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error submitting agency lead:', error);
      toast({
        title: "Σφάλμα αποστολής",
        description: "Κάτι πήγε στραβά κατά την αποστολή του αιτήματος. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ευχαριστούμε!</h3>
          <p className="text-muted-foreground mb-4">
            Το αίτημά σας έχει σταλεί επιτυχώς. Ένας εκπρόσωπός μας θα επικοινωνήσει μαζί σας εντός 24 ωρών.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
          >
            Αποστολή νέου αιτήματος
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Κλείστε Ραντεβού
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Όνομα Εταιρείας *
              </Label>
              <Input
                id="company_name"
                {...register('company_name')}
                placeholder="π.χ. ABC Properties"
                disabled={isSubmitting}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Όνομα Επικοινωνίας *
              </Label>
              <Input
                id="contact_name"
                {...register('contact_name')}
                placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                disabled={isSubmitting}
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contact_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="π.χ. info@company.gr"
                disabled={isSubmitting || !!user}
                className={user ? 'bg-muted' : ''}
              />
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Email από τον λογαριασμό σας
                </p>
              )}
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Τηλέφωνο
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="π.χ. +30 210 1234567"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Ιστοσελίδα
            </Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="π.χ. https://www.company.gr"
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-sm text-destructive mt-1">
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Μήνυμα
            </Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Πείτε μας περισσότερα για την εταιρεία σας και πώς μπορούμε να σας βοηθήσουμε..."
              rows={4}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Αποστολή...' : 'Αποστολή Αιτήματος'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            * Υποχρεωτικά πεδία. Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};