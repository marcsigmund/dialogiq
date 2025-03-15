
import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Language {
  value: string;
  label: string;
  flag: string;
}

// Available languages with their flags
export const availableLanguages: Language[] = [
  { value: 'english', label: 'English', flag: '🇬🇧' },
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'french', label: 'French', flag: '🇫🇷' },
  { value: 'german', label: 'German', flag: '🇩🇪' },
  { value: 'italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'chinese', label: 'Chinese', flag: '🇨🇳' },
  { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { value: 'korean', label: 'Korean', flag: '🇰🇷' },
  { value: 'russian', label: 'Russian', flag: '🇷🇺' },
  { value: 'arabic', label: 'Arabic', flag: '🇸🇦' },
  { value: 'hindi', label: 'Hindi', flag: '🇮🇳' }
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onSelectLanguage: (value: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onSelectLanguage
}) => {
  const [showAll, setShowAll] = useState(false);
  const initialLanguages = availableLanguages.slice(0, 4);
  const displayedLanguages = showAll ? availableLanguages : initialLanguages;
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {displayedLanguages.map((language) => {
          const isSelected = selectedLanguages.includes(language.value);
          
          return (
            <div
              key={language.value}
              className={cn(
                "flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => onSelectLanguage(language.value)}
            >
              <div className="mr-3 text-2xl">{language.flag}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{language.label}</p>
              </div>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button
        type="button"
        className="w-full py-2 px-3 border border-border rounded-lg flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? 'Show less' : 'Show more languages'}
        {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    </div>
  );
};
