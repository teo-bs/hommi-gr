import { useEffect, useState } from "react";

/**
 * Animated background filler that appears when content is too short
 * Uses Mediterranean-inspired gradient animation
 */
export const ContentFiller = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkContentHeight = () => {
      const contentHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      setIsVisible(contentHeight < viewportHeight);
    };

    checkContentHeight();
    window.addEventListener('resize', checkContentHeight);
    
    // Also check after a short delay to account for dynamic content
    const timer = setTimeout(checkContentHeight, 100);

    return () => {
      window.removeEventListener('resize', checkContentHeight);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
    </div>
  );
};
