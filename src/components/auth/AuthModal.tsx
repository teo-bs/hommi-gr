import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Mail, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (type: 'login' | 'signup') => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα πεδία",
        variant: "destructive",
      });
      return;
    }

    if (type === 'signup' && formData.password !== formData.confirmPassword) {
      toast({
        title: "Σφάλμα",
        description: "Οι κωδικοί πρόσβασης δεν ταιριάζουν",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = type === 'signup' 
        ? await signUp(formData.email, formData.password)
        : await signIn(formData.email, formData.password);

      if (error) {
        let errorMessage = "Παρουσιάστηκε σφάλμα";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Λάθος email ή κωδικός πρόσβασης";
        } else if (error.message.includes('User already registered')) {
          errorMessage = "Το email είναι ήδη εγγεγραμμένο";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Παρακαλώ επιβεβαιώστε το email σας";
        }
        
        toast({
          title: "Σφάλμα",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: type === 'signup' ? "Επιτυχής εγγραφή!" : "Επιτυχής σύνδεση!",
          description: type === 'signup' 
            ? "Ελέγξτε το email σας για επιβεβαίωση" 
            : "Καλώς ήρθατε στο Hommi!",
        });
        
        // Track analytics
        console.log(`${type}_success`, {
          method: 'email',
          timestamp: Date.now()
        });
        
        onClose();
        setFormData({ email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η σύνδεση με Google",
          variant: "destructive",
        });
      } else {
        // Track analytics
        console.log('login_success', {
          method: 'google',
          timestamp: Date.now()
        });
        
        onClose();
      }
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Καλώς ήρθατε στο Hommi
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Σύνδεση</TabsTrigger>
            <TabsTrigger value="signup">Εγγραφή</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Κωδικός πρόσβασης</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => handleSubmit('login')} 
              className="w-full" 
              disabled={loading}
              variant="hero"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? "Σύνδεση..." : "Σύνδεση"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Κωδικός πρόσβασης</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Επιβεβαίωση κωδικού</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              onClick={() => handleSubmit('signup')} 
              className="w-full" 
              disabled={loading}
              variant="hero"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? "Εγγραφή..." : "Δημιουργία λογαριασμού"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ή συνεχίστε με
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full"
        >
          <Chrome className="w-4 h-4 mr-2" />
          Google
        </Button>
      </DialogContent>
    </Dialog>
  );
};