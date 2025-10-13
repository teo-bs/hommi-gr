import { useEffect, useState } from 'react';

export const useImpersonation = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonationData, setImpersonationData] = useState<any>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const data = sessionStorage.getItem('impersonation');
      if (data) {
        const parsed = JSON.parse(data);
        setIsImpersonating(true);
        setImpersonationData(parsed);

        // Check if expired
        if (new Date(parsed.expires_at) < new Date()) {
          sessionStorage.removeItem('impersonation');
          sessionStorage.removeItem('admin_session');
          setIsImpersonating(false);
          setImpersonationData(null);
        }
      }
    };

    checkImpersonation();
    const interval = setInterval(checkImpersonation, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return { isImpersonating, impersonationData };
};
