import { useTranslation as useI18NextTranslation } from "react-i18next";

export type Language = "en" | "zh" | "uz";

export const languageNames: Record<Language, string> = {
  en: "English",
  zh: "中文",
  uz: "O‘zbekcha",
};

export const useTranslation = () => {
  const { t, i18n } = useI18NextTranslation();

  // Masalan: "en-US" => "en"
  const language = i18n.language.split("-")[0] as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return { t, language, changeLanguage };
};
