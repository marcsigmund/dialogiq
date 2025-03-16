
import React, { useState, useEffect } from 'react';
import { useApp, Recording } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle, AlertCircle, Text, List, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AnalysisProps {
  recordingId: string;
}

type ErrorType = 'mistake' | 'inaccuracy' | 'grammar';

// Define the structure we expect for a highlight item
interface HighlightItem {
  startIndex: number;
  endIndex: number;
  suggestion: string;
  type: ErrorType;
  color: string;
}

export const Analysis: React.FC<AnalysisProps> = ({ recordingId }) => {
  const { getSelectedRecording, updateRecording } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInaccuraciesOpen, setIsInaccuraciesOpen] = useState(false);
  const { toast } = useToast();
  
  const recording = getSelectedRecording();
  
  useEffect(() => {
    // Auto-generate analysis if there's none
    if (recording && !recording.transcript && !isAnalyzing) {
      handleGenerateAnalysis();
    }
  }, [recording]);
  
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
      
      // Mock response with different types of errors
      const mockAnalysis = {
        transcript: "You: Hello, I'm practicing my German. Ich bin ein Student und ich lerne Deutsch seit zwei Jahren. Manchmal mache ich Fehler mit der Grammatik. Ich hoffe, dass ich besser werde.",
        highlights: [
          {
            startIndex: 89,
            endIndex: 110,
            suggestion: "Watch your word order in 'Manchmal mache ich Fehler'. Consider using 'Manchmal Fehler mache ich' for variety.",
            type: "inaccuracy" as ErrorType,
            color: "bg-yellow-100"
          },
          {
            startIndex: 159,
            endIndex: 183,
            suggestion: "Better to say 'Ich hoffe, dass ich mich verbessere' for more natural phrasing.",
            type: "grammar" as ErrorType,
            color: "bg-orange-100"
          },
          {
            startIndex: 50,
            endIndex: 62,
            suggestion: "The word 'Student' should be 'Studierender' for gender-neutral language.",
            type: "mistake" as ErrorType,
            color: "bg-red-100"
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
      
      // Add the highlighted text with appropriate color based on type
      // For highlights without color property, use a default
      const highlightColor = 'color' in highlight 
        ? (highlight as HighlightItem).color 
        : 'bg-yellow-100';
      
      elements.push(
        <span 
          key={`highlight-${i}`}
          className={`${highlightColor} px-1 py-0.5 rounded-sm relative group cursor-pointer`}
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
    
    return <div className="space-y-2 text-left">{elements}</div>;
  };
  
  const errorTypes = {
    mistake: { label: "Mistakes", color: "text-red-500", description: "Words that don't exist or are completely wrong" },
    inaccuracy: { label: "Inaccuracies", color: "text-yellow-500", description: "Unusual phrasing or uncommon expressions" },
    grammar: { label: "Grammar", color: "text-orange-500", description: "Incorrect sentence structure or grammar" }
  };
  
  const renderErrorLegend = () => {
    return (
      <Collapsible 
        open={isInaccuraciesOpen} 
        onOpenChange={setIsInaccuraciesOpen}
        className="mt-4"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex w-full justify-between items-center p-2 text-sm rounded-lg"
          >
            <div className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              <span>Types of inaccuracies detected</span>
            </div>
            {isInaccuraciesOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 text-sm bg-white/50 p-3 rounded-lg space-y-2">
            {Object.entries(errorTypes).map(([key, { label, color, description }]) => (
              <div key={key} className="flex items-start">
                <div className={`w-2 h-2 mt-1.5 rounded-full ${color.replace('text-', 'bg-')}`}></div>
                <div className="ml-2">
                  <span className={`font-medium ${color}`}>{label}</span>: {description}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };
  
  return (
    <div className="animate-fade-in">
      {!recording.analysis ? (
        <div className="glass-panel p-6 text-center">
          <p className="mb-4">
            Analyzing your conversation...
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
              <Text className="mr-2 h-4 w-4" />
              Conversation Transcript
            </h3>
            <div className="bg-white/50 p-4 rounded-lg">
              {renderTranscriptWithHighlights()}
              {renderErrorLegend()}
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-left">{recording.analysis.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
