import { useLanguageContext } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export const useTranslation = () => {
  const { language, toggleLanguage, setLanguage } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language, toggleLanguage, setLanguage };
};
