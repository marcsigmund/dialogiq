import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, CheckCircle, MessageSquare, Sparkles, Volume2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

export const Onboarding: React.FC = () => {
  const { setIsOnboarded, setUseCase } = useApp();
  const [step, setStep] = useState(0); // Start with intro screen (step 0)
  const [isListening, setIsListening] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [voiceRecognized, setVoiceRecognized] = useState(false);
  const isMobile = useIsMobile();
  
  const recognizeVoiceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleVoiceRecognition = () => {
    setIsListening(true);
    
    recognizeVoiceTimeout.current = setTimeout(() => {
      setIsListening(false);
      setVoiceRecognized(true);
    }, 3000);
  };
  
  const handleSelectUseCase = (id: string) => {
    setSelectedUseCase(id);
  };
  
  const handleNext = () => {
    if (step === 0) {
      setStep(1); // Move from intro to voice recognition
    } else if (step === 1 && voiceRecognized) {
      setStep(2); // Move from voice recognition to use case selection
    } else if (step === 2 && selectedUseCase) {
      setUseCase(selectedUseCase as any);
      setIsOnboarded(true);
    }
  };
  
  const handleSkip = () => {
    if (step === 0) {
      setStep(1); // Skip intro, go to voice recognition
    } else if (step === 1) {
      setVoiceRecognized(true);
      setStep(2); // Skip voice recognition, go to use case selection
    }
  };
  
  const handleBack = () => {
    if (step === 1) {
      setStep(0); // Go back to intro from voice recognition
      if (isListening && recognizeVoiceTimeout.current) {
        clearTimeout(recognizeVoiceTimeout.current);
        setIsListening(false);
      }
    } else if (step === 2) {
      setStep(1); // Go back to voice recognition from use case selection
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-padding">
      <div className={cn(
        "w-full animate-scale-in",
        isMobile ? "max-w-full" : "max-w-md"
      )}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold mb-1">DialogIQ</h1>
          <p className="text-muted-foreground">
            {step === 0 
              ? "Your AI-powered conversation coach" 
              : step === 1 
                ? "Let's recognize your voice first" 
                : "What would you like to practice today?"}
          </p>
        </div>
        
        <div className={cn(
          "glass-panel p-5 mb-5",
          isMobile && "mx-0 rounded-xl"
        )}>
          {step === 0 ? (
            <div className="flex flex-col items-center space-y-5">
              <div className="flex space-x-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="w-16 h-16 rounded-full bg-app-green/10 flex items-center justify-center text-app-green">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="w-16 h-16 rounded-full bg-app-red/10 flex items-center justify-center text-app-red">
                  <Volume2 className="w-8 h-8" />
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-medium mb-3">Master Your Communication</h2>
                <p className="text-gray-600 mb-4">
                  DialogIQ helps you practice conversations, receive real-time feedback, 
                  and improve your communication skills through AI-powered analysis.
                </p>
                <ul className="text-left space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
                    <span>Practice speaking in a safe environment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
                    <span>Get personalized feedback on your delivery</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
                    <span>Track your improvement over time</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="flex flex-col items-center space-y-6">
              <div 
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                  isListening 
                    ? "bg-app-red text-white animate-pulse-record" 
                    : voiceRecognized 
                      ? "bg-app-green/10 text-app-green" 
                      : "bg-app-gray-light text-muted-foreground"
                )}
                onClick={!isListening && !voiceRecognized ? handleVoiceRecognition : undefined}
              >
                {voiceRecognized ? (
                  <CheckCircle className="w-16 h-16" />
                ) : (
                  <Mic className={cn("w-16 h-16", isListening && "text-white")} />
                )}
              </div>
              
              <div className="text-center">
                <p className="font-medium text-lg mb-1">
                  {voiceRecognized 
                    ? "Voice recognized!" 
                    : isListening 
                      ? "Listening..." 
                      : "Tap to recognize your voice"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {voiceRecognized 
                    ? "You can now proceed to the next step" 
                    : isListening 
                      ? "Please speak naturally for a few seconds" 
                      : "This helps us optimize the analysis for you"}
                </p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {step === 0 ? (
            <div className="w-20"></div>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button 
            variant="default" 
            onClick={handleNext}
            disabled={(step === 1 && !voiceRecognized) || (step === 2 && !selectedUseCase)}
            className="ml-auto"
          >
            {step === 2 ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
