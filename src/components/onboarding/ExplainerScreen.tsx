
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageSquare, Volume2, Sparkles, Users, Languages, Briefcase, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { LanguageSelector, availableLanguages } from './LanguageSelector';

const steps = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Find a conversation partner",
    description: "Choose a partner you're comfortable with to practice and improve your language skills"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Start a conversation",
    description: "Choose a topic and start practicing with our AI-powered conversation partner"
  },
  {
    icon: <Volume2 className="w-6 h-6" />,
    title: "Speak naturally",
    description: "Talk as you would in a real conversation and get real-time feedback"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Improve with feedback",
    description: "Review your conversation with detailed analysis and suggestions"
  }
];

const interests = [
  {
    id: 'language',
    icon: <Languages className="w-5 h-5" />,
    title: "Language Mastery",
    description: "Perfect grammar, pronunciation, and expand your vocabulary"
  },
  {
    id: 'sales',
    icon: <Briefcase className="w-5 h-5" />,
    title: "Sales Skills",
    description: "Convince anyone to buy anything (except this app, it's free!)"
  },
  {
    id: 'dating',
    icon: <Heart className="w-5 h-5" />,
    title: "Dating Success",
    description: "Because 'I speak five languages' sounds better than 'I live with my parents'"
  }
];

interface ExplainerScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const ExplainerScreen: React.FC<ExplainerScreenProps> = ({ onNext, onBack }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const form = useForm();

  useEffect(() => {
    if (currentPage === 0) {
      const timer = setTimeout(() => {
        setActiveStepIndex(0);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeStepIndex >= 0 && activeStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStepIndex(activeStepIndex + 1);
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [activeStepIndex]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const toggleLanguage = (value: string) => {
    setSelectedLanguages(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const hasSelections = selectedInterests.length > 0 || selectedLanguages.length > 0;

  const nextPage = () => {
    if (currentPage === 1 && !hasSelections) {
      return;
    }
    
    if (currentPage < 1) {
      setCurrentPage(currentPage + 1);
      setActiveStepIndex(-1);
    } else {
      onNext();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setActiveStepIndex(-1);
      setTimeout(() => setActiveStepIndex(0), 300);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {currentPage === 0 && (
        <div className="flex flex-col space-y-6 py-2">
          {steps.map((item, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-start space-x-4 transition-all duration-500 transform", 
                activeStepIndex >= index 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-8"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                <div className={cn(
                  "absolute top-0 left-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium transform transition-all duration-500 -translate-x-1/4 -translate-y-1/4",
                  activeStepIndex >= index ? "scale-100" : "scale-0"
                )}>
                  {index + 1}
                </div>
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentPage === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right">
          <div className="pt-2">
            <h3 className="font-medium text-base mb-3">What would you like to focus on?</h3>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="grid gap-3">
              {interests.map((interest, index) => (
                <div
                  key={interest.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 animate-in fade-in",
                    selectedInterests.includes(interest.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedInterests.includes(interest.id)}
                      onCheckedChange={() => toggleInterest(interest.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <div className={cn(
                      "p-2 rounded-full transition-colors duration-200",
                      selectedInterests.includes(interest.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {interest.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{interest.title}</h4>
                    <p className="text-xs text-muted-foreground">{interest.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t animate-in fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="font-medium text-base mb-3">Which languages do you want to improve?</h3>
            <p className="text-sm text-muted-foreground mb-4">Swipe right on the languages you want to learn</p>
            
            <LanguageSelector 
              selectedLanguages={selectedLanguages}
              onSelectLanguage={toggleLanguage}
            />
            
            {selectedLanguages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-sm text-muted-foreground mr-2">Selected:</p>
                {selectedLanguages.map(lang => {
                  const language = availableLanguages.find(l => l.value === lang);
                  return language ? (
                    <div 
                      key={lang} 
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1"
                    >
                      <span>{language.flag}</span>
                      <span>{language.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 mt-auto">
        <Button 
          variant="ghost" 
          onClick={prevPage}
          className="text-muted-foreground transition-all duration-200 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          variant="default" 
          onClick={nextPage}
          disabled={currentPage === 1 && !hasSelections}
          className={cn(
            "transition-transform duration-200",
            !(currentPage === 1 && !hasSelections) && "hover:translate-x-1"
          )}
        >
          {currentPage === 1 ? "Continue" : "Next"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
