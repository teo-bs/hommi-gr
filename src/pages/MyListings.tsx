import { Helmet } from "react-helmet-async";
import { List, Plus, Settings, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const MyListings = () => {
  return (
    <>
      <Helmet>
        <title>Οι Αγγελίες Μου - Hommi</title>
        <meta 
          name="description" 
          content="Διαχειριστείτε τις αγγελίες σας στο Hommi. Δείτε στατιστικά, επεξεργαστείτε και διαχειριστείτε τις δημοσιεύσεις σας." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Οι Αγγελίες Μου
                </h1>
                <p className="text-muted-foreground">
                  Διαχειριστείτε και παρακολουθήστε τις αγγελίες σας
                </p>
              </div>
              
              <Link to="/publish">
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Νέα Αγγελία
                </Button>
              </Link>
            </div>

            {/* Empty State */}
            <Card className="text-center py-12">
              <CardContent className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <List className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Δεν έχετε δημιουργήσει αγγελίες ακόμα
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ξεκινήστε να δημοσιεύετε τους χώρους σας και προσελκύστε 
                    τους ιδανικούς συγκατοίκους. Η διαδικασία είναι γρήγορη και εύκολη.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/publish">
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Δημιουργία Αγγελίας
                    </Button>
                  </Link>
                  
                  <Link to="/help">
                    <Button variant="outline" className="gap-2">
                      Οδηγός Δημοσίευσης
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  💡 Συμβουλές για Επιτυχημένες Αγγελίες
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Προσθέστε τουλάχιστον 5 φωτογραφίες υψηλής ποιότητας
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Γράψτε λεπτομερή περιγραφή με τις παροχές και τους κανόνες
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Καθορίστε σαφή τιμή και διαθεσιμότητα
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Απαντήστε γρήγορα στα μηνύματα για καλύτερα αποτελέσματα
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyListings;