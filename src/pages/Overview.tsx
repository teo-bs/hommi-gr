import { Helmet } from "react-helmet-async";
import { BarChart3, Home, MessageSquare, Calendar, Eye, Plus, Edit, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useOverviewStats } from "@/hooks/useOverviewStats";

const Overview = () => {
  const { data: stats, isLoading, error } = useOverviewStats();
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
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Δημοσιευμένες αγγελίες
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
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Από όλες τις αγγελίες
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Μηνύματα
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.newMessages || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Σύνολο μηνυμάτων
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Μηνιαίες Επισκέψεις
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.monthlyVisits || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Επισκέψεις σε προφίλ
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Listings */}
            {!isLoading && stats && stats.recentListings.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Πρόσφατες Αγγελίες
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentListings.map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{listing.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                              listing.status === 'published' ? 'default' : 
                              listing.status === 'draft' ? 'secondary' : 'outline'
                            }>
                              {listing.status === 'published' ? 'Δημοσιευμένο' : 
                               listing.status === 'draft' ? 'Πρόχειρο' : 'Αρχειοθετημένο'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {listing.views} προβολές
                            </span>
                          </div>
                        </div>
                        <Link to={`/publish?id=${listing.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Επεξεργασία
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && (!stats || (stats.activeListings === 0 && stats.recentListings.length === 0)) && (
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
            )}

            {/* Error State */}
            {error && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-destructive">Σφάλμα κατά τη φόρτωση των στατιστικών</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;