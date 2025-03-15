
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageSquare, Volume2, Sparkles } from 'lucide-react';

const steps = [
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

interface ExplainerScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const ExplainerScreen: React.FC<ExplainerScreenProps> = ({ onNext, onBack }) => {
  return (
    <>
      <div className="flex flex-col space-y-6 py-2">
        <h2 className="text-xl font-medium text-center mb-2">How it works</h2>
        
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
    </>
  );
};
