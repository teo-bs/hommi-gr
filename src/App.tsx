import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Header } from "@/components/layout/Header";
import { GlobalTermsHandler } from "@/components/auth/GlobalTermsHandler";

import Index from "./pages/Index";
import Search from "./pages/Search";
import RoomPage from "./pages/RoomPage";
import NotFound from "./pages/NotFound";
import Favourites from "./pages/Favourites";
import Overview from "./pages/Overview";
import MyListings from "./pages/MyListings";
import Help from "./pages/Help";
import SearchPreferences from "@/pages/SearchPreferences";
import Profile from "@/pages/Profile";
import Publish from "./pages/Publish";
import Agencies from "./pages/Agencies";
import Inbox from "./pages/Inbox";
import Settings from "./pages/Settings";
import PhotoHealth from "./pages/admin/PhotoHealth";
import AdminDashboard from "./pages/admin/Dashboard";
import ListingsManagement from "./pages/admin/ListingsManagement";
import VerificationsManagement from "./pages/admin/VerificationsManagement";
import { AdminGuard } from "./components/admin/AdminGuard";
import { ImpersonationBanner } from "./components/layout/ImpersonationBanner";
import ActivityLog from "./pages/admin/ActivityLog";

const queryClient = new QueryClient();

const AppContent = () => {
  const { refetch: refetchUnreadCount } = useUnreadCount();
  
  useRealtimeNotifications({
    onNewMessage: refetchUnreadCount
  });

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased">
        <ImpersonationBanner />
        <Header />
        <GlobalTermsHandler />
        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listing/:slug" element={<RoomPage />} />
            <Route path="/room/:id" element={<RoomPage />} /> {/* Legacy redirect */}
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/search-preferences" element={<SearchPreferences />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/listings" element={<AdminGuard><ListingsManagement /></AdminGuard>} />
            <Route path="/admin/verifications" element={<AdminGuard><VerificationsManagement /></AdminGuard>} />
            <Route path="/admin/photo-health" element={<AdminGuard><PhotoHealth /></AdminGuard>} />
            <Route path="/admin/activity-log" element={<AdminGuard><ActivityLog /></AdminGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
