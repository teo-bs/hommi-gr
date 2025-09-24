import { Helmet } from "react-helmet-async";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Favourites = () => {
  return (
    <>
      <Helmet>
        <title>Αγαπημένα - Hommi</title>
        <meta 
          name="description" 
          content="Δείτε τις αγαπημένες σας αγγελίες στο Hommi. Βρείτε εύκολα τους χώρους που σας άρεσαν περισσότερο." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Αγαπημένα
              </h1>
              <p className="text-muted-foreground">
                Οι αγγελίες που έχετε σημειώσει ως αγαπημένες
              </p>
            </div>

            {/* Empty State */}
            <Card className="text-center py-12">
              <CardContent className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Δεν έχετε αγαπημένες αγγελίες ακόμα
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ξεκινήστε να εξερευνάτε αγγελίες και σημειώστε όσες σας αρέσουν 
                    πατώντας την καρδιά για να τις βρίσκετε εύκολα εδώ.
                  </p>
                </div>

                <Link to="/search">
                  <Button variant="hero" className="gap-2">
                    <Search className="h-4 w-4" />
                    Αναζήτηση Αγγελιών
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Favourites;