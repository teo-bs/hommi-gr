import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SavedRoom {
  id: string;
  user_id: string;
  room_id: string;
  created_at: string;
}

export const useSavedRooms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's saved rooms (only active, not soft-deleted)
  const fetchSavedRooms = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_rooms')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved rooms:', error);
        return;
      }

      setSavedRooms(data || []);
    } catch (error) {
      console.error('Error fetching saved rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a room is saved
  const isRoomSaved = (roomId: string): boolean => {
    return savedRooms.some(saved => saved.room_id === roomId);
  };

  // Save a room (upsert with deduplication + restore if previously deleted)
  const saveRoom = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      // Return error code without toast - let the flow hook handle auth modal
      return { success: false, error: 'not_authenticated' };
    }

    try {
      // Use upsert with onConflict to dedupe and restore if previously deleted
      const { data, error } = await supabase
        .from('saved_rooms')
        .upsert(
          [{ user_id: user.id, room_id: roomId, deleted_at: null }],
          { onConflict: 'user_id,room_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving room:', error);
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η αποθήκευση του δωματίου",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      // Refresh the list
      await fetchSavedRooms();
      
      toast({
        title: "Αποθηκεύτηκε",
        description: "Το δωμάτιο αποθηκεύτηκε στα αγαπημένα σας",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving room:', error);
      return { success: false, error: 'Unknown error' };
    }
  };

  // Unsave a room (soft delete instead of hard delete)
  const unsaveRoom = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const nowISO = new Date().toISOString();
      
      const { error } = await supabase
        .from('saved_rooms')
        .update({ deleted_at: nowISO })
        .eq('user_id', user.id)
        .eq('room_id', roomId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error unsaving room:', error);
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η αφαίρεση του δωματίου από τα αγαπημένα",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      // Refresh the list
      await fetchSavedRooms();
      
      toast({
        title: "Αφαιρέθηκε",
        description: "Το δωμάτιο αφαιρέθηκε από τα αγαπημένα σας",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error unsaving room:', error);
      return { success: false, error: 'Unknown error' };
    }
  };

  // Toggle save status
  const toggleSaveRoom = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    if (isRoomSaved(roomId)) {
      return await unsaveRoom(roomId);
    } else {
      return await saveRoom(roomId);
    }
  };

  // Get saved rooms count
  const getSavedRoomsCount = (): number => {
    return savedRooms.length;
  };

  // Load saved rooms on mount and auth state change
  useEffect(() => {
    if (user) {
      fetchSavedRooms();
    } else {
      setSavedRooms([]);
    }
  }, [user]);

  return {
    savedRooms,
    loading,
    isRoomSaved,
    saveRoom,
    unsaveRoom,
    toggleSaveRoom,
    getSavedRoomsCount,
    refetch: fetchSavedRooms
  };
};