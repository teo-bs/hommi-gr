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
      <section className="relative overflow-hidden">
        <div 
          className="min-h-[600px] h-[80vh] sm:h-[85vh] bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Modern gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-primary/20" />
          
          {/* Animated blur circles for depth */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-center text-white max-w-5xl mx-auto w-full animate-fade-in">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                Βρες το ιδανικό <span className="text-primary-light">σπίτι</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>και τους καλύτερους <span className="text-accent-light">συγκάτοικους</span>
              </h1>
              <p className="text-lg sm:text-2xl md:text-3xl mb-8 sm:mb-10 md:mb-14 text-white/95 font-light px-4" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}>
                Η πλατφόρμα συγκατοίκησης που εμπιστεύονται χιλιάδες άνθρωποι
              </p>

              {/* Search Bar with Glass-morphism */}
              <Card className="max-w-5xl mx-auto bg-white/90 backdrop-blur-2xl shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-white/50 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1">
                <CardContent className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-inner">
                    <div className="md:col-span-1 p-5 md:border-r border-border/20">
                      <div className="relative">
                        <MapPin className="absolute left-0 top-7 h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col pl-7">
                          <span className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                            Τοποθεσία
                          </span>
                          <LocationAutocomplete
                            value={searchQuery}
                            onChange={setSearchQuery}
                            className="border-0 bg-transparent p-0 h-auto text-sm sm:text-base font-medium focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1 p-5 border-t md:border-t-0 md:border-r border-border/20">
                      <DatePicker
                        date={moveInDate}
                        onDateChange={setMoveInDate}
                        placeholder="Ημερομηνία"
                      />
                    </div>
                    <div className="md:col-span-1 p-5 border-t md:border-t-0 md:border-r border-border/20">
                      <DurationSelector
                        value={duration}
                        onValueChange={setDuration}
                      />
                    </div>
                    <div className="md:col-span-1 p-5 border-t md:border-t-0 flex items-center justify-center">
                      <Button 
                        onClick={handleSearch}
                        className="w-full md:w-14 h-12 md:h-14 rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
                        variant="hero"
                        size="lg"
                      >
                        <Search className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="ml-2 md:hidden font-semibold text-base">Αναζήτηση</span>
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
      <section className="py-16 sm:py-20 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12 animate-fade-in">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Οι ανάγκες σου, οι κανόνες σου
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Βρες το ιδανικό σπίτι που ταιριάζει στον τρόπο ζωής σου
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Shared Homes Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.03] hover:rotate-1 active:scale-[0.98] hover:shadow-2xl transition-all duration-500 animate-fade-in touch-manipulation"
              style={{ animationDelay: '100ms' }}
              onClick={() => handleShortcut("Shared homes")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Κοινόχρηστα σπίτια"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Shared homes")}
            >
              <div className="relative h-[320px] sm:h-[360px] overflow-hidden">
                {/* Gradient background with animated shimmer */}
                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/40 flex items-center justify-center relative">
                  <Users className="h-28 w-28 text-primary opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    Κοινόχρηστα σπίτια
                  </h3>
                  <p className="text-base text-white/95 leading-relaxed font-light">
                    Το δικό σου δωμάτιο σε κοινόχρηστο διαμέρισμα
                  </p>
                </div>
              </div>
            </Card>

            {/* Couples Accepted Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.03] hover:rotate-1 active:scale-[0.98] hover:shadow-2xl transition-all duration-500 animate-fade-in touch-manipulation"
              style={{ animationDelay: '200ms' }}
              onClick={() => handleShortcut("Couples accepted")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Ζευγάρια καλοδεχούμενα"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Couples accepted")}
            >
              <div className="relative h-[320px] sm:h-[360px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent/30 via-primary/20 to-accent/40 flex items-center justify-center relative">
                  <Heart className="h-28 w-28 text-accent opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    Ζευγάρια καλοδεχούμενα
                  </h3>
                  <p className="text-base text-white/95 leading-relaxed font-light">
                    Δύο οδοντόβουρτσες; Κανένα πρόβλημα.
                  </p>
                </div>
              </div>
            </Card>

            {/* Pets Accepted Card */}
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl hover:scale-[1.03] hover:rotate-1 active:scale-[0.98] hover:shadow-2xl transition-all duration-500 animate-fade-in touch-manipulation"
              style={{ animationDelay: '300ms' }}
              onClick={() => handleShortcut("Pets accepted")}
              role="button"
              tabIndex={0}
              aria-label="Φίλτρο: Κατοικίδια καλοδεχούμενα"
              onKeyDown={(e) => e.key === 'Enter' && handleShortcut("Pets accepted")}
            >
              <div className="relative h-[320px] sm:h-[360px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-success/30 via-primary/20 to-success/40 flex items-center justify-center relative">
                  <Home className="h-28 w-28 text-success opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    Κατοικίδια καλοδεχούμενα
                  </h3>
                  <p className="text-base text-white/95 leading-relaxed font-light">
                    Γιατί το σπίτι είναι εκεί που είναι το κατοικίδιό σου
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 md:py-20 bg-surface-elevated">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Πώς λειτουργεί το Hommi
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Μια απλή διαδικασία για να βρεις το ιδανικό σπίτι και τους καλύτερους συγκάτοικους
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <Card className="group text-center bg-white/60 backdrop-blur-sm border-2 border-white/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-3 active:scale-95 rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                {/* Animated icon container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  
                  {/* Pulse ring on hover */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-primary/50 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Δες επαληθευμένες αγγελίες</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Περιηγηθείτε σε επαληθευμένες καταχωρήσεις από αξιόπιστους hosts με πλήρεις πληροφορίες και φωτογραφίες
                </p>
              </CardContent>
            </Card>

            <Card className="group text-center bg-white/60 backdrop-blur-sm border-2 border-white/50 hover:shadow-2xl hover:border-accent/30 transition-all duration-500 hover:-translate-y-3 active:scale-95 rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-accent to-accent-light rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                  <Star className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  
                  <div className="absolute inset-0 rounded-3xl border-4 border-accent/50 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Ταιριάζεις</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Το σύστημά μας σας ταιριάζει με τους ιδανικούς συγκάτοικους βάσει των προτιμήσεων και του lifestyle σας
                </p>
              </CardContent>
            </Card>

            <Card className="group text-center bg-white/60 backdrop-blur-sm border-2 border-white/50 hover:shadow-2xl hover:border-success/30 transition-all duration-500 hover:-translate-y-3 active:scale-95 rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-success to-success-light rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  
                  <div className="absolute inset-0 rounded-3xl border-4 border-success/50 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Κράτηση με ασφάλεια</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Κλείστε με ασφάλεια με προστασία και υποστήριξη έως την επιβεβαίωση της μετακόμισης
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Hommi Section */}
      <section className="py-16 sm:py-20 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Γιατί να επιλέξεις το Hommi;
              </h2>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-4 sm:space-x-5 animate-fade-in group hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: '0ms' }}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Trust-first approach</h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                      Όλοι οι χρήστες επαληθεύονται με Gov.gr και έχουν verified profiles για μέγιστη ασφάλεια
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-5 animate-fade-in group hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: "150ms" }}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Community-focused</h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                      Χτίζουμε μια κοινότητα όπου όλοι νιώθουν ασφαλείς και υποστηριζόμενοι στην αναζήτησή τους
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-5 animate-fade-in group hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: "300ms" }}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-success to-success-light rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Secure payments</h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                      Προστασία που προστατεύει και τις δύο πλευρές έως την ολοκλήρωση της μετακόμισης
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-8 sm:mt-10">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="text-base sm:text-lg px-8 py-6 sm:py-7 min-h-[52px] rounded-full bg-gradient-to-r from-primary to-primary-hover hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-300 group"
                >
                  Ξεκίνα την αναζήτηση
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePublishListing}
                  className="text-base sm:text-lg px-8 py-6 sm:py-7 min-h-[52px] rounded-full border-2 hover:bg-primary/10 hover:border-primary hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Δημοσίευσε αγγελία
                  <Plus className="ml-2 h-5 w-5" />
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