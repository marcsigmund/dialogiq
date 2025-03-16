
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { IntroScreen } from "./onboarding/IntroScreen";
import { ExplainerScreen } from "./onboarding/ExplainerScreen";
import { VoiceRecognitionScreen } from "./onboarding/VoiceRecognitionScreen";
import { UseCaseScreen } from "./onboarding/UseCaseScreen";
import { OnboardingStep } from "./onboarding/types";
import { v4 as uuidv4 } from "uuid";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setIsOnboarded, setUseCase, addRecording, setSelectedRecordingId } = useApp();
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.INTRO);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (step === OnboardingStep.VOICE_RECOGNITION) {
      // Move to the use case selection screen
      setStep(OnboardingStep.USE_CASE);
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleSkip = () => {
    setStep(OnboardingStep.USE_CASE);
  };

  const handleComplete = (selectedUseCase: string) => {
    setUseCase(selectedUseCase as any);
    setIsOnboarded(true);
    navigate('/');
  };

  const handleRecordingComplete = (blob: Blob, url: string, duration: number) => {
    // Create a new recording entry
    const newRecording = {
      id: uuidv4(),
      title: "My First Conversation",
      timestamp: Date.now(),
      duration: duration,
      audioUrl: url,
      transcript: "",
    };
    
    // Add the recording to the app state
    addRecording(newRecording);
    
    // Set it as the selected recording
    setSelectedRecordingId(newRecording.id);
    
    // Complete onboarding with default use case
    setUseCase("language");
    setIsOnboarded(true);
    
    // Navigate to the recording detail page
    navigate(`/recording/${newRecording.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-padding">
      <div
        className={cn(
          "w-full animate-scale-in",
          isMobile ? "max-w-full" : "max-w-md"
        )}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold mb-1">DialogIQ</h1>
          <p className="text-muted-foreground">
            {step === OnboardingStep.INTRO
              ? "Your AI-powered conversation coach"
              : step === OnboardingStep.EXPLAINER
              ? "How it works"
              : step === OnboardingStep.VOICE_RECOGNITION
              ? "Start your first conversation"
              : "What would you like to practice today?"}
          </p>
        </div>

        <div
          className={cn("glass-panel p-5 mb-5", isMobile && "mx-0 rounded-xl")}
        >
          {step === OnboardingStep.INTRO && <IntroScreen onNext={handleNext} />}

          {step === OnboardingStep.EXPLAINER && (
            <ExplainerScreen onNext={handleNext} onBack={handleBack} />
          )}

          {step === OnboardingStep.VOICE_RECOGNITION && (
            <VoiceRecognitionScreen
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              onRecordingComplete={handleRecordingComplete}
            />
          )}

          {step === OnboardingStep.USE_CASE && (
            <UseCaseScreen onComplete={handleComplete} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
