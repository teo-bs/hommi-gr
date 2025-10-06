import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface OwnerGalleryActionsProps {
  photoId: string;
  isCover: boolean;
  photoType: 'listing_photos' | 'room_photos';
  parentId: string; // listing_id or room_id
  onUpdate: () => void;
}

export const OwnerGalleryActions = ({
  photoId,
  isCover,
  photoType,
  parentId,
  onUpdate
}: OwnerGalleryActionsProps) => {
  const [isSettingCover, setIsSettingCover] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSetCover = async () => {
    if (isCover) return; // Already cover
    
    setIsSettingCover(true);
    
    try {
      // Optimistically update UI
      onUpdate();
      
      // Update via direct UPDATE (trigger handles atomic flip)
      const { error } = await supabase
        .from(photoType)
        .update({ is_cover: true })
        .eq('id', photoId);

      if (error) throw error;

      toast.success("Η φωτογραφία ορίστηκε ως εξώφυλλο");
      
      // Refetch to get accurate state
      setTimeout(onUpdate, 500);
    } catch (error: any) {
      console.error('Error setting cover:', error);
      
      if (error?.code === '42501' || error?.code === 'PGRST301') {
        toast.error("Δεν έχετε δικαίωμα για αυτή την ενέργεια");
      } else {
        toast.error("Σφάλμα κατά τον ορισμό εξώφυλλου");
      }
      
      onUpdate(); // Revert optimistic update
    } finally {
      setIsSettingCover(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const nowISO = new Date().toISOString();
      
      const { error } = await supabase
        .from(photoType)
        .update({ deleted_at: nowISO } as any)
        .eq('id', photoId);

      if (error) throw error;

      toast.success("Η φωτογραφία διαγράφηκε");
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      
      if (error?.code === '42501' || error?.code === 'PGRST301') {
        toast.error("Δεν έχετε δικαίωμα για αυτή την ενέργεια");
      } else {
        toast.error("Σφάλμα κατά τη διαγραφή");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant={isCover ? "default" : "secondary"}
          onClick={handleSetCover}
          disabled={isCover || isSettingCover}
          className="gap-1"
        >
          {isSettingCover ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Star className="h-4 w-4" fill={isCover ? "currentColor" : "none"} />
          )}
          {isCover ? "Εξώφυλλο" : "Ορισμός"}
        </Button>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="gap-1"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Διαγραφή
        </Button>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Διαγραφή φωτογραφίας;"
        description="Η φωτογραφία θα αφαιρεθεί από την αγγελία σας."
        confirmText="Διαγραφή"
      />
    </>
  );
};
