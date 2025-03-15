
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RecordingList: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, deleteRecording, setSelectedRecordingId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleOpenRecording = (id: string) => {
    setSelectedRecordingId(id);
    navigate(`/recording/${id}`);
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, just return the time
    if (date.toDateString() === now.toDateString()) {
      return formatTimestamp(timestamp);
    }
    
    // If this year, return month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise return full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const filteredRecordings = recordings.filter(recording => 
    recording.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="p-4 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DialogIQ</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate('/new-recording')}>
          <Plus className="h-6 w-6" />
        </Button>
      </header>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search recordings"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary"
        />
      </div>
      
      <div className="space-y-1">
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recordings found</p>
            <Button variant="link" onClick={() => navigate('/new-recording')}>
              Create your first recording
            </Button>
          </div>
        ) : (
          filteredRecordings.map((recording, index) => {
            // Group recordings by date
            const showDateHeader = index === 0 || 
              new Date(recording.timestamp).toDateString() !== 
              new Date(filteredRecordings[index - 1].timestamp).toDateString();
            
            return (
              <React.Fragment key={recording.id}>
                {showDateHeader && (
                  <div className="text-sm font-medium text-muted-foreground pt-4 pb-2">
                    {new Date(recording.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                )}
                <div 
                  className="recording-item animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleOpenRecording(recording.id)}
                >
                  <div>
                    <h3 className="font-medium">{recording.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatTimestamp(recording.timestamp)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecording(recording.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecordingList;
