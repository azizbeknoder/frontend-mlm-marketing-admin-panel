import React, { useState } from "react";
import { Globe, ChevronUp } from "lucide-react";
import {
  useTranslation,
  Language,
  languageNames,
} from "../../i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const availableLanguages = Object.entries(languageNames);

  const handleLanguageChange = (newLanguage: Language) => {
    if (language !== newLanguage) {
      changeLanguage(newLanguage);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full border items-center justify-center py-2 text-sm text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors duration-150"
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{languageNames[language]}</span>
        <ChevronUp
          className={`w-4 h-4 ml-1 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="py-1">
                {availableLanguages.map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code as Language)}
                    className={`w-full text-center mx-auto px-4 mb-3 py-3 font-bold text-sm hover:bg-gray-50 transition-colors duration-100 ${
                      language === code
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="truncate block">{name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
