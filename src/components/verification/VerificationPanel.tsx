import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Mail, Phone, Chrome, Facebook } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useVerifications } from '@/hooks/useVerifications';
import { useToast } from '@/hooks/use-toast';

export const VerificationPanel = () => {
  const { user, profile } = useAuth();
  const { verifications, verifyEmail, verifyPhone, linkGoogle, linkFacebook } = useVerifications();
  const { toast } = useToast();

  if (!user || !profile) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Επαληθευμένο';
      case 'pending':
        return 'Εκκρεμεί';
      default:
        return 'Μη επαληθευμένο';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleEmailVerification = async () => {
    const { error } = await verifyEmail();
    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η αποστολή email επαλήθευσης.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email εστάλη',
        description: 'Ελέγξτε το email σας για επαλήθευση.',
      });
    }
  };

  const handlePhoneVerification = async () => {
    const { error } = await verifyPhone();
    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η επαλήθευση τηλεφώνου.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Επιτυχής επαλήθευση',
        description: 'Το τηλέφωνό σας επαληθεύτηκε επιτυχώς!',
      });
    }
  };

  const handleGoogleLink = async () => {
    const { error } = await linkGoogle();
    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η σύνδεση με Google.',
        variant: 'destructive',
      });
    }
  };

  const handleFacebookLink = async () => {
    const { error } = await linkFacebook();
    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η σύνδεση με Facebook.',
        variant: 'destructive',
      });
    }
  };

  const emailVerification = verifications.find(v => v.kind === 'email');
  const phoneVerification = verifications.find(v => v.kind === 'phone');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Επαλήθευση στοιχείων
        </CardTitle>
        <CardDescription>
          Επαληθεύστε τα στοιχεία σας για μεγαλύτερη ασφάλεια και αξιοπιστία
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Verification */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(emailVerification?.status || 'unverified')}>
              {getStatusIcon(emailVerification?.status || 'unverified')}
              {getStatusText(emailVerification?.status || 'unverified')}
            </Badge>
            {emailVerification?.status !== 'verified' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailVerification}
                disabled={emailVerification?.status === 'pending'}
              >
                Επαλήθευση
              </Button>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Τηλέφωνο</p>
              <p className="text-sm text-muted-foreground">
                {phoneVerification?.value || 'Δεν έχει προστεθεί'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(phoneVerification?.status || 'unverified')}>
              {getStatusIcon(phoneVerification?.status || 'unverified')}
              {getStatusText(phoneVerification?.status || 'unverified')}
            </Badge>
            {phoneVerification?.status !== 'verified' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhoneVerification}
                disabled={phoneVerification?.status === 'pending'}
              >
                Επαλήθευση
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Σύνδεση λογαριασμών</h4>
          <div className="space-y-3">
            {/* Google Account */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chrome className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">
                    Συνδέστε τον λογαριασμό Google σας
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.google_connected ? (
                  <Badge variant="default">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Συνδεδεμένο
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleGoogleLink}>
                    Σύνδεση
                  </Button>
                )}
              </div>
            </div>

            {/* Facebook Account */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Facebook</p>
                  <p className="text-sm text-muted-foreground">
                    Συνδέστε τον λογαριασμό Facebook σας
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.facebook_connected ? (
                  <Badge variant="default">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Συνδεδεμένο
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleFacebookLink}>
                    Σύνδεση
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};