
import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, CheckCircle, MessageSquare, Sparkles, VolumeUp } from 'lucide-react';
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

export const Onboarding: React.FC = () => {
  const { setIsOnboarded, setUseCase } = useApp();
  const [step, setStep] = useState(0); // Changed to start at 0 for intro screen
  const [isListening, setIsListening] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [voiceRecognized, setVoiceRecognized] = useState(false);
  
  // Voice recognition simulation for demo purposes
  const recognizeVoiceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleVoiceRecognition = () => {
    setIsListening(true);
    
    // Simulate voice recognition with a timeout
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
      setStep(1);
    } else if (step === 1 && voiceRecognized) {
      setStep(2);
    } else if (step === 2 && selectedUseCase) {
      // Complete onboarding
      setUseCase(selectedUseCase as any);
      setIsOnboarded(true);
    }
  };
  
  const handleSkip = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setVoiceRecognized(true);
      setStep(2);
    }
  };

  const renderIntroScreen = () => (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Welcome to DialogIQ</h2>
        <p className="text-muted-foreground mb-6">
          Your personal conversation analysis and training assistant
        </p>
      </div>

      <div className="space-y-6 w-full">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <VolumeUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Record & Review</h3>
            <p className="text-sm text-muted-foreground">Record your voice for instant analysis and feedback</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Personalized Insights</h3>
            <p className="text-sm text-muted-foreground">Get detailed analysis of your speech patterns and areas for improvement</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Multiple Use Cases</h3>
            <p className="text-sm text-muted-foreground">Practice language skills, sales pitches, interviews, and more</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">DialogIQ</h1>
          <p className="text-muted-foreground">
            {step === 0 
              ? "Your conversation coach"
              : step === 1 
                ? "Let's recognize your voice first" 
                : "What would you like to practice today?"}
          </p>
        </div>
        
        <div className="glass-panel p-6 mb-6">
          {step === 0 ? (
            renderIntroScreen()
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
            <div className="space-y-4">
              {useCases.map((useCase) => (
                <div 
                  key={useCase.id}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-200 cursor-pointer",
                    selectedUseCase === useCase.id 
                      ? "bg-primary/10 border-2 border-primary" 
                      : "bg-app-gray-light hover:bg-app-gray-medium"
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
          {(step === 0 || step === 1) && (
            <Button 
              variant="link" 
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          )}
          {step === 2 && (
            <Button 
              variant="ghost" 
              onClick={() => setStep(1)}
              className="text-muted-foreground"
            >
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
