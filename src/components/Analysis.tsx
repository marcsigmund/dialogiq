import React, { useState, useEffect } from 'react';
import { useApp, Recording } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle, AlertCircle, Text, List, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { checkProcessStatus, pollProcessStatus } from '@/lib/api';

interface AnalysisProps {
  recordingId: string;
}

export const Analysis: React.FC<AnalysisProps> = ({ recordingId }) => {
  const { getSelectedRecording, updateRecording } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorTypesOpen, setIsErrorTypesOpen] = useState(false);
  const { toast } = useToast();
  
  const recording = getSelectedRecording();
  
  useEffect(() => {
    // Auto-generate analysis if there's none
    if (recording && !recording.transcript && !isAnalyzing) {
      handleGenerateAnalysis();
    }
  }, [recording]);

  useEffect(() => {
    // If we have an API response ID, check its status
    if (recording?.analysis?.apiResponseId && !recording.analysis.apiResponse) {
      checkApiResponseStatus(recording.analysis.apiResponseId);
    }
  }, [recording]);
  
  if (!recording) {
    return <div>Recording not found</div>;
  }

  const checkApiResponseStatus = async (processId: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const status = await pollProcessStatus(processId, 2000, 30);
      
      if (status.status === "complete" && status.result) {
        updateRecording(recordingId, {
          transcript: status.result.transcript || '',
          analysis: {
            ...(recording.analysis || {}),
            apiResponse: status.result.evaluation || null,
            recommendations: status.result.recommendations || "No specific recommendations available."
          }
        });
        
        toast({
          title: "Analysis complete",
          description: "Your recording has been analyzed successfully.",
        });
      } else {
        setError("Failed to get analysis results. Please try again.");
        
        toast({
          variant: "destructive",
          title: "Analysis failed",
          description: "There was an error analyzing your recording.",
        });
      }
    } catch (err) {
      console.error("Error checking analysis status:", err);
      setError("Failed to get analysis results. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error analyzing your recording.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // If we have an API response ID from the upload process
      if (recording.apiResponseId) {
        checkApiResponseStatus(recording.apiResponseId);
      } else {
        // For now, just use mock data if we don't have real data
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Replace speakers with "You" and "Partner"
        const formattedTranscript = "You: Hello, I'm practicing my German. Ich bin ein Student und ich lerne Deutsch seit zwei Jahren. Manchmal mache ich Fehler mit der Grammatik. Ich hoffe, dass ich besser werde.\n\nPartner: Das ist sehr gut! Dein Deutsch klingt schon ziemlich fließend.";
        
        updateRecording(recordingId, {
          transcript: formattedTranscript,
          analysis: {
            recommendations: "Your German pronunciation is good, but you can improve your sentence structure. Try using more complex sentences and paying attention to verb placement. Consider practicing with subordinate clauses to improve your fluency."
          }
        });
        
        toast({
          title: "Analysis complete",
          description: "Your recording has been analyzed successfully.",
        });
      }
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

  const getErrorTypeDescription = (errorType: string): { title: string, description: string, examples: string[] } => {
    switch (errorType.toLowerCase()) {
      case 'mistake':
      case 'grammar':
        return {
          title: "Fehler (Mistakes)",
          description: "Gravierende Sprachfehler, die das Verständnis oder die Kommunikation erheblich beeinträchtigen.",
          examples: [
            "\"Gestern Abend habe ich drei Stunden lang gecomputert\" (statt: \"am Computer gearbeitet\")",
            "\"Die Kinder ist müde\" (statt: \"Die Kinder sind müde\")",
            "\"Ich nehme einen Spaziergang\" (statt: \"mache einen Spaziergang\")"
          ]
        };
      case 'inaccuracy':
      case 'filling_word':
        return {
          title: "Unstimmigkeiten (Inaccuracies)",
          description: "Fehler, die zwar vorhanden sind, das Verständnis aber nicht oder nur geringfügig beeinträchtigen.",
          examples: [
            "Füllwörter wie \"äh\", \"ähm\", \"also\"",
            "\"Ich tue jetzt essen\" (statt: \"Ich esse jetzt\")",
            "\"Ich gehe zu Supermarkt\" (statt: \"Ich gehe zum Supermarkt\")"
          ]
        };
      case 'vocabulary':
        return {
          title: "Vokabular (Vocabulary)",
          description: "Vorschläge zur Verbesserung des aktiven Wortschatzes und alternative Ausdrucksmöglichkeiten.",
          examples: [
            "\"Es war sehr hektisch im Büro\" → \"sehr stressig\", \"sehr geschäftig\"",
            "\"Das Essen war gut\" → \"hat ausgezeichnet geschmeckt\", \"war köstlich\"",
            "Alternative Ausdrücke für häufig verwendete Verben und einfache Adjektive"
          ]
        };
      default:
        return {
          title: "Sprachanalyse",
          description: "Feedback zu deiner Sprachverwendung.",
          examples: []
        };
    }
  };
  
  const renderTranscript = () => {
    if (!recording.transcript) {
      return <p>No transcript available</p>;
    }
    
    // If we have real API data, render it with highlights
    if (recording.analysis?.apiResponse) {
      return renderTranscriptWithApiData();
    }
    
    // Otherwise, just render the plain transcript
    // Split by newlines to handle speakers properly
    const lines = recording.transcript.split('\n\n');
    return (
      <div className="space-y-4">
        {lines.map((line, index) => (
          <p key={index} className="text-left">{line}</p>
        ))}
      </div>
    );
  };

  const renderTranscriptWithApiData = () => {
    if (!recording.transcript || !recording.analysis?.apiResponse) {
      return <p>{recording.transcript || "No transcript available"}</p>;
    }
    
    // Get the full list of all issues we need to highlight
    const apiResponse = recording.analysis.apiResponse;
    
    // Create a list of all highlights
    const allHighlights: Array<{
      quote: string; 
      errorType: string; 
      correction: string;
      type: 'mistake' | 'inaccuracy' | 'vocabulary';
    }> = [
      ...apiResponse.mistakes.map(err => ({ 
        quote: err.quote, 
        errorType: err.error_type, 
        correction: err.correction,
        type: 'mistake' as const
      })),
      ...apiResponse.inaccuracies.map(err => ({ 
        quote: err.quote, 
        errorType: err.error_type, 
        correction: err.correction,
        type: 'inaccuracy' as const
      })),
      ...(apiResponse.vocabularies || []).map(vocab => ({ 
        quote: vocab.quote, 
        errorType: 'vocabulary', 
        correction: vocab.synonyms.join(', '),
        type: 'vocabulary' as const
      }))
    ];
    
    // Filter out duplicates (same quote and type)
    const uniqueHighlights = allHighlights.filter((highlight, index, self) => 
      index === self.findIndex(h => h.quote === highlight.quote && h.type === highlight.type)
    );
    
    // Split the transcript by speakers
    const lines = recording.transcript.split('\n\n');
    
    return (
      <div className="space-y-6">
        {lines.map((line, lineIndex) => {
          // Find all highlights that appear in this line
          const lineHighlights = uniqueHighlights.filter(h => line.includes(h.quote));
          
          if (lineHighlights.length === 0) {
            // If no highlights in this line, just render the line
            return <p key={lineIndex} className="text-left">{line}</p>;
          }
          
          // Sort by the position they appear in the line
          lineHighlights.sort((a, b) => line.indexOf(a.quote) - line.indexOf(b.quote));
          
          const elements: React.ReactNode[] = [];
          let lastIndex = 0;
          
          lineHighlights.forEach((highlight, i) => {
            const startIndex = line.indexOf(highlight.quote, lastIndex);
            if (startIndex === -1) return; // Skip if not found
            
            const endIndex = startIndex + highlight.quote.length;
            
            // Add text before the highlight
            if (startIndex > lastIndex) {
              elements.push(
                <span key={`text-${lineIndex}-${i}`}>
                  {line.substring(lastIndex, startIndex)}
                </span>
              );
            }
            
            // Define color based on error type
            let highlightColor = '';
            if (highlight.type === 'mistake') {
              highlightColor = 'bg-red-100';
            } else if (highlight.type === 'inaccuracy') {
              highlightColor = 'bg-yellow-100';
            } else if (highlight.type === 'vocabulary') {
              highlightColor = 'bg-blue-100';
            }
            
            // Add the highlighted text with hover card
            elements.push(
              <HoverCard key={`highlight-${lineIndex}-${i}`}>
                <HoverCardTrigger asChild>
                  <span 
                    className={`${highlightColor} px-1 py-0.5 rounded-sm cursor-help`}
                  >
                    {highlight.quote}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{highlight.errorType}</h4>
                    <p className="text-sm">
                      {highlight.correction}
                    </p>
                    {highlight.type === 'inaccuracy' && highlight.errorType === 'filling_word' && (
                      <p className="text-xs text-muted-foreground">
                        Füllwörter wie "{highlight.quote}" stören den Sprachfluss und sollten vermieden werden.
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
            
            lastIndex = endIndex;
          });
          
          // Add any remaining text
          if (lastIndex < line.length) {
            elements.push(
              <span key={`text-${lineIndex}-end`}>
                {line.substring(lastIndex)}
              </span>
            );
          }
          
          return <p key={lineIndex} className="text-left">{elements}</p>;
        })}
      </div>
    );
  };

  const renderErrorLegend = () => {
    const errorTypes = [
      {
        id: 'mistake',
        title: 'Fehler (Mistakes)',
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        description: 'Gravierende Sprachfehler, die das Verständnis beeinträchtigen'
      },
      {
        id: 'inaccuracy',
        title: 'Unstimmigkeiten (Inaccuracies)',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        description: 'Fehler, die das Verständnis nicht oder nur geringfügig beeinträchtigen'
      },
      {
        id: 'vocabulary',
        title: 'Vokabular (Vocabulary)',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        description: 'Vorschläge zur Verbesserung des aktiven Wortschatzes'
      }
    ];
    
    return (
      <Collapsible 
        open={isErrorTypesOpen} 
        onOpenChange={setIsErrorTypesOpen}
        className="mt-4"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex w-full justify-between items-center p-2 text-sm rounded-lg"
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <span>Fehlertypen und ihre Bedeutung</span>
            </div>
            {isErrorTypesOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 text-sm bg-white/50 p-3 rounded-lg space-y-4">
            {errorTypes.map((type) => (
              <div key={type.id} className="space-y-2">
                <div className="flex items-start">
                  <div className={`w-3 h-3 mt-1.5 rounded-full ${type.bgColor}`}></div>
                  <div className="ml-2">
                    <span className={`font-medium ${type.color}`}>{type.title}</span>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                      <Info className="h-3 w-3 mr-1" />
                      Mehr erfahren
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-96 p-4">
                    <div className="space-y-2">
                      {type.id === 'mistake' && (
                        <>
                          <h4 className="font-medium">Fehler (Mistakes)</h4>
                          <p className="text-sm">Gravierende Sprachfehler, die das Verständnis oder die Kommunikation erheblich beeinträchtigen:</p>
                          <ul className="text-sm list-disc pl-4 space-y-2">
                            <li>
                              <strong>Nicht existierendes Wort:</strong>
                              <ul className="list-disc pl-4 text-xs">
                                <li>Wortschöpfungen oder falsche Übertragungen aus anderen Sprachen</li>
                                <li>Erfundene Komposita</li>
                              </ul>
                            </li>
                            <li>
                              <strong>Grammatikalischer Fehler:</strong>
                              <ul className="list-disc pl-4 text-xs">
                                <li>Schwerwiegende grammatikalische Fehler, die das Verständnis erheblich beeinträchtigen</li>
                                <li>Fehlerhafte Satzstellung, die den Sinn entstellt</li>
                              </ul>
                            </li>
                            <li>
                              <strong>Lexikalischer Fehler:</strong>
                              <ul className="list-disc pl-4 text-xs">
                                <li>Falsche Wortbedeutung im Kontext, die zu Missverständnissen führen</li>
                                <li>Verwechslung ähnlich klingender Wörter mit unterschiedlicher Bedeutung</li>
                              </ul>
                            </li>
                          </ul>
                        </>
                      )}
                      
                      {type.id === 'inaccuracy' && (
                        <>
                          <h4 className="font-medium">Unstimmigkeiten (Inaccuracies)</h4>
                          <p className="text-sm">Fehler, die zwar vorhanden sind, das Verständnis aber nicht oder nur geringfügig beeinträchtigen:</p>
                          <ul className="text-sm list-disc pl-4 space-y-2">
                            <li>
                              <strong>Füllwörter:</strong>
                              <ul className="list-disc pl-4 text-xs">
                                <li>Jedes Füllwort ("äh", "ähm", "also", "ja", "nun")</li>
                                <li>Mehrfaches Vorkommen desselben Füllworts wird als ein Eintrag gelistet</li>
                              </ul>
                            </li>
                            <li>
                              <strong>Stilistischer Fehler:</strong>
                              <ul className="list-disc pl-4 text-xs">
                                <li>Ungewöhnliche oder unnatürliche Wortwahl bzw. Ausdrucksweise</li>
                                <li>Leichte Artikelfehler oder fehlende Artikel, die das Verständnis nicht beeinträchtigen</li>
                              </ul>
                            </li>
                          </ul>
                        </>
                      )}
                      
                      {type.id === 'vocabulary' && (
                        <>
                          <h4 className="font-medium">Vokabular (Vocabulary)</h4>
                          <p className="text-sm">Vorschläge zur Verbesserung des aktiven Wortschatzes:</p>
                          <ul className="text-sm list-disc pl-4 space-y-1">
                            <li>Alternative Ausdrucksmöglichkeiten für häufig verwendete Verben ("machen", "sein", "haben")</li>
                            <li>Situationsangemessene Synonyme</li>
                            <li>Idiomatische Alternativen</li>
                            <li>Fachspezifische Begriffe, wenn passend</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };
  
  return (
    <div className="animate-fade-in">
      {!recording.transcript ? (
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
              {renderTranscript()}
              {renderErrorLegend()}
            </div>
          </div>
          
          {recording.analysis?.recommendations && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-medium mb-3">Recommendations</h3>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-left">{recording.analysis.recommendations}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
