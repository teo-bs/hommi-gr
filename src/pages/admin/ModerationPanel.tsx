import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flag, MessageCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Report {
  id: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
  reporter: {
    display_name: string;
    avatar_url?: string;
  };
  message?: {
    id: string;
    body: string;
    sender: {
      display_name: string;
    };
  };
  thread?: {
    id: string;
    listing: {
      title: string;
    };
  };
}

const ModerationPanel = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [messageReports, setMessageReports] = useState<Report[]>([]);
  const [threadReports, setThreadReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Fetch message reports
      const { data: msgReports, error: msgError } = await supabase
        .from('reported_messages')
        .select(`
          id,
          reason,
          details,
          status,
          created_at,
          admin_notes,
          reporter:profiles!reported_messages_reporter_id_fkey(
            display_name,
            avatar_url
          ),
          message:messages(
            id,
            body,
            sender:profiles!messages_sender_id_fkey(
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (msgError) throw msgError;

      // Fetch thread reports
      const { data: thrdReports, error: thrdError } = await supabase
        .from('reported_threads')
        .select(`
          id,
          reason,
          details,
          status,
          created_at,
          admin_notes,
          reporter:profiles!reported_threads_reporter_id_fkey(
            display_name,
            avatar_url
          ),
          thread:threads(
            id,
            listing:listings(
              title
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (thrdError) throw thrdError;

      setMessageReports(msgReports as any || []);
      setThreadReports(thrdReports as any || []);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η φόρτωση των αναφορών',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: string,
    table: 'reported_messages' | 'reported_threads'
  ) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
          admin_notes: adminNotes
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Η κατάσταση της αναφοράς ενημερώθηκε'
      });

      setSelectedReport(null);
      setAdminNotes('');
      await fetchReports();
    } catch (err: any) {
      console.error('Error updating report:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η ενημέρωση της αναφοράς',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'default', label: 'Εκκρεμεί' },
      reviewed: { variant: 'secondary', label: 'Εξετάστηκε' },
      actioned: { variant: 'default', label: 'Ενέργεια' },
      dismissed: { variant: 'outline', label: 'Απορρίφθηκε' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const ReportCard = ({ report, table }: { report: Report; table: 'reported_messages' | 'reported_threads' }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={report.reporter?.avatar_url} />
              <AvatarFallback>{report.reporter?.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{report.reporter?.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(report.created_at).toLocaleDateString('el-GR')}
              </p>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Λόγος</p>
            <p className="text-sm">{report.reason}</p>
          </div>

          {report.details && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Λεπτομέρειες</p>
              <p className="text-sm">{report.details}</p>
            </div>
          )}

          {report.message && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Μήνυμα</p>
              <div className="bg-muted p-2 rounded text-sm">
                <p className="font-medium text-xs mb-1">{report.message.sender?.display_name}</p>
                <p>{report.message.body}</p>
              </div>
            </div>
          )}

          {report.thread && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Συνομιλία</p>
              <p className="text-sm">{report.thread.listing?.title}</p>
            </div>
          )}
        </div>

        {report.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedReport(report);
                setAdminNotes('');
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Εξέταση
            </Button>
          </div>
        )}

        {selectedReport?.id === report.id && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <label className="text-sm font-medium">Σημειώσεις διαχειριστή</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Προσθέστε σημειώσεις..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateReportStatus(report.id, 'dismissed', table)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Απόρριψη
              </Button>
              <Button
                size="sm"
                onClick={() => updateReportStatus(report.id, 'actioned', table)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Ενέργεια
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Πίνακας Διαμεσολάβησης</h1>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Αναφορές Μηνυμάτων ({messageReports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Αναφορές Συνομιλιών ({threadReports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">Φόρτωση...</div>
            ) : messageReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Δεν υπάρχουν αναφορές μηνυμάτων</p>
                </CardContent>
              </Card>
            ) : (
              messageReports.map((report) => (
                <ReportCard key={report.id} report={report} table="reported_messages" />
              ))
            )}
          </TabsContent>

          <TabsContent value="threads" className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">Φόρτωση...</div>
            ) : threadReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Δεν υπάρχουν αναφορές συνομιλιών</p>
                </CardContent>
              </Card>
            ) : (
              threadReports.map((report) => (
                <ReportCard key={report.id} report={report} table="reported_threads" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
};

export default ModerationPanel;
