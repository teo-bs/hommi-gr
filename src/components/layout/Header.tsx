import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, MessageSquare, Plus, Globe, Menu, X, Settings, Search, Calendar, LogOut, UserCheck, MapPin, Heart, BarChart3, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useListingFlow } from "@/hooks/useListingFlow";
import { useListingsCount } from "@/hooks/useListingsCount";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { AuthFlowManager } from "@/components/auth/AuthFlowManager";
import { ListingWizard } from "@/components/listing/ListingWizard";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { useTranslation } from "@/hooks/useTranslation";
import hommiLogo from "@/assets/hommi-logo.png";

export const Header = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const listingFlow = useListingFlow();
  const { count: listingsCount } = useListingsCount();
  const { unreadCount } = useUnreadCount();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, language, toggleLanguage } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          title: t('notifications.error'),
          description: t('notifications.somethingWentWrong'),
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: t('notifications.success'),
        description: newRole === 'tenant' ? t('header.switchToTenant') : t('header.switchToLister'),
      });
      
      // Redirect to appropriate page based on new role
      if (newRole === 'lister') {
        navigate('/');
      } else {
        navigate('/search');
      }
    } catch (error) {
      toast({
        title: t('notifications.error'),
        description: t('notifications.somethingWentWrong'),
        variant: "destructive",
      });
    }
  };

  // Determine user role - default to 'tenant' if not set
  const userRole = profile?.role || 'tenant';

  // Check if we're on the search page
  const isSearchPage = location.pathname === '/search';

  // Define navigation items based on role
  const tenantNavItems = [
    { 
      href: "/search", 
      label: t('header.search'),
      icon: Search
    },
    { 
      href: "/favourites", 
      label: t('header.saved'),
      icon: Heart
    },
    { 
      href: "/inbox", 
      label: `${t('header.messages')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
      icon: MessageSquare
    },
    { 
      href: "/help", 
      label: t('common.help'),
      icon: MessageSquare
    }
  ];

  const listerNavItems = [
    ...(listingsCount > 0 ? [
      { 
        href: "/overview", 
        label: t('header.overview'),
        icon: BarChart3
      },
      { 
        href: "/my-listings", 
        label: t('header.myListings'),
        icon: List
      }
    ] : []),
    { 
      href: "/inbox", 
      label: `${t('header.messages')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
      icon: MessageSquare
    },
    { 
      href: "/help", 
      label: t('common.help'),
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
              <img 
                src={hommiLogo} 
                alt="Hommi" 
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-xl font-bold text-foreground">
                Hommi
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user ? (
              <nav className="hidden lg:flex items-center space-x-6">
                {/* Search Box - Only for tenants and NOT on search page */}
                {currentRole === 'tenant' && !isSearchPage && (
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={locationLoading ? t('common.loading') : t('header.searchPlaceholder')}
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
                    {t('header.publishListing')}
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
                  {t('header.publishListing')}
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
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 overflow-visible">
                      <AvatarWithBadge
                        src={profile?.avatar_url}
                        alt={profile?.display_name || 'User'}
                        fallback={profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        verificationsJson={profile?.verifications_json as any}
                        className="h-10 w-10"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-background border border-border shadow-lg z-50"
                  >
                   <DropdownMenuItem onClick={() => navigate('/me')}>
                       <User className="h-4 w-4 mr-2" />
                       {t('header.profile')}
                     </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('header.settings')}
                    </DropdownMenuItem>
                    
                    {/* Admin Link */}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {t('header.admin')}
                      </DropdownMenuItem>
                    )}
                    
                    {/* Role-specific menu items */}
                    {currentRole === 'tenant' ? (
                      <DropdownMenuItem onClick={() => navigate('/search-preferences')}>
                        <Search className="h-4 w-4 mr-2" />
                        {t('profile.preferences')}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/booking-settings')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('owner.settings')}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Role Switch - Hide for agencies */}
                    {profile?.can_switch_roles && (
                      <DropdownMenuItem onClick={() => handleRoleSwitch(currentRole === 'tenant' ? 'lister' : 'tenant')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {currentRole === 'tenant' ? t('header.switchToLister') : t('header.switchToTenant')}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.logout')}
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
              className="lg:hidden min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
              aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
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
            <div className="lg:hidden border-t border-border py-4 animate-slide-in-right">
              {/* Mobile Search - Only for tenants */}
              {currentRole === 'tenant' && (
                <div className="px-4 mb-4">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={locationLoading ? t('common.loading') : t('header.searchPlaceholder')}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-10 pr-4 w-full min-h-[44px]"
                        disabled={locationLoading}
                      />
                    </div>
                  </form>
                </div>
              )}

              <nav className="space-y-1 px-4">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 flex items-center space-x-3 min-h-[44px] touch-manipulation active:scale-95"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 pt-4 border-t border-border space-y-2 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start min-h-[44px] touch-manipulation active:scale-95 transition-transform"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {language === 'el' ? 'English' : 'Ελληνικά'}
                </Button>
                
                {/* Publish listing button - Only show for listers (non-pending) or logged out users */}
                {((currentRole === 'lister' && !isPendingAgency) || !user) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-foreground/20 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
                    onClick={() => {
                      handlePublishListing();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('header.publishListing')}
                  </Button>
                )}

                {user ? (
                 <>
                     <Link to="/me" onClick={() => setMobileMenuOpen(false)}>
                       <Button variant="ghost" size="sm" className="w-full justify-start">
                         <User className="h-4 w-4 mr-2" />
                         {t('header.profile')}
                       </Button>
                     </Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('header.settings')}
                      </Button>
                    </Link>
                    {currentRole === 'tenant' ? (
                      <Link to="/search-preferences" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Search className="h-4 w-4 mr-2" />
                          {t('profile.preferences')}
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/booking-settings" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('owner.settings')}
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
                      {currentRole === 'tenant' ? t('header.switchToLister') : t('header.switchToTenant')}
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
                      {t('header.logout')}
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
                    {t('header.login')} / {t('header.signup')}
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