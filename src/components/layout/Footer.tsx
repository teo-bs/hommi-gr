import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hommiLogo from "@/assets/hommi-logo-new.png";

export const Footer = () => {
  return (
    <footer className="hidden lg:block bg-surface-elevated border-t border-border py-12 sm:py-16 px-safe pb-safe">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">
          {/* Logo & Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={hommiLogo} alt="Hommi" className="h-8 w-8" />
              <span className="text-2xl font-bold">Hommi</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Η πλατφόρμα συγκατοίκησης που εμπιστεύονται χιλιάδες άνθρωποι στην Ελλάδα.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-xs text-muted-foreground">Gov.gr verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Πλοήγηση</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/search" className="text-muted-foreground hover:text-primary transition-colors">Αναζήτηση</a></li>
              <li><a href="/publish" className="text-muted-foreground hover:text-primary transition-colors">Δημοσίευση αγγελίας</a></li>
              <li><a href="/overview" className="text-muted-foreground hover:text-primary transition-colors">Το προφίλ μου</a></li>
              <li><a href="/inbox" className="text-muted-foreground hover:text-primary transition-colors">Μηνύματα</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Υποστήριξη</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/help" className="text-muted-foreground hover:text-primary transition-colors">Κέντρο βοήθειας</a></li>
              <li><a href="/safety" className="text-muted-foreground hover:text-primary transition-colors">Ασφάλεια</a></li>
              <li><a href="/agencies" className="text-muted-foreground hover:text-primary transition-colors">Για agencies</a></li>
              <li><a href="mailto:support@hommi.gr" className="text-muted-foreground hover:text-primary transition-colors">Επικοινωνία</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Νέες αγγελίες και tips για συγκατοίκηση
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email σου"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <Button size="sm" className="px-4">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Hommi. Με την επιφύλαξη παντός δικαιώματος.</p>
          <div className="flex gap-6">
            <a href="/legal/terms" className="hover:text-primary transition-colors">Όροι χρήσης</a>
            <a href="/legal/privacy" className="hover:text-primary transition-colors">Απόρρητο</a>
            <a href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
