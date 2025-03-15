
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert } from "@/components/ui/alert";

const useCases = [
  {
    id: 'language',
    title: 'Language Improvement',
    description: 'Practice and improve your grammar, pronunciation, and fluency',
    example: 'German grammar training'
  },
  {
    id: 'sales',
    title: 'Sales Training',
    description: 'Enhance your persuasion skills and learn to handle objections',
    example: 'How to be more convincing'
  },
  {
    id: 'interview',
    title: 'Interview Preparation',
    description: 'Practice structured answers for tough interview questions',
    example: 'Brain teaser questions'
  }
];

interface UseCaseScreenProps {
  onComplete: (useCase: string) => void;
  onBack: () => void;
}

export const UseCaseScreen: React.FC<UseCaseScreenProps> = ({ onComplete, onBack }) => {
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  const handleSelectUseCase = (id: string) => {
    setSelectedUseCase(id);
  };
  
  const handleComplete = () => {
    if (selectedUseCase) {
      onComplete(selectedUseCase);
    } else {
      // Show the alert animation
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="relative pt-12">
      {/* Selection Reminder Alert - Fixed positioning that doesn't overlap */}
      {showAlert && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <Alert variant="destructive" className="bg-primary/10 border-primary/20 text-primary flex items-center gap-2 max-w-md w-full shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Please select a use case before continuing</span>
          </Alert>
        </div>
      )}
      
      {!selectedUseCase && showAlert && (
        <div className="absolute inset-x-0 -top-8 z-10 flex justify-center">
          <div className="flex items-center gap-2 text-primary animate-bounce py-2">
            <ChevronDown className="h-5 w-5" />
            <span className="text-sm font-medium">Select an option</span>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {useCases.map((useCase) => (
          <div 
            key={useCase.id}
            className={cn(
              "p-4 rounded-xl transition-all duration-200 cursor-pointer active:scale-98 touch-manipulation",
              selectedUseCase === useCase.id 
                ? "bg-primary/10 border border-primary" 
                : "bg-app-gray-light hover:bg-app-gray-medium active:bg-app-gray-medium"
            )}
            onClick={() => handleSelectUseCase(useCase.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-lg">{useCase.title}</h3>
              {selectedUseCase === useCase.id && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{useCase.description}</p>
            <div className="text-xs inline-block bg-background px-2 py-1 rounded">
              Example: {useCase.example}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6">
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
          onClick={handleComplete}
          className="transition-transform duration-200 hover:translate-x-1"
        >
          Start Practicing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
