import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  className?: string;
  placeholder?: string;
  fallbackText?: string;
}

export const FileUpload = ({ 
  value, 
  onChange, 
  className, 
  placeholder = "Προσθέστε φωτογραφία",
  fallbackText = "U"
}: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    // Clean up preview URL if it was created
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <div
          {...getRootProps()}
          className={cn(
            "relative cursor-pointer transition-all duration-200",
            isDragActive && "scale-105"
          )}
        >
          <input {...getInputProps()} />
          
          <Avatar className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            {preview ? (
              <AvatarImage src={preview} className="object-cover" />
            ) : (
              <AvatarFallback className="text-lg bg-muted/50">
                {fallbackText}
              </AvatarFallback>
            )}
          </Avatar>
          
          {!preview && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-md"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {preview && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {placeholder}
        </p>
        {isDragActive ? (
          <p className="text-xs text-primary">Αφήστε το αρχείο εδώ...</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Σύρετε & αφήστε ή κάντε κλικ για επιλογή
          </p>
        )}
      </div>
    </div>
  );
};