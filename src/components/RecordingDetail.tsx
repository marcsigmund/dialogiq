
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import AudioWaveform from './AudioWaveform';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Pause, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Analysis from './Analysis';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const RecordingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordings, setSelectedRecordingId } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioSectionOpen, setIsAudioSectionOpen] = useState(false);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const recording = recordings.find(r => r.id === id);
  
  useEffect(() => {
    if (id) {
      setSelectedRecordingId(id);
    }
    
    return () => {
      if (audioElement.current) {
        audioElement.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id, setSelectedRecordingId]);
  
  useEffect(() => {
    if (recording?.audioUrl && !audioElement.current) {
      const audio = new Audio(recording.audioUrl);
      
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        progressInterval.current = setInterval(() => {
          setCurrentTime(audio.currentTime);
        }, 100);
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      });
      
      audio.addEventListener('loadedmetadata', () => {
        // Initialize with proper duration
      });
      
      audioElement.current = audio;
      
      return () => {
        audio.pause();
        audio.src = '';
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [recording]);
  
  const handlePlayPause = () => {
    if (!audioElement.current) return;
    
    if (isPlaying) {
      audioElement.current.pause();
    } else {
      audioElement.current.play();
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (!audioElement.current || !recording) return;
    
    const seekTime = value[0];
    audioElement.current.currentTime = seekTime;
    setCurrentTime(seekTime);
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
        <Collapsible 
          open={isAudioSectionOpen} 
          onOpenChange={setIsAudioSectionOpen}
          className="mb-6"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex w-full justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span className="font-medium">Audio Recording</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {formatDuration(recording.duration)}
                </span>
              </div>
              {isAudioSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="glass-panel p-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{formatDate(recording.timestamp)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(recording.timestamp)}</p>
                </div>
              </div>
              
              <AudioWaveform
                isRecording={false}
                audioUrl={recording.audioUrl}
                className="mb-4"
              />
              
              <div className="flex flex-col space-y-4">
                {recording.duration > 0 && (
                  <div className="px-4">
                    <Slider
                      value={[currentTime]}
                      max={recording.duration}
                      step={0.1}
                      onValueChange={handleSeek}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{formatDuration(Math.floor(currentTime))}</span>
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                  </div>
                )}
                
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
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Analysis recordingId={recording.id} />
      </div>
    </div>
  );
};

export default RecordingDetail;
