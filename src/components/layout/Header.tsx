import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, User, MessageSquare, Plus, Globe, Menu, X, Settings, Search, Calendar, LogOut, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useListingFlow } from "@/hooks/useListingFlow";
import { AuthModal } from "@/components/auth/AuthModal";
import { TermsPrivacyModal } from "@/components/auth/TermsPrivacyModal";
import { RoleSelectionScreen } from "@/components/listing/RoleSelectionScreen";
import { ListingWizard } from "@/components/listing/ListingWizard";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const listingFlow = useListingFlow();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('el'); // Greek default

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

  const handleRoleSwitch = (newRole: 'seeker' | 'lister') => {
    // TODO: Update user profile with new role
    console.log('Switching to role:', newRole);
  };

  // Determine user role - default to 'seeker' if not set
  const userRole = profile?.role || 'seeker';

  const menuItems: any[] = [];

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
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
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

              <Button 
                variant="outline" 
                size="sm" 
                className="border-foreground/20"
                onClick={handlePublishListing}
              >
                <Plus className="h-4 w-4 mr-2" />
                {language === 'el' ? 'Δημοσίευσε αγγελία' : 'List Property'}
              </Button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/inbox">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'Μηνύματα' : 'Messages'}
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Το προφίλ μου' : 'My profile'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
                      </DropdownMenuItem>
                      {userRole === 'seeker' ? (
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
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Αποσύνδεση' : 'Log out'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleSwitch(userRole === 'seeker' ? 'lister' : 'seeker')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {userRole === 'seeker' 
                          ? (language === 'el' ? 'Μετάβαση σε Lister' : 'Switch to Lister')
                          : (language === 'el' ? 'Μετάβαση σε Tenant' : 'Switch to Tenant')
                        }
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            <div className="md:hidden border-t border-border py-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {language === 'el' ? 'English' : 'Ελληνικά'}
                </Button>
                
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
                  {language === 'el' ? 'Δημοσίευσε αγγελία' : 'List Property'}
                </Button>

                {user ? (
                  <>
                    <Link to="/inbox" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {language === 'el' ? 'Μηνύματα' : 'Messages'}
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
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
                    {userRole === 'seeker' ? (
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
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {language === 'el' ? 'Αποσύνδεση' : 'Log out'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        handleRoleSwitch(userRole === 'seeker' ? 'lister' : 'seeker');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {userRole === 'seeker' 
                        ? (language === 'el' ? 'Μετάβαση σε Lister' : 'Switch to Lister')
                        : (language === 'el' ? 'Μετάβαση σε Tenant' : 'Switch to Tenant')
                      }
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

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <AuthModal 
        isOpen={listingFlow.authModalOpen} 
        onClose={listingFlow.closeAuth}
        onSuccess={listingFlow.handleAuthSuccess}
      />
      
      <TermsPrivacyModal
        isOpen={listingFlow.termsModalOpen}
        onAccept={listingFlow.handleTermsAccepted}
      />
      
      {listingFlow.roleSelectionOpen && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="min-h-screen">
            <RoleSelectionScreen
              onRoleSelected={listingFlow.handleRoleSelected}
              selectedRole={listingFlow.selectedRole || undefined}
            />
          </div>
        </div>
      )}
      
      {listingFlow.wizardOpen && listingFlow.selectedRole && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="min-h-screen">
            <ListingWizard
              role={listingFlow.selectedRole}
              initialDraft={listingFlow.currentDraft || undefined}
              onSave={listingFlow.handleDraftSaved}
              onPublish={listingFlow.handleListingPublished}
              onBack={listingFlow.closeWizard}
            />
          </div>
        </div>
      )}
    </>
  );
};