import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Eye, Shield, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeTooltipProps {
  profileCompletionPct: number;
}

export const WelcomeTooltip = ({ profileCompletionPct }: WelcomeTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome tooltip
    const hasSeenWelcome = localStorage.getItem('profile_welcome_seen');
    
    if (!hasSeenWelcome) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('profile_welcome_seen', 'true');
    }, 300);
  };

  if (!isVisible) return null;

  const needsCompletion = profileCompletionPct < 80;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in",
        isAnimatingOut && "animate-fade-out"
      )}
      onClick={handleDismiss}
    >
      <Card 
        className={cn(
          "max-w-2xl w-full shadow-2xl animate-scale-in border-primary/20",
          isAnimatingOut && "animate-scale-out"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl pr-8">
            Καλώς ήρθατε στο Προφίλ σας! 👋
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Completion Encouragement */}
          {needsCompletion && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-fade-in">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    Ολοκληρώστε το προφίλ σας στο 80%+
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Τα πλήρη προφίλ έχουν περισσότερες πιθανότητες για επιτυχημένες συνεργασίες και εμφανίζονται πιο ψηλά στα αποτελέσματα αναζήτησης.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Explanation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Οι 3 καρτέλες του προφίλ σας:</h3>
            
            <div className="grid gap-3">
              {/* Overview Tab */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Επισκόπηση</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Δείτε πώς φαίνεται το προφίλ σας σε άλλους χρήστες. Εδώ εμφανίζονται όλες οι πληροφορίες σας σε μορφή προεπισκόπησης.
                  </p>
                </div>
              </div>

              {/* Verifications Tab */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Επαληθεύσεις</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Επαληθεύστε την ταυτότητά σας (Gov.gr, email, τηλέφωνο) για να αυξήσετε την εμπιστοσύνη των άλλων χρηστών.
                  </p>
                </div>
              </div>

              {/* Settings Tab */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Ρυθμίσεις</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Επεξεργαστείτε τα προσωπικά σας στοιχεία, προσθέστε βιογραφικό σημείωμα, γλώσσες και κοινωνικά δίκτυα.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleDismiss}
              className="flex-1 min-h-[44px]"
            >
              Ας ξεκινήσουμε!
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="min-h-[44px]"
            >
              Κλείσιμο
            </Button>
          </div>

          {/* Small note */}
          <p className="text-xs text-muted-foreground text-center">
            Μπορείτε πάντα να μεταβείτε μεταξύ των καρτελών για να δείτε ή να επεξεργαστείτε τις πληροφορίες σας
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
