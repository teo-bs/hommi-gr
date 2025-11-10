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
import hommiLogo from "@/assets/hommi-logo-new.png";

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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get current user role, default to 'tenant'
  const currentRole = profile?.role || 'tenant';
  const isPendingAgency = profile?.account_status === 'pending_qualification';

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Handle header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true);
      } 
      // Hide header when scrolling down (after 100px)
      else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  // Define navigation items based on role (hide Saved/Messages for non-logged users)
  const tenantNavItems = user ? [
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
  ] : [
    { 
      href: "/search", 
      label: t('header.search'),
      icon: Search
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
      <header 
        className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background transition-all duration-300 px-safe ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between pt-safe">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={hommiLogo} 
                alt="Hommi" 
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-primary">
                hommi
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              {currentNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`text-sm font-medium transition-colors relative pb-3 ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions - Right Side */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Role Switch Link */}
              {user && profile?.can_switch_roles && (
                <button
                  onClick={() => handleRoleSwitch(currentRole === 'tenant' ? 'lister' : 'tenant')}
                  className="text-sm font-medium text-foreground hover:bg-muted px-3 py-2 rounded-full transition-colors"
                >
                  {currentRole === 'tenant' ? t('header.switchToLister') : t('header.switchToTenant')}
                </button>
              )}

              {/* Publish Listing Button - Only show for listers who are not pending */}
              {currentRole === 'lister' && !isPendingAgency && (
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="text-sm font-medium"
                  onClick={handlePublishListing}
                  data-testid="publish-listing-btn"
                >
                  {t('header.publishListing')}
                </Button>
              )}

              {/* User Profile & Menu Button Combined */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 border border-border/40 rounded-full px-2 py-1 hover:shadow-md transition-all"
                    >
                      <Menu className="h-4 w-4" />
                      <AvatarWithBadge
                        src={profile?.avatar_url}
                        alt={profile?.display_name || 'User'}
                        fallback={profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        verificationsJson={profile?.verifications_json as any}
                        className="h-8 w-8"
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
                    
                    <DropdownMenuItem onClick={toggleLanguage}>
                      <Globe className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'English' : 'Ελληνικά'}
                    </DropdownMenuItem>
                    
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
                  className="flex items-center space-x-2 border border-border/40 rounded-full px-3 py-2 hover:shadow-md transition-all"
                >
                  <Menu className="h-4 w-4" />
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden border border-border/40 rounded-full px-2 py-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
              aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
            >
              <Menu className="h-5 w-5" />
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