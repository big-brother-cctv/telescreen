import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language, type Translations } from './translations';
import { Globe } from 'lucide-react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bb_cctv_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    // Detección automática por idioma de navegador
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) {
      return 'en';
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageSelector: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(15, 18, 26, 0.85)',
        border: '1px solid var(--border-party)',
        borderRadius: '6px',
        padding: '2px',
        gap: '2px',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--text-muted)' }}>
        <Globe size={13} color="var(--accent-red)" />
      </div>
      <button
        onClick={() => setLanguage('es')}
        style={{
          padding: '3px 7px',
          fontSize: '0.7rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          borderRadius: '4px',
          border: 'none',
          background: language === 'es' ? 'var(--accent-red)' : 'transparent',
          color: language === 'es' ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Español"
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '3px 7px',
          fontSize: '0.7rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          borderRadius: '4px',
          border: 'none',
          background: language === 'en' ? 'var(--accent-red)' : 'transparent',
          color: language === 'en' ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="English"
      >
        EN
      </button>
    </div>
  );
};
