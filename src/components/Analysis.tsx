
import React, { useState } from 'react';
import { useApp, Recording } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisProps {
  recordingId: string;
}

export const Analysis: React.FC<AnalysisProps> = ({ recordingId }) => {
  const { getSelectedRecording, updateRecording } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const recording = getSelectedRecording();
  
  if (!recording) {
    return <div>Recording not found</div>;
  }
  
  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Mock API call for now
      // In a real implementation, you would send the audio to your backend
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock response
      const mockAnalysis = {
        transcript: "Hello, I'm practicing my German. Ich bin ein Student und ich lerne Deutsch seit zwei Jahren. Manchmal mache ich Fehler mit der Grammatik. Ich hoffe, dass ich besser werde.",
        highlights: [
          {
            startIndex: 89,
            endIndex: 110,
            suggestion: "Watch your word order in 'Manchmal mache ich Fehler'. Consider using 'Manchmal Fehler mache ich' for variety."
          },
          {
            startIndex: 159,
            endIndex: 183,
            suggestion: "Better to say 'Ich hoffe, dass ich mich verbessere' for more natural phrasing."
          }
        ],
        recommendations: "Your German pronunciation is good, but you can improve your sentence structure. Try using more complex sentences and paying attention to verb placement. Consider practicing with subordinate clauses to improve your fluency."
      };
      
      // Update the recording with the analysis
      updateRecording(recordingId, {
        transcript: mockAnalysis.transcript,
        analysis: {
          highlights: mockAnalysis.highlights,
          recommendations: mockAnalysis.recommendations
        }
      });
      
      toast({
        title: "Analysis complete",
        description: "Your recording has been analyzed successfully.",
      });
    } catch (err) {
      console.error("Error analyzing recording:", err);
      setError("Failed to analyze recording. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error analyzing your recording.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const renderTranscriptWithHighlights = () => {
    if (!recording.transcript || !recording.analysis?.highlights) {
      return <p>{recording.transcript || "No transcript available"}</p>;
    }
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    
    // Sort highlights by startIndex to process them in order
    const sortedHighlights = [...recording.analysis.highlights].sort((a, b) => a.startIndex - b.startIndex);
    
    sortedHighlights.forEach((highlight, i) => {
      // Add text before the highlight
      if (highlight.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>
            {recording.transcript!.substring(lastIndex, highlight.startIndex)}
          </span>
        );
      }
      
      // Add the highlighted text
      elements.push(
        <span 
          key={`highlight-${i}`}
          className="highlight-text relative group"
        >
          {recording.transcript!.substring(highlight.startIndex, highlight.endIndex)}
          <span className="hidden group-hover:block absolute bottom-full left-0 w-64 p-2 bg-white rounded-md shadow-lg text-sm z-10 mb-1">
            {highlight.suggestion}
          </span>
        </span>
      );
      
      lastIndex = highlight.endIndex;
    });
    
    // Add any remaining text
    if (lastIndex < recording.transcript.length) {
      elements.push(
        <span key="text-end">
          {recording.transcript.substring(lastIndex)}
        </span>
      );
    }
    
    return <div className="space-y-2">{elements}</div>;
  };
  
  return (
    <div className="p-4 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Analysis</h2>
      
      {!recording.analysis ? (
        <div className="glass-panel p-6 text-center">
          <p className="mb-4">
            Generate an analysis to get insights and improvement suggestions.
          </p>
          
          <Button
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Generate Analysis"
            )}
          </Button>
          
          {error && (
            <p className="mt-4 text-destructive flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-app-green" />
              Transcript
            </h3>
            <div className="bg-white/50 p-4 rounded-lg">
              {renderTranscriptWithHighlights()}
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <div className="bg-white/50 p-4 rounded-lg">
              <p>{recording.analysis.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
