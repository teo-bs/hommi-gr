import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSavedRooms } from '@/hooks/useSavedRooms';
import { useSaveRoomFlow } from '@/hooks/useSaveRoomFlow';
import { AuthFlowManager } from '@/components/auth/AuthFlowManager';

interface SaveRoomButtonProps {
  roomId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SaveRoomButton = ({ 
  roomId, 
  className, 
  variant = 'ghost',
  size = 'md',
  showText = false 
}: SaveRoomButtonProps) => {
  const { isRoomSaved, loading } = useSavedRooms();
  const saveFlow = useSaveRoomFlow();
  const isSaved = isRoomSaved(roomId);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await saveFlow.initiateSaveFlow(roomId);
  };

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <>
      <Button
        onClick={handleToggleSave}
        disabled={loading}
        variant={variant}
        size={showText ? undefined : 'icon'}
        className={cn(
          showText ? 'gap-2' : buttonSizes[size],
          'transition-colors duration-200',
          variant === 'ghost' && 'hover:shadow-sm',
          isSaved && variant === 'ghost' && 'text-red-500 hover:text-red-600',
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            isSaved ? 'fill-current text-red-500' : 'text-muted-foreground'
          )}
        />
        {showText && (
          <span className="text-sm font-medium">
            {isSaved ? 'Αποθηκευμένο' : 'Αποθήκευση'}
          </span>
        )}
      </Button>
      
      {/* Auth modal for unauthenticated users */}
      <AuthFlowManager
        isAuthOpen={saveFlow.isAuthOpen}
        onAuthClose={saveFlow.closeAuth}
        onAuthSuccess={saveFlow.handleAuthSuccess}
      />
    </>
  );
};