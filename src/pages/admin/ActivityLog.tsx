import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

export default function ActivityLog() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activity-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_impersonations')
        .select(`
          *,
          admin:admin_user_id(id, email, display_name),
          target:target_user_id(id, email, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ιστορικό Ενεργειών Admin</h1>
        <p className="text-muted-foreground">Παρακολούθηση impersonations και ενεργειών διαχειριστών</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Πρόσφατες Ενέργειες</CardTitle>
          <CardDescription>Τελευταία 100 impersonations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ημερομηνία</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Χρήστης</TableHead>
                  <TableHead>Λόγος</TableHead>
                  <TableHead>Διάρκεια</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: el })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.admin?.display_name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{activity.admin?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{activity.target?.display_name || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{activity.target?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{activity.reason}</TableCell>
                    <TableCell>
                      {activity.ended_at
                        ? `${Math.round((new Date(activity.ended_at).getTime() - new Date(activity.started_at).getTime()) / 60000)} λεπτά`
                        : 'Σε εξέλιξη'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {activity.ip_address || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Δεν βρέθηκαν ενέργειες
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
