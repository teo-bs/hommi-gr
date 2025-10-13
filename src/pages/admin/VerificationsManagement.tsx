import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import { VerificationViewer } from '@/components/admin/VerificationViewer';

type VerificationStatus = 'all' | 'unverified' | 'verified' | 'pending';

export default function VerificationsManagement() {
  const [status, setStatus] = useState<VerificationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  const { data: verifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-verifications', status, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: verificationData, error } = await query;

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = verificationData?.map(v => v.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, email, avatar_url')
        .in('user_id', userIds);

      // Map profiles to verifications
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const verificationsWithUsers = verificationData?.map(v => ({
        ...v,
        user: profilesMap.get(v.user_id),
      })) || [];

      // Apply search filter
      if (searchQuery) {
        return verificationsWithUsers.filter(v => 
          v.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return verificationsWithUsers;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', text: 'Εκκρεμεί' },
      unverified: { variant: 'secondary', text: 'Μη επαληθευμένο' },
      verified: { variant: 'default', text: 'Επαληθευμένο' },
    };

    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      govgr: 'Ταυτότητα',
      phone: 'Τηλέφωνο',
      email: 'Email',
      facebook: 'Facebook',
      google: 'Google',
    };
    return labels[kind] || kind;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Επαληθεύσεις KYC</h1>
        <p className="text-muted-foreground">Έγκριση επαληθεύσεων ταυτότητας χρηστών</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Επαληθεύσεις</CardTitle>
          <CardDescription>Διαχειριστείτε όλες τις επαληθεύσεις της πλατφόρμας</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={(v) => setStatus(v as VerificationStatus)}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="all">Όλες</TabsTrigger>
                <TabsTrigger value="unverified">Εκκρεμείς</TabsTrigger>
                <TabsTrigger value="verified">Επαληθευμένες</TabsTrigger>
                <TabsTrigger value="pending">Αναμονή</TabsTrigger>
              </TabsList>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση χρήστη..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <TabsContent value={status} className="mt-0">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !verifications?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  Δεν βρέθηκαν επαληθεύσεις
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Χρήστης</TableHead>
                        <TableHead>Τύπος</TableHead>
                        <TableHead>Ημερομηνία</TableHead>
                        <TableHead>Κατάσταση</TableHead>
                        <TableHead className="text-right">Ενέργειες</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {verification.user?.avatar_url && (
                                <img
                                  src={verification.user.avatar_url}
                                  alt={verification.user.display_name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <div className="font-medium">{verification.user?.display_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{verification.user?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getKindLabel(verification.kind)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(verification.created_at).toLocaleDateString('el-GR')}
                          </TableCell>
                          <TableCell>{getStatusBadge(verification.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedVerification(verification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedVerification && (
        <VerificationViewer
          verification={selectedVerification}
          open={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
