
import { useState, useEffect, useRef } from 'react';

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  durationSec: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export const useRecorder = () => {
  const [recorderState, setRecorderState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    durationSec: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  });
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);
  const stream = useRef<MediaStream | null>(null);
  
  const startRecording = async () => {
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
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecorderState((prev) => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));
      };
      
      startTime.current = Date.now();
      mediaRecorder.current.start();
      
      timerInterval.current = setInterval(() => {
        const durationSec = Math.floor((Date.now() - startTime.current) / 1000);
        setRecorderState((prev) => ({ ...prev, durationSec }));
      }, 1000);
      
      setRecorderState({
        isRecording: true,
        isPaused: false,
        durationSec: 0,
        audioBlob: null,
        audioUrl: null,
        error: null,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecorderState((prev) => ({
        ...prev,
        error: 'Could not access microphone. Please allow microphone permissions.',
      }));
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current && recorderState.isRecording) {
      mediaRecorder.current.stop();
      
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
        stream.current = null;
      }
    }
  };
  
  const resetRecording = () => {
    if (recorderState.audioUrl) {
      URL.revokeObjectURL(recorderState.audioUrl);
    }
    
    setRecorderState({
      isRecording: false,
      isPaused: false,
      durationSec: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
  };
  
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && recorderState.isRecording) {
        mediaRecorder.current.stop();
      }
      
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
      
      if (recorderState.audioUrl) {
        URL.revokeObjectURL(recorderState.audioUrl);
      }
    };
  }, [recorderState.audioUrl, recorderState.isRecording]);
  
  return {
    ...recorderState,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
