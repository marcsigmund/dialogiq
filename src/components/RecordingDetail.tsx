
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import AudioWaveform from './AudioWaveform';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Pause, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Analysis from './Analysis';

export const RecordingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordings, setSelectedRecordingId } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const recording = recordings.find(r => r.id === id);
  
  useEffect(() => {
    if (id) {
      setSelectedRecordingId(id);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [id, setSelectedRecordingId]);
  
  useEffect(() => {
    if (recording?.audioUrl && !audioElement) {
      const audio = new Audio(recording.audioUrl);
      
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [recording, audioElement]);
  
  const handlePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (!recording) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Recording not found</p>
          <Button onClick={() => navigate('/')}>Go back</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">{recording.title}</h1>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>
      
      <div className="p-4 flex-1">
        <div className="glass-panel p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{formatDate(recording.timestamp)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(recording.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">{formatDuration(recording.duration)}</p>
            </div>
          </div>
          
          <AudioWaveform
            isRecording={false}
            audioUrl={recording.audioUrl}
            className="mb-4"
          />
          
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
          </div>
        </div>
        
        <Analysis recordingId={recording.id} />
      </div>
    </div>
  );
};

export default RecordingDetail;
