
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/contexts/AppContext';
import AudioRecorder from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RecordingView: React.FC = () => {
  const navigate = useNavigate();
  const { addRecording, setSelectedRecordingId } = useApp();
  const [recordingTitle, setRecordingTitle] = useState('New Recording');
  const [isRecordingCompleted, setIsRecordingCompleted] = useState(false);
  const [recordingInfo, setRecordingInfo] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);
  const { toast } = useToast();
  
  const handleRecordingComplete = (blob: Blob, url: string, duration: number) => {
    setRecordingInfo({ blob, url, duration });
    setIsRecordingCompleted(true);
  };
  
  const handleSaveRecording = () => {
    if (!recordingInfo) return;
    
    const newRecording = {
      id: uuidv4(),
      title: recordingTitle || 'New Recording',
      timestamp: Date.now(),
      duration: recordingInfo.duration,
      audioUrl: recordingInfo.url,
      transcript: '',
    };
    
    addRecording(newRecording);
    setSelectedRecordingId(newRecording.id);
    
    toast({
      title: "Recording saved",
      description: "Your recording has been saved successfully.",
    });
    
    navigate(`/recording/${newRecording.id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">New Recording</h1>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isRecordingCompleted ? (
          <div className="w-full max-w-md glass-panel p-6 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Save Recording</h2>
            
            <div className="mb-6">
              <label htmlFor="recording-title" className="block text-sm font-medium mb-2">
                Recording Title
              </label>
              <Input
                id="recording-title"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            
            <Button
              onClick={handleSaveRecording}
              className="w-full"
            >
              Save Recording
            </Button>
          </div>
        ) : (
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        )}
      </div>
    </div>
  );
};

export default RecordingView;
