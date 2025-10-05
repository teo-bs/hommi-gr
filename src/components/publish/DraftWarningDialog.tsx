import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DraftWarningDialogProps {
  open: boolean;
  onGoToDraft: () => void;
  onCreateNew: () => void;
}

export function DraftWarningDialog({ open, onGoToDraft, onCreateNew }: DraftWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Έχετε ήδη μια πρόχειρη αγγελία</AlertDialogTitle>
          <AlertDialogDescription>
            Βρήκαμε μια πρόχειρη αγγελία που δεν έχει δημοσιευτεί. Θέλετε να συνεχίσετε με αυτήν ή να δημιουργήσετε μια νέα;
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onGoToDraft}>
            Συνέχεια με Πρόχειρο
          </AlertDialogCancel>
          <AlertDialogAction onClick={onCreateNew}>
            Δημιουργία Νέας
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
