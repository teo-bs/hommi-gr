import { Button } from "@/components/ui/button";
import { Mic, Square, X, Send } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useVoiceMessage } from "@/hooks/useVoiceMessage";

interface VoiceRecorderProps {
  threadId: string;
  onVoiceSent: (voiceUrl: string) => void;
}

export const VoiceRecorder = ({ threadId, onVoiceSent }: VoiceRecorderProps) => {
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    cancelRecording,
    resetRecording 
  } = useVoiceRecorder();
  
  const { uploadVoiceMessage, isUploading } = useVoiceMessage();

  const handleSendVoice = async () => {
    if (!audioBlob) return;

    const url = await uploadVoiceMessage(audioBlob, threadId);
    if (url) {
      onVoiceSent(url);
      resetRecording();
    }
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 flex-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={cancelRecording}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleSendVoice}
          disabled={isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg animate-pulse">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-mono">{recordingTime}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={cancelRecording}>
          <X className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={stopRecording}>
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={startRecording}
      className="h-9 w-9 p-0"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};
