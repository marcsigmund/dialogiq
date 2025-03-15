
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  const handleSelectUseCase = (id: string) => {
    setSelectedUseCase(id);
  };
  
  const handleComplete = () => {
    if (selectedUseCase) {
      onComplete(selectedUseCase);
    }
  };

  return (
    <div className="space-y-6">
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
          disabled={!selectedUseCase}
          className={cn(
            "transition-transform duration-200",
            selectedUseCase && "hover:translate-x-1"
          )}
        >
          Start Practicing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
