import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMyListings } from "@/hooks/useMyListings";
import { useOverviewStats } from "@/hooks/useOverviewStats";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Eye, Plus, Settings, User } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Section spacing="default">
        <Container size="wide">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Hosting Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Διαχειρίσου τις αγγελίες και τα μηνύματά σου
                </p>
              </div>
              <Button 
                onClick={() => navigate('/publish')} 
                size="lg"
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Νέα αγγελία
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ενεργές αγγελίες</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{activeListings.length}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {draftListings.length > 0 && `${draftListings.length} σχέδια`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Μηνύματα</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{stats?.newMessages || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Νέα μηνύματα</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Προβολές</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{stats?.totalViews || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Συνολικά</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group" 
                    onClick={() => navigate('/hosting/my-listings')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                    <span>Οι αγγελίες μου</span>
                  </CardTitle>
                  <CardDescription className="ml-15">
                    Διαχειρίσου και επεξεργάσου τις αγγελίες σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-accent transition-all duration-200">
                    Προβολή αγγελιών
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group" 
                    onClick={() => navigate('/hosting/inbox')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <span>Μηνύματα</span>
                  </CardTitle>
                  <CardDescription className="ml-15">
                    Δες και απάντησε σε αιτήματα ενδιαφέροντος
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-accent transition-all duration-200">
                    Άνοιγμα εισερχομένων
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group" 
                    onClick={() => navigate('/me')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <span>Το προφίλ μου</span>
                  </CardTitle>
                  <CardDescription className="ml-15">
                    Επεξεργάσου τις πληροφορίες και επαληθεύσεις σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-accent transition-all duration-200">
                    Προβολή προφίλ
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group" 
                    onClick={() => navigate('/settings')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <span>Ρυθμίσεις</span>
                  </CardTitle>
                  <CardDescription className="ml-15">
                    Διαμόρφωσε τις προτιμήσεις του λογαριασμού σου
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-accent transition-all duration-200">
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
