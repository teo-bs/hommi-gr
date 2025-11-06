import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Ban, Unlock } from "lucide-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const BlockedUsersSection = () => {
  const { blockedUsers, isLoading, unblockUser } = useBlockedUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Αποκλεισμένοι Χρήστες
        </CardTitle>
        <CardDescription>
          Διαχειριστείτε τους χρήστες που έχετε αποκλείσει
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Φόρτωση...
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <Ban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Δεν έχετε αποκλείσει κανέναν χρήστη
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={blockedUser.blocked_profile?.avatar_url} />
                    <AvatarFallback>
                      {blockedUser.blocked_profile?.display_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {blockedUser.blocked_profile?.display_name}
                    </p>
                    {blockedUser.reason && (
                      <p className="text-sm text-muted-foreground">
                        {blockedUser.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Αποκλείστηκε στις{' '}
                      {new Date(blockedUser.created_at).toLocaleDateString('el-GR')}
                    </p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Unlock className="h-4 w-4 mr-2" />
                      Άρση αποκλεισμού
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Άρση αποκλεισμού χρήστη</AlertDialogTitle>
                      <AlertDialogDescription>
                        Θέλετε σίγουρα να αφαιρέσετε τον αποκλεισμό του/της{' '}
                        {blockedUser.blocked_profile?.display_name}; Θα μπορείτε να
                        επικοινωνήσετε ξανά.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => unblockUser(blockedUser.blocked_user_id)}
                      >
                        Άρση αποκλεισμού
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
