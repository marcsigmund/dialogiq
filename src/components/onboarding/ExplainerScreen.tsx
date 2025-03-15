
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageSquare, Volume2, Sparkles, Users, Languages, Briefcase, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const handleInterestSelect = (id: string) => {
    setSelectedInterest(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6 py-2">
        {steps.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <div className="absolute -ml-2 -mt-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
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

      <div className="pt-4 border-t">
        <h3 className="font-medium text-base mb-3">What would you like to focus on?</h3>
        <div className="grid gap-3">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className={cn(
                "p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3",
                selectedInterest === interest.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => handleInterestSelect(interest.id)}
            >
              <div className={cn(
                "p-2 rounded-full",
                selectedInterest === interest.id ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {interest.icon}
              </div>
              <div>
                <h4 className="font-medium text-sm">{interest.title}</h4>
                <p className="text-xs text-muted-foreground">{interest.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          variant="default" 
          onClick={onNext}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
