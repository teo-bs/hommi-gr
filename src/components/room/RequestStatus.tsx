import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";

interface RequestStatusProps {
  status: 'none' | 'pending' | 'accepted' | 'declined';
  onOpenConversation?: () => void;
  onRequestAgain?: () => void;
}

export const RequestStatus = ({ 
  status, 
  onOpenConversation,
  onRequestAgain 
}: RequestStatusProps) => {
  if (status === 'none') {
    return null;
  }

  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex items-center space-x-3">
        {status === 'pending' && (
          <>
            <Clock className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <h4 className="font-medium">Request Sent</h4>
              <p className="text-sm text-muted-foreground">
                Waiting for lister response
              </p>
            </div>
          </>
        )}
        
        {status === 'accepted' && (
          <>
            <CheckCircle className="h-5 w-5 text-success" />
            <div className="flex-1">
              <h4 className="font-medium">Request Accepted!</h4>
              <p className="text-sm text-muted-foreground">
                You can now chat with the lister
              </p>
            </div>
            <Button 
              onClick={onOpenConversation}
              size="sm"
              variant="default"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </>
        )}
        
        {status === 'declined' && (
          <>
            <XCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h4 className="font-medium">Request Declined</h4>
              <p className="text-sm text-muted-foreground">
                You can send another request
              </p>
            </div>
            <Button 
              onClick={onRequestAgain}
              size="sm"
              variant="outline"
            >
              Request Again
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};