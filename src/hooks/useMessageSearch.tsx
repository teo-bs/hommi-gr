import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
}

export function useMessageSearch(threadId: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async (query: string) => {
    if (!query.trim() || !threadId) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          body,
          created_at,
          sender_id,
          sender:profiles!messages_sender_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId)
        .ilike('body', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      console.error('Error searching messages:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      search(query);
    } else {
      setResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return {
    searchQuery,
    results,
    isSearching,
    search: handleSearchChange,
    clearSearch
  };
}
