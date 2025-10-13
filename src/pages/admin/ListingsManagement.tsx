import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ListingsTable } from '@/components/admin/ListingsTable';

type ListingStatus = 'all' | 'draft' | 'published' | 'archived';

export default function ListingsManagement() {
  const [status, setStatus] = useState<ListingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Διαχείριση Αγγελιών</h1>
        <p className="text-muted-foreground">Έγκριση και έλεγχος αγγελιών</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Αγγελίες</CardTitle>
          <CardDescription>Διαχειριστείτε όλες τις αγγελίες της πλατφόρμας</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={(v) => setStatus(v as ListingStatus)}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="all">Όλες</TabsTrigger>
                <TabsTrigger value="draft">Εκκρεμείς</TabsTrigger>
                <TabsTrigger value="published">Δημοσιευμένες</TabsTrigger>
                <TabsTrigger value="archived">Αρχειοθετημένες</TabsTrigger>
              </TabsList>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση αγγελίας ή ιδιοκτήτη..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
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
