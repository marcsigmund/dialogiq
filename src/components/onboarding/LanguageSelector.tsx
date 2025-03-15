
import React from 'react';
import { Check } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableLanguages.map((language) => {
          const isSelected = selectedLanguages.includes(language.value);
          
          return (
            <div
              key={language.value}
              className={cn(
                "flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer animate-in fade-in",
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
    </div>
  );
};
