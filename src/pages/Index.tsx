import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/search/DatePicker";
import { DurationSelector } from "@/components/search/DurationSelector";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { useListingFlow } from "@/hooks/useListingFlow";
import { 
  Search, 
  Users, 
  Shield, 
  Heart, 
  Home, 
  MapPin,
  CheckCircle,
  Star,
  ArrowRight,
  Plus
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const listingFlow = useListingFlow();
  const [searchQuery, setSearchQuery] = useState("");
  const [moveInDate, setMoveInDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState("");

  const handleSearch = () => {
    // Save to recent searches
    if (searchQuery.trim()) {
      try {
        const RECENT_SEARCHES_KEY = "hommi_recent_searches";
        const MAX_RECENT_SEARCHES = 5;
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        const recentSearches = stored ? JSON.parse(stored) : [];
        const updated = [
          searchQuery,
          ...recentSearches.filter((s: string) => s !== searchQuery),
        ].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent search:", error);
      }
    }

    // Track analytics
    console.log('search_triggered', {
      query: searchQuery,
      moveInDate: moveInDate?.toISOString(),
      duration,
      timestamp: Date.now()
    });

    // Navigate to search with params
    const params = new URLSearchParams();
    if (searchQuery) params.set('city', searchQuery);
    if (moveInDate) params.set('moveIn', moveInDate.toISOString());
    if (duration) params.set('duration', duration);
    
    navigate(`/search?${params.toString()}`);
  };

  const smartShortcuts = [
    { label: "Shared homes", icon: Users },
    { label: "Couples accepted", icon: Heart },
    { label: "Pets accepted", icon: Home },
  ];

  const handleShortcut = (shortcut: string) => {
    // Track analytics
    console.log('smart_shortcut_clicked', {
      shortcut,
      timestamp: Date.now()
    });

    navigate(`/search?filters=${encodeURIComponent(shortcut)}`);
  };

  const handlePublishListing = () => {
    listingFlow.initiateListingFlow();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-[70vh] sm:h-[80vh] bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Βρες το ιδανικό <span className="text-primary-light">σπίτι</span>
                <br />
                και τους καλύτερους <span className="text-accent-light">συγκάτοικους</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-white/90">
                Η πλατφόρμα συγκατοίκησης που εμπιστεύονται χιλιάδες άνθρωποι σε όλη την Ελλάδα
              </p>

              {/* Search Bar */}
              <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur shadow-elevated rounded-2xl transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-2 sm:p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-white rounded-xl shadow-sm">
                    <div className="md:col-span-1 p-3 sm:p-4 md:border-r border-border/10">
                      <div className="relative">
                        <MapPin className="absolute left-0 top-6 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col pl-6">
                          <span className="text-xs font-medium text-foreground mb-1">
                            Τοποθεσία
                          </span>
                          <LocationAutocomplete
                            value={searchQuery}
                            onChange={setSearchQuery}
                            className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1 p-3 sm:p-4 border-t md:border-t-0 md:border-r border-border/10">
                      <DatePicker
                        date={moveInDate}
                        onDateChange={setMoveInDate}
                        placeholder="Ημ/νία μετακόμισης"
                      />
                    </div>
                    <div className="md:col-span-1 p-3 sm:p-4 border-t md:border-t-0 md:border-r border-border/10">
                      <DurationSelector
                        value={duration}
                        onValueChange={setDuration}
                      />
                    </div>
                    <div className="md:col-span-1 p-3 sm:p-4 border-t md:border-t-0 flex items-center justify-center">
                      <Button 
                        onClick={handleSearch}
                        className="w-full md:w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                        variant="hero"
                        size="lg"
                      >
                        <Search className="h-5 w-5" />
                        <span className="ml-2 md:hidden">Αναζήτηση</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Οι ανάγκες σου, οι κανόνες σου
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Βρες το ιδανικό σπίτι που ταιριάζει στον τρόπο ζωής σου
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Shared Homes Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.02] active:scale-[0.98] hover:shadow-elevated transition-all duration-300 animate-scale-in touch-manipulation"
              onClick={() => handleShortcut("Shared homes")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Κοινόχρηστα σπίτια"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Shared homes")}
            >
              <div className="relative h-[250px] sm:h-[300px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 flex items-center justify-center">
                  <Users className="h-24 w-24 text-primary opacity-40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2 leading-tight">
                    Κοινόχρηστα σπίτια
                  </h3>
                  <p className="text-small text-white/90 leading-relaxed">
                    Το δικό σου δωμάτιο σε κοινόχρηστο διαμέρισμα
                  </p>
                </div>
              </div>
            </Card>

            {/* Couples Accepted Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.02] active:scale-[0.98] hover:shadow-elevated transition-all duration-300 animate-scale-in touch-manipulation"
              onClick={() => handleShortcut("Couples accepted")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Ζευγάρια καλοδεχούμενα"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Couples accepted")}
            >
              <div className="relative h-[300px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-accent opacity-40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2 leading-tight">
                    Ζευγάρια καλοδεχούμενα
                  </h3>
                  <p className="text-small text-white/90 leading-relaxed">
                    Δύο οδοντόβουρτσες; Κανένα πρόβλημα.
                  </p>
                </div>
              </div>
            </Card>

            {/* Pets Accepted Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.02] active:scale-[0.98] hover:shadow-elevated transition-all duration-300 animate-scale-in touch-manipulation"
              onClick={() => handleShortcut("Pets accepted")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Κατοικίδια καλοδεχούμενα"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Pets accepted")}
            >
              <div className="relative h-[300px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-success/20 via-primary/10 to-success/30 flex items-center justify-center">
                  <Home className="h-24 w-24 text-success opacity-40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2 leading-tight">
                    Κατοικίδια καλοδεχούμενα
                  </h3>
                  <p className="text-small text-white/90 leading-relaxed">
                    Γιατί το σπίτι είναι εκεί που είναι το κατοικίδιό σου
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-surface-elevated">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Πώς λειτουργεί το Hommi
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Μια απλή διαδικασία για να βρεις το ιδανικό σπίτι και τους καλύτερους συγκάτοικους
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center hover:shadow-moderate transition-all duration-300 hover:-translate-y-1 active:scale-95">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-lighter rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Browse verified</h3>
                <p className="text-muted-foreground">
                  Περιηγηθείτε σε επαληθευμένες καταχωρήσεις από αξιόπιστους hosts με πλήρεις πληροφορίες και φωτογραφίες
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-moderate transition-all duration-300 hover:-translate-y-1 active:scale-95">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Star className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">AI match</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Το AI μας σας ταιριάζει με τους ιδανικούς συγκάτοικους βάσει των προτιμήσεων και του lifestyle σας
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-moderate transition-all duration-300 hover:-translate-y-1 active:scale-95">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Book safely</h3>
                <p className="text-muted-foreground">
                  Κλείστε με ασφάλεια με το σύστημα held funds και προστασία έως την επιβεβαίωση της μετακόμισης
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Hommi Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Γιατί να επιλέξεις το Hommi;
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4 animate-scale-in">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-lighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Trust-first approach</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Όλοι οι χρήστες επαληθεύονται με Gov.gr και έχουν verified profiles για μέγιστη ασφάλεια
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4 animate-scale-in" style={{ animationDelay: "100ms" }}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Community-focused</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Χτίζουμε μια κοινότητα όπου όλοι νιώθουν ασφαλείς και υποστηριζόμενοι στην αναζήτησή τους
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4 animate-scale-in" style={{ animationDelay: "200ms" }}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-success-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Secure payments</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Held funds system που προστατεύει και τις δύο πλευρές έως την ολοκλήρωση της μετακόμισης
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95 transition-transform"
                  onClick={() => navigate('/search')}
                >
                  Ξεκίνα την αναζήτηση
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95 transition-transform"
                  onClick={handlePublishListing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Δημοσίευσε αγγελία
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in order-first lg:order-last">
              <Card className="shadow-elevated overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                  <img
                    src={heroImage}
                    alt="Happy flatmates"
                    className="w-full h-64 sm:h-80 md:h-96 object-cover"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;