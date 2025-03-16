import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Mic,
  MicOff,
  PlayCircle,
  PauseCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { uploadAudio, pollProcessStatus } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { LiveAudioVisualizer } from "react-audio-visualize";
import { PulseLoader } from "react-spinners";
import Typewriter from "typewriter-effect";

interface Word {
  text: string;
  start: number;
  end: number;
  type: "word" | "spacing";
  speaker_id: string;
}

interface TranscriptionResult {
  language_code: string;
  language_probability: number;
  text: string;
  words: Word[];
}

interface SpeakerSegment {
  speaker_id: string;
  text: string;
  start: number;
  end: number;
}

interface VoiceRecognitionScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onRecordingComplete?: (blob: Blob, url: string, duration: number) => void;
}

export const VoiceRecognitionScreen: React.FC<VoiceRecognitionScreenProps> = ({
  onNext,
  onBack,
  onSkip,
  onRecordingComplete,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognized, setVoiceRecognized] = useState(false);
  const [currentPermission, setCurrentPermission] =
    useState<PermissionState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaRecorderState, setMediaRecorderState] =
    useState<MediaRecorder | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(
    null
  );
  const [showTranscription, setShowTranscription] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTypingLine, setCurrentTypingLine] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlob = useRef<Blob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setCurrentPermission(permissionStatus.state);

        permissionStatus.onchange = () => {
          setCurrentPermission(permissionStatus.state);
        };
      } catch (error) {
        console.error("Error checking microphone permission:", error);
      }
    };

    checkMicrophonePermission();

    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);

      const updatePlaybackProgress = () => {
        if (audioRef.current) {
          const progress =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(isNaN(progress) ? 0 : progress);
        }
      };

      audioRef.current.addEventListener("timeupdate", updatePlaybackProgress);
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener(
            "timeupdate",
            updatePlaybackProgress
          );
          audioRef.current.removeEventListener("ended", () => {
            setIsPlaying(false);
            setPlaybackProgress(0);
          });
        }
      };
    }
  }, [audioUrl]);

  const handleVoiceRecognition = async () => {
    try {
      audioChunks.current = [];

      if (!stream.current) {
        stream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      mediaRecorder.current = new MediaRecorder(stream.current);
      setMediaRecorderState(mediaRecorder.current);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const newAudioBlob = new Blob(audioChunks.current, {
          type: "audio/wav",
        });
        audioBlob.current = newAudioBlob;
        const url = URL.createObjectURL(newAudioBlob);
        setAudioUrl(url);
        setIsListening(false);
        setVoiceRecognized(true);
        setMediaRecorderState(null);

        handleUploadAudio(newAudioBlob);
      };

      setIsListening(true);
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
      setVoiceRecognized(true);
      setMediaRecorderState(null);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setMediaRecorderState(null);

      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
        stream.current = null;
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioUrl) {
      const seekTo = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTo;
      setPlaybackProgress(value[0]);
    }
  };

  const handleUploadAudio = async (blob: Blob) => {
    setIsUploading(true);
    setUploadError(null);
    setTranscriptionText(null);
    setShowTranscription(false);
    setCurrentWordIndex(-1);

    console.log("Starting audio upload process...");
    console.log("Audio blob size:", Math.round(blob.size / 1024), "KB");

    try {
      console.log("Sending audio to API...");
      const response = await uploadAudio(blob);

      console.log("Audio upload response:", response);

      toast({
        title: "Voice sample uploaded",
        description: "Your voice sample has been uploaded successfully.",
      });

      if (response && response.id) {
        console.log("Received process ID:", response.id);
        console.log("Starting to poll for process status");
        setIsPolling(true);

        pollProcessStatus(response.id, 2000, 30)
          .then((finalStatus) => {
            console.log("Polling completed with final status:", finalStatus);
            setIsPolling(false);

            if (
              finalStatus.status === "complete" &&
              finalStatus.result?.elevenlabs
            ) {
              console.log(
                "Process completed successfully:",
                finalStatus.result
              );

              const conversationText = finalStatus.result.elevenlabs
                .map(
                  (text, index) =>
                    `${index % 2 === 0 ? "You" : "Partner"}: ${text}`
                )
                .join("\n\n");

              setTranscriptionText(conversationText);
              setShowTranscription(true);

              toast({
                title: "Processing complete",
                description:
                  "Your voice sample has been processed successfully.",
              });
            } else if (finalStatus.status === "failed") {
              console.error("Process failed:", finalStatus.error);

              toast({
                title: "Processing failed",
                description:
                  "An error occurred while processing your voice sample.",
                variant: "destructive",
              });
            } else {
              console.log(
                "Process status is still pending after maximum polling attempts"
              );
            }
          })
          .catch((error) => {
            console.error("Error during status polling:", error);
            setIsPolling(false);
          });
      } else {
        console.warn("No process ID received in the upload response");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      setUploadError("Failed to upload audio. You can continue anyway.");

      toast({
        title: "Upload failed",
        description: "Failed to upload voice sample. You can continue anyway.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const animateTranscription = (result: TranscriptionResult) => {
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
    }
    setCurrentWordIndex(-1);

    if (!result?.words) {
      console.error("Invalid transcription result:", result);
      return;
    }

    const words = result.words.filter((word) => word.type === "word");
    let currentIndex = 0;

    const animateWord = () => {
      if (currentIndex < words.length) {
        setCurrentWordIndex(currentIndex);
        const nextWord = words[currentIndex + 1];
        if (nextWord) {
          const delay = (nextWord.start - words[currentIndex].start) * 1000;
          transcriptionTimeoutRef.current = setTimeout(() => {
            currentIndex++;
            animateWord();
          }, delay);
        }
      }
    };

    if (words.length > 0) {
      animateWord();
    }
  };

  useEffect(() => {
    return () => {
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (voiceRecognized && !isUploading && audioBlob.current && audioUrl) {
      console.log("Onboarding Voice Selection:", {
        transcription: transcriptionText,
        audioBlob: audioBlob.current,
        audioUrl: audioUrl,
        duration: audioRef.current?.duration || 0,
      });

      if (onRecordingComplete && audioBlob.current && audioUrl) {
        onRecordingComplete(
          audioBlob.current, 
          audioUrl, 
          audioRef.current?.duration || 0
        );
      } else {
        onNext();
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        {isListening && mediaRecorderState && (
          <div className="w-full max-w-xs mx-auto mb-4">
            <div
              className="audio-visualizer-container rounded-lg overflow-hidden"
              style={{ height: "80px", background: "rgba(239, 68, 68, 0.05)" }}
            >
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorderState}
                width={300}
                height={80}
                barWidth={2}
                gap={1}
                barColor="url(#recordingGradient)"
                backgroundColor="transparent"
              />
              <svg style={{ position: "absolute", width: 0, height: 0 }}>
                <defs>
                  <linearGradient
                    id="recordingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}

        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
            isListening
              ? "bg-app-red text-white animate-pulse-record"
              : voiceRecognized && !isPlaying
              ? "bg-app-green/10 text-app-green"
              : voiceRecognized && isPlaying
              ? "bg-app-green text-white animate-pulse"
              : "bg-app-gray-light text-muted-foreground"
          )}
          onClick={
            voiceRecognized
              ? handlePlayPause
              : isListening
              ? handleStopRecording
              : handleVoiceRecognition
          }
          style={{ cursor: "pointer" }}
        >
          {isPolling ? (
            <div className="flex flex-col items-center">
              <PulseLoader color="#10B981" size={12} />
              <span className="text-xs mt-2 text-app-green">Processing...</span>
            </div>
          ) : voiceRecognized ? (
            isPlaying ? (
              <PauseCircle className="w-16 h-16" />
            ) : (
              <PlayCircle className="w-16 h-16" />
            )
          ) : isListening ? (
            <MicOff className="w-16 h-16" />
          ) : (
            <Mic className="w-16 h-16" />
          )}
        </div>

        {voiceRecognized && audioUrl && !isPolling && (
          <div className="w-full max-w-xs mx-auto">
            <Slider
              value={[playbackProgress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        )}

        <div className="text-center">
          <p className="font-medium text-lg mb-1">
            {voiceRecognized
              ? isPolling
                ? "Processing your voice sample..."
                : isPlaying
                ? "Playing back your voice..."
                : isUploading
                ? "Uploading voice sample..."
                : "Voice recorded successfully!"
              : isListening
              ? "Recording your voice... Tap the microphone to stop"
              : "Tap the microphone to start recording"}
          </p>
          <p className="text-sm text-muted-foreground">
            {voiceRecognized
              ? isPolling
                ? "Please wait while we analyze your voice sample..."
                : isUploading
                ? "Please wait while we upload your voice sample..."
                : "You're ready for your first conversation"
              : isListening
              ? "Please speak naturally. Tap the microphone again when you're done"
              : "Let's record a sample of your voice"}
          </p>
        </div>

        {transcriptionText && (
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setShowTranscription(!showTranscription);
                if (!showTranscription) {
                  setCurrentTypingLine(0);
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">View Transcription</span>
              </div>
              {showTranscription ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {showTranscription && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border text-left">
                <div className="space-y-6">
                  {transcriptionText?.split("\n\n").map((line, index) => (
                    <div
                      key={index}
                      className={cn(
                        "transition-all duration-500",
                        index > currentTypingLine ? "opacity-0" : "opacity-100"
                      )}
                    >
                      {index === currentTypingLine && (
                        <Typewriter
                          onInit={(typewriter) => {
                            typewriter
                              .changeDelay(30)
                              .typeString(line)
                              .callFunction(() => {
                                setTimeout(() => {
                                  setCurrentTypingLine((prev) => prev + 1);
                                }, 500);
                              })
                              .start();
                          }}
                          options={{
                            cursor: "",
                          }}
                        />
                      )}
                      {index < currentTypingLine && <div>{line}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div className="text-amber-500 text-center">{uploadError}</div>
        )}

        {currentPermission === "denied" && (
          <div className="text-destructive text-center">
            Microphone access is blocked. Please allow microphone access in your
            browser settings.
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          variant="default"
          onClick={handleNext}
          disabled={!voiceRecognized || isUploading || isPolling}
        >
          See Results
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
