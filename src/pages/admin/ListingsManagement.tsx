import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { ListingsTable } from '@/components/admin/ListingsTable';
import { useSearchCacheRefresh } from '@/hooks/useSearchCacheRefresh';
import { toast } from 'sonner';

type ListingStatus = 'all' | 'draft' | 'published' | 'archived';

export default function ListingsManagement() {
  const [status, setStatus] = useState<ListingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { mutate: refreshCache, isPending: isRefreshing } = useSearchCacheRefresh();

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['admin-listings', status, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          owner:profiles!owner_id(id, display_name, email, avatar_url),
          photos:listing_photos(url, is_cover)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,owner.display_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Διαχείριση Αγγελιών</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Έγκριση και έλεγχος αγγελιών</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Αγγελίες</CardTitle>
              <CardDescription>Διαχειριστείτε όλες τις αγγελίες της πλατφόρμας</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                refreshCache(undefined, {
                  onSuccess: () => toast.success('Η λίστα αναζήτησης ενημερώθηκε'),
                  onError: () => toast.error('Σφάλμα ενημέρωσης λίστας')
                });
              }}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Ανανέωση Cache
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={(v) => setStatus(v as ListingStatus)}>
            <div className="flex flex-col gap-4 mb-6">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-4 min-h-[44px]">
                  <TabsTrigger value="all">Όλες</TabsTrigger>
                  <TabsTrigger value="draft">Εκκρεμείς</TabsTrigger>
                  <TabsTrigger value="published">Δημοσιευμένες</TabsTrigger>
                  <TabsTrigger value="archived">Αρχειοθετημένες</TabsTrigger>
                </TabsList>
              </div>

              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Αναζήτηση αγγελίας ή ιδιοκτήτη..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                  inputMode="search"
                />
              </div>
            </div>

            <TabsContent value={status} className="mt-0">
              <ListingsTable 
                listings={listings || []} 
                isLoading={isLoading}
                onRefetch={refetch}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
