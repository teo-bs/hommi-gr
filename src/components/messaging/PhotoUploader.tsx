import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { useMessageAttachments } from "@/hooks/useMessageAttachments";

interface PhotoUploaderProps {
  onPhotoSent: (url: string) => void;
  disabled?: boolean;
}

export const PhotoUploader = ({ onPhotoSent, disabled }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploading, uploadAttachment } = useMessageAttachments();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    // Create a temporary message first
    const tempMessageId = crypto.randomUUID();
    
    const attachment = await uploadAttachment(selectedFile, tempMessageId);
    if (attachment) {
      onPhotoSent(attachment.url);
      clearPreview();
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (preview) {
    return (
      <div className="p-3 border-t bg-muted/30">
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-h-32 rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Μεταφόρτωση...
              </>
            ) : (
              'Αποστολή φωτογραφίας'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        title="Ανέβασε φωτογραφία"
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
    </>
  );
};
