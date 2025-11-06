import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MoreVertical, Flag, Ban, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useMessageReports } from "@/hooks/useMessageReports";

interface BlockReportMenuProps {
  userId: string;
  userName: string;
  threadId?: string;
  messageId?: string;
  onBlock?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ή ανεπιθύμητο περιεχόμενο' },
  { value: 'harassment', label: 'Παρενόχληση' },
  { value: 'inappropriate', label: 'Ακατάλληλο περιεχόμενο' },
  { value: 'scam', label: 'Απάτη ή παραπλανητικό' },
  { value: 'other', label: 'Άλλο' }
];

export const BlockReportMenu = ({ 
  userId, 
  userName, 
  threadId, 
  messageId,
  onBlock 
}: BlockReportMenuProps) => {
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [blockReason, setBlockReason] = useState('');
  
  const { blockUser } = useBlockedUsers();
  const { reportMessage, reportThread, isReporting } = useMessageReports();

  const handleBlock = async () => {
    const success = await blockUser(userId, blockReason);
    if (success) {
      setBlockDialogOpen(false);
      setBlockReason('');
      onBlock?.();
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;

    let success = false;
    if (messageId) {
      success = await reportMessage(messageId, reportReason, reportDetails);
    } else if (threadId) {
      success = await reportThread(threadId, reportReason, reportDetails);
    }

    if (success) {
      setReportDialogOpen(false);
      setReportReason('');
      setReportDetails('');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Αναφορά
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setBlockDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            Αποκλεισμός
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αποκλεισμός χρήστη</DialogTitle>
            <DialogDescription>
              Θέλετε σίγουρα να αποκλείσετε τον/την {userName}; Δεν θα μπορείτε να επικοινωνήσετε μεταξύ σας.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Λόγος (προαιρετικό)</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Γιατί αποκλείετε αυτόν τον χρήστη;"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Ακύρωση
            </Button>
            <Button variant="destructive" onClick={handleBlock}>
              <Ban className="h-4 w-4 mr-2" />
              Αποκλεισμός
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αναφορά {messageId ? 'μηνύματος' : 'συνομιλίας'}</DialogTitle>
            <DialogDescription>
              Βοηθήστε μας να κρατήσουμε το Hommi ασφαλές. Η αναφορά σας θα εξεταστεί από την ομάδα μας.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Λόγος αναφοράς</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                {REPORT_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Λεπτομέρειες (προαιρετικό)</Label>
              <Textarea
                id="report-details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Παρέχετε περισσότερες πληροφορίες..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning-foreground">
                Οι ψευδείς αναφορές μπορεί να οδηγήσουν σε αναστολή του λογαριασμού σας.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Ακύρωση
            </Button>
            <Button 
              onClick={handleReport} 
              disabled={!reportReason || isReporting}
            >
              <Flag className="h-4 w-4 mr-2" />
              Αναφορά
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
