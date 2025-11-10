import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMyListings } from "@/hooks/useMyListings";
import { useOverviewStats } from "@/hooks/useOverviewStats";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Eye, Plus, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Hosting() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listingsData, isLoading: listingsLoading } = useMyListings();
  const { data: stats, isLoading: statsLoading } = useOverviewStats();

  if (!user) {
    navigate('/');
    return null;
  }

  const listings = listingsData?.listings || [];
  const activeListings = listings.filter(l => l.status === 'published');
  const draftListings = listings.filter(l => l.status === 'draft');

  return (
    <div className="min-h-screen bg-background">
      <Section spacing="default">
        <Container size="wide">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Hosting Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Διαχειρίσου τις αγγελίες και τα μηνύματά σου
                </p>
              </div>
              <Button onClick={() => navigate('/publish')} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Νέα αγγελία
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργές αγγελίες</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{activeListings.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {draftListings.length > 0 && `${draftListings.length} σχέδια`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μηνύματα</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.newMessages || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Νέα μηνύματα</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Προβολές</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Συνολικά</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => navigate('/my-listings')}>
                <CardHeader>
                  <CardTitle>Οι αγγελίες μου</CardTitle>
                  <CardDescription>
                    Διαχειρίσου και επεξεργάσου τις αγγελίες σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Προβολή αγγελιών
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => navigate('/inbox')}>
                <CardHeader>
                  <CardTitle>Μηνύματα</CardTitle>
                  <CardDescription>
                    Δες και απάντησε σε αιτήματα ενδιαφέροντος
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Άνοιγμα εισερχομένων
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => navigate('/overview')}>
                <CardHeader>
                  <CardTitle>Το προφίλ μου</CardTitle>
                  <CardDescription>
                    Επεξεργάσου τις πληροφορίες και επαληθεύσεις σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Προβολή προφίλ
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => navigate('/settings')}>
                <CardHeader>
                  <CardTitle>Ρυθμίσεις</CardTitle>
                  <CardDescription>
                    Διαμόρφωσε τις προτιμήσεις του λογαριασμού σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Ρυθμίσεις
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
