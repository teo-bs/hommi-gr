import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Plus, Globe, Menu, X, Settings, Calendar, LogOut, UserCheck, BarChart3 } from "lucide-react";
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

  // Get current user role, default to 'tenant'
  const currentRole = profile?.role || 'tenant';
  const isPendingAgency = profile?.account_status === 'pending_qualification';

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
        navigate('/hosting');
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

  // Define navigation items based on role
  const tenantNavItems = user ? [
    { href: "/search", label: t('header.search') },
    { href: "/favourites", label: t('header.saved') },
    { href: "/inbox", label: `${t('header.messages')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` }
  ] : [
    { href: "/search", label: t('header.search') }
  ];

  const listerNavItems = [
    ...(user ? [
      { href: "/hosting", label: "Hosting" },
      { href: "/hosting/my-listings", label: t('header.myListings') }
    ] : []),
    { href: "/hosting/inbox", label: `${t('header.messages')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` }
  ];

  const currentNavItems = currentRole === 'tenant' ? tenantNavItems : listerNavItems;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo - unchanged */}
            <Link 
              to={user && currentRole === 'lister' ? '/hosting' : '/'} 
              className="flex items-center space-x-3"
            >
              <img 
                src={hommiLogo} 
                alt="Hommi" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl"
              />
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Hommi
              </span>
            </Link>

            {/* Centered Desktop Navigation */}
            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
              {currentNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`text-sm font-medium transition-colors relative py-6 ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Role switch text link - only show if user can switch */}
              {user && profile?.can_switch_roles && (
                <button
                  onClick={() => handleRoleSwitch(currentRole === 'tenant' ? 'lister' : 'tenant')}
                  className="text-sm font-medium text-foreground hover:bg-muted px-3 py-2 rounded-full transition-colors"
                >
                  {currentRole === 'tenant' ? t('header.switchToLister') : t('header.switchToTenant')}
                </button>
              )}

              {/* Publish listing button - only for logged out users */}
              {!user && (
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

              {/* Menu button with avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="rounded-full border border-border hover:shadow-md transition-shadow px-3 py-2 h-auto space-x-3"
                  >
                    <Menu className="h-4 w-4" />
                    {user ? (
                      <AvatarWithBadge
                        src={profile?.avatar_url}
                        alt={profile?.display_name || 'User'}
                        fallback={profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        verificationsJson={profile?.verifications_json as any}
                        className="h-8 w-8"
                      />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/me')}>
                        <User className="h-4 w-4 mr-2" />
                        {t('header.profile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        {t('header.settings')}
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          {t('header.admin')}
                        </DropdownMenuItem>
                      )}
                      {currentRole === 'tenant' && (
                        <DropdownMenuItem onClick={() => navigate('/search-preferences')}>
                          {t('profile.preferences')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/help')}>
                        Help
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleLanguage}>
                        <Globe className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'English' : 'Ελληνικά'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('header.logout')}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleAuthAction('login')}>
                        <User className="h-4 w-4 mr-2" />
                        {t('header.login')} / {t('header.signup')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/help')}>
                        Help
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleLanguage}>
                        <Globe className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'English' : 'Ελληνικά'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border py-4">
              <nav className="space-y-1">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {!user && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
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
                    {profile?.can_switch_roles && (
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
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={toggleLanguage}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'English' : 'Ελληνικά'}
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
                  <>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={toggleLanguage}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'English' : 'Ελληνικά'}
                    </Button>
                  </>
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