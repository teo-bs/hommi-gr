import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <div className="min-h-screen bg-background font-sans antialiased">
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
                <Route path="/admin/photo-health" element={<PhotoHealth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
