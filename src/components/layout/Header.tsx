import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, User, MessageSquare, Plus, Globe, Menu, X, Settings, Search, Calendar, LogOut, UserCheck, MapPin, Heart, BarChart3, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useListingFlow } from "@/hooks/useListingFlow";
import { useListingsCount } from "@/hooks/useListingsCount";
import { AuthFlowManager } from "@/components/auth/AuthFlowManager";
import { ListingWizard } from "@/components/listing/ListingWizard";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const listingFlow = useListingFlow();
  const { count: listingsCount } = useListingsCount();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('el'); // Greek default
  const [searchLocation, setSearchLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Get current user role, default to 'tenant'
  const currentRole = profile?.role || 'tenant';
  const isPendingAgency = profile?.account_status === 'pending_qualification';

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setSearchLocation('Αθήνα'); // Default to Athens
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // For now, just use coordinates to determine major Greek cities
          const { latitude, longitude } = position.coords;
          
          // Simple coordinate-based city detection for Greece
          let detectedCity = 'Αθήνα'; // Default
          
          // Athens area
          if (latitude >= 37.8 && latitude <= 38.2 && longitude >= 23.5 && longitude <= 24) {
            detectedCity = 'Αθήνα';
          }
          // Thessaloniki area  
          else if (latitude >= 40.5 && latitude <= 40.8 && longitude >= 22.8 && longitude <= 23.2) {
            detectedCity = 'Θεσσαλονίκη';
          }
          // Patras area
          else if (latitude >= 38.1 && latitude <= 38.4 && longitude >= 21.6 && longitude <= 21.9) {
            detectedCity = 'Πάτρα';
          }
          // Heraklion area
          else if (latitude >= 35.2 && latitude <= 35.4 && longitude >= 25.0 && longitude <= 25.3) {
            detectedCity = 'Ηράκλειο';
          }
          
          setSearchLocation(detectedCity);
        } catch (error) {
          console.error('Location detection error:', error);
          setSearchLocation('Αθήνα');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setSearchLocation('Αθήνα');
        setLocationLoading(false);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = new URLSearchParams({
      city: searchLocation || 'Αθήνα',
      filters: ''
    });
    navigate(`/search?${searchQuery.toString()}`);
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    if (!user) {
      setShowAuthModal(true);
    }
  };

  const handlePublishListing = () => {
    listingFlow.initiateListingFlow();
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'el' ? 'en' : 'el');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleRoleSwitch = async (newRole: 'tenant' | 'lister') => {
    if (!user || !profile) return;
    
    try {
      const { error } = await updateProfile({ role: newRole });
      
      if (error) {
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η αλλαγή ρόλου",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Επιτυχία",
        description: `Μετάβαση σε ${newRole === 'tenant' ? 'Tenant' : 'Lister'}`,
      });
      
      // Redirect to appropriate page based on new role
      if (newRole === 'lister') {
        navigate('/');
      } else {
        navigate('/search');
      }
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    }
  };

  // Determine user role - default to 'tenant' if not set
  const userRole = profile?.role || 'tenant';

  // Define navigation items based on role
  const tenantNavItems = [
    { 
      href: "/favourites", 
      label: language === 'el' ? 'Αγαπημένα' : 'Favourites',
      icon: Heart
    },
    { 
      href: "/inbox", 
      label: language === 'el' ? 'Μηνύματα' : 'Inbox',
      icon: MessageSquare
    },
    { 
      href: "/help", 
      label: language === 'el' ? 'Βοήθεια' : 'Help',
      icon: MessageSquare
    }
  ];

  const listerNavItems = [
    ...(listingsCount > 0 ? [
      { 
        href: "/overview", 
        label: language === 'el' ? 'Επισκόπηση' : 'Overview',
        icon: BarChart3
      },
      { 
        href: "/my-listings", 
        label: language === 'el' ? 'Οι αγγελίες μου' : 'My listings',
        icon: List
      }
    ] : []),
    { 
      href: "/inbox", 
      label: language === 'el' ? 'Μηνύματα' : 'Inbox',
      icon: MessageSquare
    },
    { 
      href: "/help", 
      label: language === 'el' ? 'Βοήθεια' : 'Help',
      icon: MessageSquare
    }
  ];

  const currentNavItems = currentRole === 'tenant' ? tenantNavItems : listerNavItems;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Hommi
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user ? (
              <nav className="hidden lg:flex items-center space-x-6">
                {/* Search Box - Only for tenants */}
                {currentRole === 'tenant' && (
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={locationLoading ? "Εντοπισμός..." : "Πού θέλετε να μείνετε;"}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-10 pr-4 w-80 bg-background border-border"
                        disabled={locationLoading}
                      />
                    </div>
                  </form>
                )}

                {/* Navigation Items */}
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Publish Listing Button - Only show for listers who are not pending */}
                {currentRole === 'lister' && !isPendingAgency && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-foreground/20"
                    onClick={handlePublishListing}
                    data-testid="publish-listing-btn"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'el' ? 'Δημοσίευσε αγγελία' : 'Publish listing'}
                  </Button>
                )}
              </nav>
            ) : (
              /* Logged-out Navigation */
              <nav className="hidden lg:flex items-center space-x-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-foreground/20"
                  onClick={handlePublishListing}
                >
                  {language === 'el' ? 'Καταχώρησε το ακίνητό σου' : 'List your property'}
                </Button>
              </nav>
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {language.toUpperCase()}
                </span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-background border border-border shadow-lg z-50"
                  >
                     <DropdownMenuItem onClick={() => navigate('/me')}>
                       <User className="h-4 w-4 mr-2" />
                       {language === 'el' ? 'Το προφίλ μου' : 'My profile'}
                     </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
                    </DropdownMenuItem>
                    
                    {/* Role-specific menu items */}
                    {currentRole === 'tenant' ? (
                      <DropdownMenuItem onClick={() => navigate('/search-preferences')}>
                        <Search className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Προτιμήσεις αναζήτησης' : 'Search preferences'}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/booking-settings')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Ρυθμίσεις κρατήσεων' : 'Booking settings'}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Role Switch */}
                    <DropdownMenuItem onClick={() => handleRoleSwitch(currentRole === 'tenant' ? 'lister' : 'tenant')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      {currentRole === 'tenant' 
                        ? (language === 'el' ? 'Μετάβαση σε Lister' : 'Switch to Lister')
                        : (language === 'el' ? 'Μετάβαση σε Tenant' : 'Switch to Tenant')
                      }
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'Αποσύνδεση' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthAction('login')}
                  className="rounded-full w-10 h-10 p-0"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border py-4">
              {/* Mobile Search - Only for tenants */}
              {currentRole === 'tenant' && (
                <div className="px-4 mb-4">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={locationLoading ? "Εντοπισμός..." : "Πού θέλετε να μείνετε;"}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-10 pr-4 w-full"
                        disabled={locationLoading}
                      />
                    </div>
                  </form>
                </div>
              )}

              <nav className="space-y-2 px-4">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 pt-4 border-t border-border space-y-2 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {language === 'el' ? 'English' : 'Ελληνικά'}
                </Button>
                
                {/* Publish listing button - Only show for listers (non-pending) or logged out users */}
                {((currentRole === 'lister' && !isPendingAgency) || !user) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-foreground/20"
                    onClick={() => {
                      handlePublishListing();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {currentRole === 'lister' 
                      ? (language === 'el' ? 'Δημοσίευσε αγγελία' : 'Publish listing')
                      : (language === 'el' ? 'Καταχώρησε το ακίνητό σου' : 'List your property')
                    }
                  </Button>
                )}

                {user ? (
                  <>
                     <Link to="/me" onClick={() => setMobileMenuOpen(false)}>
                       <Button variant="ghost" size="sm" className="w-full justify-start">
                         <User className="h-4 w-4 mr-2" />
                         {language === 'el' ? 'Το προφίλ μου' : 'My profile'}
                       </Button>
                     </Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
                      </Button>
                    </Link>
                    {currentRole === 'tenant' ? (
                      <Link to="/search-preferences" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Search className="h-4 w-4 mr-2" />
                          {language === 'el' ? 'Προτιμήσεις αναζήτησης' : 'Search preferences'}
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/booking-settings" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {language === 'el' ? 'Ρυθμίσεις κρατήσεων' : 'Booking settings'}
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        handleRoleSwitch(currentRole === 'tenant' ? 'lister' : 'tenant');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {currentRole === 'tenant' 
                        ? (language === 'el' ? 'Μετάβαση σε Lister' : 'Switch to Lister')
                        : (language === 'el' ? 'Μετάβαση σε Tenant' : 'Switch to Tenant')
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'Αποσύνδεση' : 'Logout'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleAuthAction('login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {language === 'el' ? 'Σύνδεση / Εγγραφή' : 'Login / Sign Up'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthFlowManager 
        isAuthOpen={showAuthModal} 
        onAuthClose={() => setShowAuthModal(false)} 
      />
      
      <AuthFlowManager 
        isAuthOpen={listingFlow.authModalOpen} 
        onAuthClose={listingFlow.closeAuth}
        onAuthSuccess={listingFlow.handleAuthSuccess}
      />
      
      {listingFlow.wizardOpen && listingFlow.selectedRole && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="min-h-screen">
            <ListingWizard
              role={listingFlow.selectedRole}
              initialDraft={listingFlow.currentDraft || undefined}
              onSave={listingFlow.handleDraftSaved}
              onPublish={listingFlow.handleListingPublished}
              onRoleChange={listingFlow.handleRoleChange}
              onBack={listingFlow.closeWizard}
            />
          </div>
        </div>
      )}
    </>
  );
};