import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Phone,
  Eye,
  Download,
  Trash2,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlockedUsersSection } from "@/components/settings/BlockedUsersSection";

const Settings = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailBookings: true,
    pushMessages: false,
    smsMessages: false,
  });
  const [supportMessage, setSupportMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Ενημέρωση αποθηκεύτηκε",
      description: "Οι ρυθμίσεις ειδοποιήσεων ενημερώθηκαν.",
    });
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setLoading(true);
    
    // Simulate sending support message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Μήνυμα εστάλη",
      description: "Το μήνυμά σας εστάλη στην ομάδα υποστήριξης. Θα λάβετε απάντηση σύντομα.",
    });
    
    setSupportMessage("");
    setLoading(false);
  };

  const handleDataDownload = () => {
    toast({
      title: "Λήψη δεδομένων",
      description: "Η λήψη των δεδομένων σας θα ξεκινήσει σύντομα.",
    });
  };

  const handleAccountDeletion = () => {
    toast({
      title: "Διαγραφή λογαριασμού",
      description: "Παρακαλώ επικοινωνήστε με την υποστήριξη για τη διαγραφή του λογαριασμού σας.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Ρυθμίσεις</h1>
      </div>

      <div className="space-y-8">
        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Ειδοποιήσεις</CardTitle>
            </div>
            <CardDescription>
              Διαχειριστείτε τις προτιμήσεις ειδοποιήσεων σας
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-messages">Email για μηνύματα</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Λάβετε email όταν λαμβάνετε νέο μήνυμα
                  </p>
                </div>
                <Switch
                  id="email-messages"
                  checked={notifications.emailMessages}
                  onCheckedChange={(checked) => handleNotificationChange('emailMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-bookings">Email για κρατήσεις</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Λάβετε email για νέες κρατήσεις και ενημερώσεις
                  </p>
                </div>
                <Switch
                  id="email-bookings"
                  checked={notifications.emailBookings}
                  onCheckedChange={(checked) => handleNotificationChange('emailBookings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="push-messages">Push notifications</Label>
                    <Badge variant="secondary">Σύντομα</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Λάβετε ειδοποιήσεις στον browser σας
                  </p>
                </div>
                <Switch
                  id="push-messages"
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) => handleNotificationChange('pushMessages', checked)}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <Label htmlFor="sms-messages">SMS μηνύματα</Label>
                    <Badge variant="secondary">Σύντομα</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Λάβετε SMS για σημαντικές ενημερώσεις
                  </p>
                </div>
                <Switch
                  id="sms-messages"
                  checked={notifications.smsMessages}
                  onCheckedChange={(checked) => handleNotificationChange('smsMessages', checked)}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Πολιτική Απορρήτου</CardTitle>
            </div>
            <CardDescription>
              Διαχείριση των δεδομένων και του απορρήτου σας
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Πολιτική Απορρήτου</h4>
                    <p className="text-sm text-muted-foreground">
                      Διαβάστε την πολιτική απορρήτου μας
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Προβολή
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Λήψη δεδομένων</h4>
                    <p className="text-sm text-muted-foreground">
                      Κατεβάστε όλα τα δεδομένα σας
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDataDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Λήψη
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div>
                    <h4 className="font-semibold text-destructive">Διαγραφή λογαριασμού</h4>
                    <p className="text-sm text-muted-foreground">
                      Διαγράψτε μόνιμα τον λογαριασμό σας
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleAccountDeletion}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Διαγραφή
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Users Section */}
        <BlockedUsersSection />

        {/* Support Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>Υποστήριξη</CardTitle>
            </div>
            <CardDescription>
              Χρειάζεστε βοήθεια; Στείλτε μας μήνυμα
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <Label htmlFor="support-message">Περιγράψτε το πρόβλημά σας</Label>
                <Textarea
                  id="support-message"
                  placeholder="Γράψτε το μήνυμά σας εδώ..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button type="submit" disabled={loading || !supportMessage.trim()}>
                {loading ? "Αποστολή..." : "Αποστολή μηνύματος"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-semibold">Άλλοι τρόποι επικοινωνίας</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@hommi.gr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageSquare className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Διαθέσιμο Δε-Πα 9:00-18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;