
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isRecording: boolean;
  audioUrl?: string | null;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isRecording, 
  audioUrl,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  useEffect(() => {
    // Clean up previous audio element if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    if (audioUrl) {
      // Create new audio element for playback visualization
      audioRef.current = new Audio(audioUrl);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        audioContext.close();
      };
    }
  }, [audioUrl]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Drawing functions
    const drawRecordingWaveform = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Generate random-ish waveform data while recording
      const barCount = 64;
      const barWidth = (canvas.width / window.devicePixelRatio) / barCount;
      const centerY = (canvas.height / window.devicePixelRatio) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < barCount; i++) {
        // Create a somewhat randomized waveform effect
        const randomFactor = Math.sin(Date.now() / 200 + i / 2) * 0.3 + 0.7;
        const height = Math.random() * 30 * randomFactor + 5;
        
        ctx.fillRect(
          i * barWidth, 
          centerY - height / 2, 
          barWidth - 1, 
          height
        );
      }
      
      animationRef.current = requestAnimationFrame(drawRecordingWaveform);
    };
    
    const drawPlaybackWaveform = () => {
      if (!ctx || !analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = dataArrayRef.current.length;
      const barWidth = (canvas.width / window.devicePixelRatio) / barCount;
      const centerY = (canvas.height / window.devicePixelRatio) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * ((canvas.height / window.devicePixelRatio) * 0.8);
        
        ctx.fillRect(
          i * barWidth, 
          centerY - barHeight / 2, 
          barWidth - 1, 
          barHeight
        );
      }
      
      animationRef.current = requestAnimationFrame(drawPlaybackWaveform);
    };
    
    // Static waveform when neither recording nor playing
    const drawStaticWaveform = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = 64;
      const barWidth = (canvas.width / window.devicePixelRatio) / barCount;
      const centerY = (canvas.height / window.devicePixelRatio) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < barCount; i++) {
        // Create a static waveform pattern
        const height = Math.sin(i * 0.2) * 20 + 25;
        
        ctx.fillRect(
          i * barWidth, 
          centerY - height / 2, 
          barWidth - 1, 
          height
        );
      }
    };
    
    // Choose which drawing function to use
    if (isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      drawRecordingWaveform();
    } else if (audioUrl && audioRef.current) {
      audioRef.current.addEventListener('play', () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        drawPlaybackWaveform();
      });
      
      audioRef.current.addEventListener('pause', () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        drawStaticWaveform();
      });
      
      audioRef.current.addEventListener('ended', () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        drawStaticWaveform();
      });
      
      drawStaticWaveform();
    } else {
      drawStaticWaveform();
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioUrl]);
  
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className={cn("waveform-container", className)}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      {audioUrl && (
        <div className="absolute bottom-4 right-4 flex space-x-4">
          <button 
            onClick={playAudio}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 7.26795C16.3333 8.03775 16.3333 9.96225 15 10.7321L3 17.6603C1.66667 18.4301 0 17.4678 0 15.9282L0 2.0718C0 0.532196 1.66667 -0.430054 3 0.339746L15 7.26795Z" fill="black"/>
            </svg>
          </button>
          <button 
            onClick={pauseAudio}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="5" height="18" rx="2" fill="black"/>
              <rect x="11" width="5" height="18" rx="2" fill="black"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioWaveform;
