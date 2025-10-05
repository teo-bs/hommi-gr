import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Calendar, Users, TrendingUp, Mail, Phone, AlertCircle } from "lucide-react";
import { AgencyLeadForm } from "@/components/forms/AgencyLeadForm";
import { useAuth } from "@/hooks/useAuth";

export default function Agencies() {
  const { user, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  
  const isPendingAgency = profile?.account_status === 'pending_qualification';
  
  // Auto-show form for pending agencies
  useEffect(() => {
    if (isPendingAgency) {
      setShowForm(true);
    }
  }, [isPendingAgency]);

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Εξειδικευμένη υποστήριξη",
      description: "Αφιερωμένος σύμβουλος για όλες τις ανάγκες σας"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Προηγμένα analytics",
      description: "Λεπτομερή στατιστικά απόδοσης των αγγελιών σας"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Prioritized listings",
      description: "Οι αγγελίες σας εμφανίζονται πρώτες στα αποτελέσματα"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Bulk operations",
      description: "Διαχείριση πολλαπλών ιδιοκτησιών ταυτόχρονα"
    }
  ];

  const handleBookCall = () => {
    setShowForm(true);
  };

  return (
    <>
      <Helmet>
        <title>Υπηρεσίες για Κτηματομεσίτες | Hommi</title>
        <meta name="description" content="Εξειδικευμένες λύσεις για κτηματομεσιτικά γραφεία και επαγγελματίες του real estate" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {isPendingAgency ? (
            // Minimal view for pending agencies: only form + banner after submission
            <>
              {isFormSubmitted && (
                <Alert className="mb-8 border-primary bg-primary/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ο λογαριασμός σας ελέγχεται</AlertTitle>
                  <AlertDescription>
                    Η ομάδα μας θα επικοινωνήσει σύντομα μαζί σας για να ολοκληρώσει την εγγραφή σας.
                    Ευχαριστούμε για την υπομονή σας!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mb-12">
                <AgencyLeadForm onSubmitSuccess={() => setIsFormSubmitted(true)} />
              </div>
            </>
          ) : (
            // Full marketing page for regular visitors
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  Λύσεις για Κτηματομεσίτες
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Εξειδικευμένες υπηρεσίες για κτηματομεσιτικά γραφεία που θέλουν να 
                  μεγιστοποιήσουν τη διαχείριση και την απόδοση των ιδιοκτησιών τους.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleBookCall} 
                  disabled={isPendingAgency}
                  className="text-lg px-8 py-3"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {isPendingAgency ? 'Αίτημα σε εξέλιξη' : 'Κλείστε συνάντηση'}
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {features.map((feature, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              {showForm && (
                <div className="mb-12">
                  <AgencyLeadForm />
                </div>
              )}

              {/* CTA Section */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">
                    Ξεκινήστε σήμερα
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Κλείστε μια δωρεάν συνάντηση για να συζητήσουμε πως το Hommi 
                    μπορεί να βελτιώσει τις επιδόσεις του γραφείου σας.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      onClick={handleBookCall} 
                      disabled={isPendingAgency}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {isPendingAgency ? 'Αίτημα σε εξέλιξη' : 'Κλείστε συνάντηση'}
                    </Button>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Ή καλέστε μας: +30 210 123 4567</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer Note */}
              <div className="text-center mt-8 text-sm text-muted-foreground">
                <p>
                  Οι υπηρεσίες για κτηματομεσίτες θα είναι διαθέσιμες σύντομα. 
                  Κλείστε συνάντηση για πρώτη πρόσβαση.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}