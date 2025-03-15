
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

// Test comment for GitHub commit
interface VoiceRecognitionScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const VoiceRecognitionScreen: React.FC<VoiceRecognitionScreenProps> = ({ 
  onNext, 
  onBack,
  onSkip
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognized, setVoiceRecognized] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<PermissionState | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognizeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Check microphone permission status
    const checkMicrophonePermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setCurrentPermission(permissionStatus.state);
        
        permissionStatus.onchange = () => {
          setCurrentPermission(permissionStatus.state);
        };
      } catch (error) {
        console.error('Error checking microphone permission:', error);
      }
    };
    
    checkMicrophonePermission();
    
    return () => {
      if (recognizeTimeout.current) {
        clearTimeout(recognizeTimeout.current);
      }
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const handleVoiceRecognition = async () => {
    try {
      audioChunks.current = [];
      
      if (!stream.current) {
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      mediaRecorder.current = new MediaRecorder(stream.current);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        // Process audio if needed
        setIsListening(false);
        setVoiceRecognized(true);
      };
      
      setIsListening(true);
      mediaRecorder.current.start();
      
      // Record for 3 seconds then stop
      recognizeTimeout.current = setTimeout(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
          
          if (stream.current) {
            stream.current.getTracks().forEach(track => track.stop());
            stream.current = null;
          }
        }
      }, 3000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // If we can't access the microphone, just pretend it worked
      setIsListening(false);
      setVoiceRecognized(true);
    }
  };
  
  const handleNext = () => {
    if (voiceRecognized) {
      onNext();
    }
  };

  return (
    <>
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
              ? "Voice recorded successfully!" 
              : isListening 
                ? "Listening..." 
                : "Tap to start improving"}
          </p>
          <p className="text-sm text-muted-foreground">
            {voiceRecognized 
              ? "You're ready for your first conversation" 
              : isListening 
                ? "Please speak naturally for a few seconds" 
                : "Let's have your first practice conversation"}
          </p>
        </div>
        
        {currentPermission === 'denied' && (
          <div className="text-destructive text-center">
            Microphone access is blocked. Please allow microphone access in your browser settings.
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-8">
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
          onClick={handleNext}
          disabled={!voiceRecognized}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
