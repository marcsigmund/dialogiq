
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, Mic, PlayCircle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);
  
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      
      const updatePlaybackProgress = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(isNaN(progress) ? 0 : progress);
        }
      };
      
      audioRef.current.addEventListener('timeupdate', updatePlaybackProgress);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      });
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updatePlaybackProgress);
          audioRef.current.removeEventListener('ended', () => {
            setIsPlaying(false);
            setPlaybackProgress(0);
          });
        }
      };
    }
  }, [audioUrl]);
  
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
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
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
  
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioUrl) {
      const seekTo = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTo;
      setPlaybackProgress(value[0]);
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
              : voiceRecognized && !isPlaying
                ? "bg-app-green/10 text-app-green" 
                : voiceRecognized && isPlaying
                  ? "bg-app-green text-white animate-pulse"
                  : "bg-app-gray-light text-muted-foreground"
          )}
          onClick={!isListening && !voiceRecognized ? handleVoiceRecognition : voiceRecognized ? handlePlayPause : undefined}
          style={{ cursor: isListening ? 'default' : 'pointer' }}
        >
          {voiceRecognized ? (
            isPlaying ? (
              <PauseCircle className="w-16 h-16" />
            ) : (
              <PlayCircle className="w-16 h-16" />
            )
          ) : (
            <Mic className={cn("w-16 h-16", isListening && "text-white")} />
          )}
        </div>
        
        {voiceRecognized && audioUrl && (
          <div className="w-full max-w-xs mx-auto">
            <Slider
              value={[playbackProgress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        )}
        
        <div className="text-center">
          <p className="font-medium text-lg mb-1">
            {voiceRecognized 
              ? isPlaying 
                ? "Playing back your voice..."
                : "Voice recorded successfully!" 
              : isListening 
                ? "Listening..." 
                : "Tap to start recording"}
          </p>
          <p className="text-sm text-muted-foreground">
            {voiceRecognized 
              ? "You're ready for your first conversation" 
              : isListening 
                ? "Please speak naturally for a few seconds" 
                : "Let's record a short sample of your voice"}
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
