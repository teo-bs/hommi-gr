import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useState } from "react";

interface PhotoHealthStats {
  totalPhotos: number;
  brokenPhotos: number;
  healthPercentage: number;
  affectedListers: number;
}

interface HealthCheckRun {
  id: string;
  last_run_at: string;
  photos_checked: number;
  broken_found: number;
  run_duration_ms: number;
}

interface ListerWithBrokenPhotos {
  lister_id: string;
  display_name: string;
  email: string;
  broken_count: number;
}

export default function PhotoHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch overall photo health stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['photo-health-stats'],
    queryFn: async (): Promise<PhotoHealthStats> => {
      // Count total photos
      const { count: totalPhotos } = await supabase
        .from('room_photos')
        .select('*', { count: 'exact', head: true });

      // Count broken photos
      const { data: brokenPhotos } = await supabase
        .from('broken_photos_log')
        .select('photo_url', { count: 'exact' })
        .is('resolved_at', null);

      // Count affected listers
      const { data: affectedListers } = await supabase
        .from('broken_photos_log')
        .select('lister_id', { count: 'exact' })
        .is('resolved_at', null);

      const uniqueListers = new Set(affectedListers?.map(l => l.lister_id) || []).size;
      const brokenCount = brokenPhotos?.length || 0;
      const total = totalPhotos || 1;

      return {
        totalPhotos: totalPhotos || 0,
        brokenPhotos: brokenCount,
        healthPercentage: Math.round(((total - brokenCount) / total) * 100),
        affectedListers: uniqueListers,
      };
    },
  });

  // Fetch recent health check runs
  const { data: recentRuns } = useQuery({
    queryKey: ['photo-health-runs'],
    queryFn: async (): Promise<HealthCheckRun[]> => {
      const { data } = await supabase
        .from('photo_health_check_status')
        .select('*')
        .order('last_run_at', { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  // Fetch top listers with broken photos
  const { data: topListers } = useQuery({
    queryKey: ['top-broken-photo-listers'],
    queryFn: async (): Promise<ListerWithBrokenPhotos[]> => {
      const { data } = await supabase
        .from('broken_photos_log')
        .select(`
          lister_id,
          profiles!inner (
            display_name,
            email
          )
        `)
        .is('resolved_at', null);

      if (!data) return [];

      // Group by lister
      const listerMap = new Map<string, ListerWithBrokenPhotos>();
      for (const row of data) {
        const listerId = row.lister_id;
        const profile = (row as any).profiles;

        if (!listerMap.has(listerId)) {
          listerMap.set(listerId, {
            lister_id: listerId,
            display_name: profile.display_name,
            email: profile.email,
            broken_count: 0,
          });
        }

        listerMap.get(listerId)!.broken_count++;
      }

      return Array.from(listerMap.values())
        .sort((a, b) => b.broken_count - a.broken_count)
        .slice(0, 20);
    },
  });

  const handleForceValidation = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('validate-listing-photos');
      
      if (error) throw error;

      toast.success('Photo validation started');
      setTimeout(() => {
        refetchStats();
      }, 2000);
    } catch (error) {
      console.error('Error triggering validation:', error);
      toast.error('Failed to start validation');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Photo Health Dashboard | Hommi Admin</title>
        <meta name="description" content="Monitor photo health metrics and broken photo reports" />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Photo Health Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor photo health across all listings
            </p>
          </div>
          <Button
            onClick={handleForceValidation}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Force Re-validate
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPhotos.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broken Photos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats?.brokenPhotos.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              {(stats?.healthPercentage || 0) >= 95 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.healthPercentage || 0}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affected Listers</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.affectedListers || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Health Check Runs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Validation Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRuns && recentRuns.length > 0 ? (
                  recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">
                          {new Date(run.last_run_at).toLocaleDateString('el-GR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {run.photos_checked.toLocaleString()} photos checked
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${run.broken_found > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {run.broken_found > 0 ? (
                            <>{run.broken_found} broken</>
                          ) : (
                            <CheckCircle className="h-5 w-5 inline" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(run.run_duration_ms / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No validation runs yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Listers with Broken Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Listers with Broken Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topListers && topListers.length > 0 ? (
                  topListers.map((lister) => (
                    <div key={lister.lister_id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{lister.display_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{lister.email}</div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-semibold">
                          {lister.broken_count}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No broken photos found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
