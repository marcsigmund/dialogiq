
import React, { useState, useEffect, useRef } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, PlayCircle, PauseCircle, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import AudioWaveform from './AudioWaveform';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, url: string, duration: number) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const { 
    isRecording, 
    isPaused, 
    durationSec, 
    audioBlob, 
    audioUrl, 
    error,
    isPlaying,
    startRecording, 
    stopRecording, 
    resetRecording,
    playRecording,
    pauseRecording
  } = useRecorder();
  
  const [formattedTime, setFormattedTime] = useState("00:00");
  const [currentPermission, setCurrentPermission] = useState<PermissionState | null>(null);
  const isMobile = useIsMobile();
  const [playbackProgress, setPlaybackProgress] = useState(0);
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
  }, []);
  
  useEffect(() => {
    if (durationSec !== undefined) {
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      setFormattedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [durationSec]);
  
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
        setPlaybackProgress(0);
      });
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updatePlaybackProgress);
          audioRef.current.removeEventListener('ended', () => {});
        }
      };
    }
  }, [audioUrl]);
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioUrl) {
      const seekTo = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTo;
    }
  };
  
  const handleSave = () => {
    if (audioBlob && audioUrl) {
      onRecordingComplete(audioBlob, audioUrl, durationSec);
      resetRecording();
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-6 rounded-xl glass-panel">
      <div className="mb-6">
        <AudioWaveform 
          isRecording={isRecording} 
          audioUrl={audioUrl}
        />
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-medium mb-8 animate-fade-in">
          {formattedTime}
        </div>
        
        {audioUrl && !isRecording && (
          <div className="mb-6 px-2">
            <Slider
              value={[playbackProgress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex justify-center space-x-6 sm:space-x-8 mb-8">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="red-record-button animate-scale-in"
              aria-label="Start recording"
              disabled={currentPermission === 'denied'}
            />
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-md bg-white flex items-center justify-center shadow-lg animate-scale-in"
              aria-label="Stop recording"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-red rounded-md" />
            </button>
          )}
          
          {audioUrl && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2"
                onClick={resetRecording}
              >
                <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
              
              {isPlaying ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2"
                  onClick={pauseRecording}
                >
                  <PauseCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2"
                  onClick={playRecording}
                >
                  <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              )}
              
              <Button
                variant="default"
                size="icon"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-app-green border-none"
                onClick={handleSave}
              >
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {currentPermission === 'denied' && (
        <div className="text-destructive text-center mt-4 mb-4">
          Microphone access is blocked. Please allow microphone access in your browser settings.
        </div>
      )}
      
      {error && (
        <div className="text-destructive text-center mt-4">{error}</div>
      )}
    </div>
  );
};

export default AudioRecorder;
