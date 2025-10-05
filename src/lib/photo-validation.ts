/**
 * Validate if a photo URL loads successfully
 */
export async function validatePhotoUrl(url: string, timeoutMs: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, timeoutMs);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Validate multiple photo URLs in parallel
 */
export async function validatePhotoUrls(urls: string[]): Promise<{ url: string; isValid: boolean }[]> {
  const validationPromises = urls.map(async (url) => ({
    url,
    isValid: await validatePhotoUrl(url)
  }));
  
  return Promise.all(validationPromises);
}
