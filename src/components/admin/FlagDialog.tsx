import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FlagDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  listingTitle: string;
}

export function FlagDialog({ open, onClose, onConfirm, listingTitle }: FlagDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Επισήμανση Αγγελίας</DialogTitle>
          <DialogDescription>
            Επισήμανση: "{listingTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Λόγος επισήμανσης</Label>
            <Textarea
              id="reason"
              placeholder="π.χ. Ακατάλληλο περιεχόμενο, παραπλανητικές πληροφορίες..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Ακύρωση
          </Button>
          <Button onClick={handleConfirm} disabled={!reason.trim()}>
            Επισήμανση
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
