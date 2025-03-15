
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { IntroScreen } from './onboarding/IntroScreen';
import { ExplainerScreen } from './onboarding/ExplainerScreen';
import { VoiceRecognitionScreen } from './onboarding/VoiceRecognitionScreen';
import { UseCaseScreen } from './onboarding/UseCaseScreen';
import { OnboardingStep } from './onboarding/types';

export const Onboarding: React.FC = () => {
  const { setIsOnboarded, setUseCase } = useApp();
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.INTRO);
  const isMobile = useIsMobile();
  
  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setStep((prevStep) => Math.max(0, prevStep - 1));
  };
  
  const handleSkip = () => {
    setStep((prevStep) => prevStep + 1);
  };
  
  const handleComplete = (selectedUseCase: string) => {
    setUseCase(selectedUseCase as any);
    setIsOnboarded(true);
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
            {step === OnboardingStep.INTRO 
              ? "Your AI-powered conversation coach" 
              : step === OnboardingStep.EXPLAINER 
                ? "How it works"
                : step === OnboardingStep.VOICE_RECOGNITION 
                  ? "Let's recognize your voice first" 
                  : "What would you like to practice today?"}
          </p>
        </div>
        
        <div className={cn(
          "glass-panel p-5 mb-5",
          isMobile && "mx-0 rounded-xl"
        )}>
          {step === OnboardingStep.INTRO && (
            <IntroScreen onNext={handleNext} />
          )}
          
          {step === OnboardingStep.EXPLAINER && (
            <ExplainerScreen 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
          
          {step === OnboardingStep.VOICE_RECOGNITION && (
            <VoiceRecognitionScreen 
              onNext={handleNext} 
              onBack={handleBack}
              onSkip={handleSkip}
            />
          )}
          
          {step === OnboardingStep.USE_CASE && (
            <UseCaseScreen 
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
