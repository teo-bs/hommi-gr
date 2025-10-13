import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, Users, Home, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: pendingListings },
        { count: pendingKyc },
        { count: totalUsers },
        { count: publishedListings },
      ] = await Promise.all([
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft')
          .is('deleted_at', null),
        supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unverified')
          .eq('kind', 'govgr'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .is('deleted_at', null),
      ]);

      return {
        pendingListings: pendingListings || 0,
        pendingKyc: pendingKyc || 0,
        totalUsers: totalUsers || 0,
        publishedListings: publishedListings || 0,
      };
    },
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, created_at, status, owner:profiles!owner_id(display_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: verifications } = await supabase
        .from('verifications')
        .select('id, kind, created_at, status, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user profiles for verifications
      const userIds = verifications?.map(v => v.user_id).filter(Boolean) || [];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, user_id, display_name')
        .in('user_id', userIds);

      const usersMap = new Map(users?.map(u => [u.user_id, u]) || []);

      const combined = [
        ...(listings || []).map(l => ({
          type: 'listing',
          title: `Νέα αγγελία: ${l.title}`,
          user: l.owner?.display_name || 'Unknown',
          date: new Date(l.created_at),
          status: l.status,
        })),
        ...(verifications || []).map(v => ({
          type: 'verification',
          title: `Αίτημα επαλήθευσης: ${v.kind}`,
          user: usersMap.get(v.user_id)?.display_name || 'Unknown',
          date: new Date(v.created_at),
          status: v.status,
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

      return combined;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Διαχείριση πλατφόρμας Hommi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Εκκρεμείς Αγγελίες</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.pendingListings}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Εκκρεμείς KYC</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.pendingKyc}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σύνολο Χρηστών</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Δημοσιευμένες</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.publishedListings}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Πρόσφατη Δραστηριότητα
          </CardTitle>
          <CardDescription>Τελευταίες 10 ενέργειες στην πλατφόρμα</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity?.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      από {activity.user} • {new Date(activity.date).toLocaleString('el-GR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Γρήγορες Ενέργειες</CardTitle>
          <CardDescription>Συντομεύσεις για κοινές εργασίες</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-4 flex-col items-start">
            <Link to="/admin/listings">
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Έλεγχος Αγγελιών</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats?.pendingListings || 0} εκκρεμούν
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex-col items-start">
            <Link to="/admin/verifications">
              <ShieldCheck className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Επαλήθευση KYC</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats?.pendingKyc || 0} εκκρεμούν
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex-col items-start">
            <Link to="/admin/photo-health">
              <Activity className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Υγεία Φωτογραφιών</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Έλεγχος ποιότητας
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
