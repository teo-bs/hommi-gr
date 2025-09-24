import { Helmet } from "react-helmet-async";
import { BarChart3, Home, MessageSquare, Calendar, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Overview = () => {
  return (
    <>
      <Helmet>
        <title>Επισκόπηση - Hommi</title>
        <meta 
          name="description" 
          content="Δείτε την επισκόπηση των αγγελιών σας, στατιστικά προβολών και μηνύματα στο Hommi." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Επισκόπηση
              </h1>
              <p className="text-muted-foreground">
                Δείτε την απόδοση των αγγελιών σας και τη δραστηριότητα
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ενεργές Αγγελίες
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0 από τον προηγούμενο μήνα
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Συνολικές Προβολές
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0 από την προηγούμενη εβδομάδα
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Νέα Μηνύματα
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0 σήμερα
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Επισκέψεις Μήνα
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0 από τον προηγούμενο μήνα
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Empty State */}
            <Card className="text-center py-12">
              <CardContent className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Δεν έχετε ενεργές αγγελίες ακόμα
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Δημιουργήστε την πρώτη σας αγγελία για να ξεκινήσετε να βλέπετε 
                    στατιστικά και να δέχεστε αιτήσεις από ενδιαφερόμενους.
                  </p>
                </div>

                <Link to="/publish">
                  <Button variant="hero" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Δημιουργία Αγγελίας
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

export default Overview;