import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  form_title_add: { zh: '新增作品', en: 'Add Song' },
  form_label_title: { zh: '歌名', en: 'Title' },
  form_label_lang: { zh: '語言', en: 'Language' },
  form_label_lyrics: { zh: '歌詞', en: 'Lyrics' },
  form_btn_cancel: { zh: '取消', en: 'Cancel' },
  form_btn_save: { zh: '儲存', en: 'Save' },
  form_btn_saving: { zh: '儲存中...', en: 'Saving...' },
  msg_save_error: { zh: '儲存失敗', en: 'Save Failed' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'zh' as Language, setLanguage: () => {}, t: (k: string) => k };
  }
  return context;
};