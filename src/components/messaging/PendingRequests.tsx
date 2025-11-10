import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import { useChatRequests } from "@/hooks/useChatRequests";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";

interface PendingRequest {
  id: string;
  listing_id: string;
  seeker_id: string;
  host_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  listing?: {
    title: string;
    city: string;
  };
  seeker?: {
    display_name: string;
    avatar_url?: string;
    profile_completion_pct?: number;
    verifications_json?: Record<string, any>;
  };
}

export const PendingRequests = () => {
  const { getPendingRequests, respondToRequest, loading } = useChatRequests();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    const result = await getPendingRequests();
    if (result.success && result.requests) {
      setRequests(result.requests as PendingRequest[]);
    }
  };

  const handleResponse = async (threadId: string, response: 'accepted' | 'declined') => {
    setResponding(threadId);
    try {
      const result = await respondToRequest(threadId, response);
      if (result.success) {
        // Remove the request from the list or update its status
        setRequests(prev => prev.filter(req => req.id !== threadId));
      }
    } finally {
      setResponding(null);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending requests at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Pending Requests
          <Badge variant="secondary" className="ml-2">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <AvatarWithBadge
                  src={request.seeker?.avatar_url}
                  fallback={request.seeker?.display_name?.charAt(0) || '?'}
                  showBadge={
                    request.seeker?.profile_completion_pct === 100 &&
                    request.seeker?.verifications_json?.phone === 'verified'
                  }
                  className="h-10 w-10"
                />
                <div className="space-y-1">
                  <p className="font-medium">
                    {request.seeker?.display_name || 'Unknown User'}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {request.listing?.title || 'Listing'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(request.created_at), { 
                      addSuffix: true,
                      locale: el 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleResponse(request.id, 'accepted')}
                disabled={responding === request.id}
                className="flex-1 shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResponse(request.id, 'declined')}
                disabled={responding === request.id}
                className="flex-1 shadow-sm hover:shadow-md"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};