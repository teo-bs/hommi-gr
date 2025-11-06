import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ReadReceipt } from "./ReadReceipt";
import { ReactionPicker } from "./ReactionPicker";
import { VoicePlayer } from "./VoicePlayer";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface MessageWithReactionsProps {
  message: any;
  isOwn: boolean;
  voiceUrl: string | null;
}

export const MessageWithReactions = ({ message, isOwn, voiceUrl }: MessageWithReactionsProps) => {
  const { profile } = useAuth();
  const { reactions, addReaction, removeReaction, userReactions } = useMessageReactions(message.id);

  const handleReactionClick = (emoji: string) => {
    const userReaction = userReactions.find(r => r.reaction === emoji);
    if (userReaction) {
      removeReaction(userReaction.id);
    } else {
      addReaction(emoji);
    }
  };

  return (
    <div
      className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.display_name?.[0]}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {voiceUrl ? (
              <VoicePlayer voiceUrl={voiceUrl} />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.body}
              </p>
            )}
          </div>

          {/* Reactions */}
          {Object.keys(reactions).length > 0 && (
            <div className="flex gap-1 mt-1">
              {Object.entries(reactions).map(([emoji, reactionList]) => {
                const hasUserReacted = reactionList.some(r => r.user_id === profile?.id);
                return (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-xs ${
                      hasUserReacted ? 'bg-primary/20 border border-primary' : 'bg-muted'
                    }`}
                    onClick={() => handleReactionClick(emoji)}
                  >
                    {emoji} {reactionList.length}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ReactionPicker onReactionSelect={addReaction} />
          {isOwn && (
            <ReadReceipt
              delivered={!!message.delivered_at}
              read={!!message.read_at}
              timestamp={message.created_at}
            />
          )}
        </div>
      </div>
    </div>
  );
};
