import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRooms } from '@/hooks/useSavedRooms';

/**
 * Hook to manage the auth-gated save room flow.
 * When unauthenticated users try to save a room:
 * 1. Opens auth modal
 * 2. Stores pending room ID
 * 3. After successful auth, automatically saves the room
 */
export const useSaveRoomFlow = () => {
  const { user } = useAuth();
  const { saveRoom, unsaveRoom, isRoomSaved } = useSavedRooms();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  /**
   * Initiates the save flow for a room.
   * If authenticated: saves immediately
   * If not authenticated: opens auth modal and stores room ID
   */
  const initiateSaveFlow = async (roomId: string) => {
    // If already saved, unsave it (toggle behavior)
    if (isRoomSaved(roomId)) {
      return await unsaveRoom(roomId);
    }

    // If user is authenticated, save immediately
    if (user) {
      return await saveRoom(roomId);
    }

    // Not authenticated: store room ID and open auth modal
    setPendingRoomId(roomId);
    setIsAuthOpen(true);
    
    return { success: false, error: 'authentication_required' };
  };

  /**
   * Called after successful authentication.
   * Saves the pending room if one exists.
   */
  const handleAuthSuccess = async () => {
    setIsAuthOpen(false);
    
    if (pendingRoomId) {
      const result = await saveRoom(pendingRoomId);
      setPendingRoomId(null);
      return result;
    }
    
    return { success: false, error: 'no_pending_room' };
  };

  /**
   * Closes auth modal and clears pending state
   */
  const closeAuth = () => {
    setIsAuthOpen(false);
    setPendingRoomId(null);
  };

  return {
    isAuthOpen,
    initiateSaveFlow,
    handleAuthSuccess,
    closeAuth,
    hasPendingRoom: !!pendingRoomId
  };
};
