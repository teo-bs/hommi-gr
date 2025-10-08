import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckSquare, XSquare, Upload, Archive, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  showRestore?: boolean;
}

export const BulkActionsBar = ({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  showRestore = false,
}: BulkActionsBarProps) => {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const handleArchive = () => {
    onArchive();
    setArchiveDialogOpen(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg border-2">
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {selectedCount} επιλεγμέν{selectedCount === 1 ? 'η' : 'ες'}
            </span>
            <div className="h-4 w-px bg-border" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="gap-1"
            >
              <CheckSquare className="h-4 w-4" />
              Επιλογή όλων
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className="gap-1"
            >
              <XSquare className="h-4 w-4" />
              Αποεπιλογή
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onPublish}
              className="gap-1"
            >
              <Upload className="h-4 w-4" />
              Δημοσίευση
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUnpublish}
              className="gap-1"
            >
              Απόσυρση
            </Button>
            {showRestore ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestore}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Επαναφορά
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setArchiveDialogOpen(true)}
                className="gap-1"
              >
                <Archive className="h-4 w-4" />
                Αρχειοθέτηση
              </Button>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Αρχειοθέτηση Αγγελιών</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να αρχειοθετήσετε {selectedCount} αγγελί{selectedCount === 1 ? 'α' : 'ες'};
              Θα μπορείτε να τ{selectedCount === 1 ? 'ην' : 'ις'} επαναφέρετε αργότερα.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Αρχειοθέτηση
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
