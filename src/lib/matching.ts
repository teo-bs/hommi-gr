// Calculate personality match score between tenant and listing
export const calculateMatchScore = (
  tenantProfileExtras: Record<string, any>,
  listerProfileExtras: Record<string, any>,
  audiencePreferences: Record<string, any>
): { isGoodFit: boolean; matchPercentage: number } => {
  
  // If no tenant profile, can't match
  if (!tenantProfileExtras || Object.keys(tenantProfileExtras).length === 0) {
    return { isGoodFit: false, matchPercentage: 0 };
  }
  
  let matches = 0;
  let total = 0;
  
  // Compare lifestyle preferences
  const lifestyleCategories = ['personality', 'lifestyle', 'music', 'sports', 'movies'];
  
  lifestyleCategories.forEach(category => {
    const tenantValues = tenantProfileExtras[category] || [];
    const listerValues = listerProfileExtras?.[category] || [];
    const preferredValues = audiencePreferences?.[category] || [];
    
    // If lister has audience preferences, check against those
    const compareAgainst = preferredValues.length > 0 ? preferredValues : listerValues;
    
    if (tenantValues.length > 0 && compareAgainst.length > 0) {
      const intersection = tenantValues.filter((v: string) => compareAgainst.includes(v));
      matches += intersection.length;
      total += Math.max(tenantValues.length, compareAgainst.length);
    }
  });
  
  const matchPercentage = total > 0 ? Math.round((matches / total) * 100) : 0;
  const isGoodFit = matchPercentage >= 60; // 60% threshold
  
  return { isGoodFit, matchPercentage };
};
