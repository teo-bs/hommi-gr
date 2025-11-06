interface TypingIndicatorProps {
  userName: string;
}

export const TypingIndicator = ({ userName }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">{userName} πληκτρολογεί</span>
        <div className="flex gap-1 ml-1">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot animation-delay-0"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot animation-delay-150"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot animation-delay-300"></div>
        </div>
      </div>
    </div>
  );
};
