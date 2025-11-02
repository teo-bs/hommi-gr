import { ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onApply?: () => void;
  onClear?: () => void;
}

export const FilterBottomSheet = ({
  open,
  onOpenChange,
  title,
  children,
  onApply,
  onClear
}: FilterBottomSheetProps) => {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
        <Drawer.Content 
          className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-[70] 
                     max-h-[90vh] flex flex-col outline-none"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {children}
          </div>

          {/* Footer */}
          {(onApply || onClear) && (
            <div className="flex gap-3 p-4 border-t border-border bg-background sticky bottom-0">
              {onClear && (
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="flex-1 min-h-[48px] touch-manipulation active:scale-95"
                >
                  Καθαρισμός
                </Button>
              )}
              {onApply && (
                <Button
                  onClick={onApply}
                  className="flex-1 min-h-[48px] touch-manipulation active:scale-95"
                >
                  Εφαρμογή
                </Button>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
