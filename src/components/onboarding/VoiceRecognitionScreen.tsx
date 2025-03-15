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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { uploadAudio, pollProcessStatus } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecognitionScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const VoiceRecognitionScreen: React.FC<VoiceRecognitionScreenProps> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognized, setVoiceRecognized] = useState(false);
  const [currentPermission, setCurrentPermission] =
    useState<PermissionState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlob = useRef<Blob | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check microphone permission status
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

        // Upload the audio recording to the API
        handleUploadAudio(newAudioBlob);
      };

      setIsListening(true);
      mediaRecorder.current.start();
      // We no longer set a timeout to automatically stop recording
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // If we can't access the microphone, just pretend it worked
      setIsListening(false);
      setVoiceRecognized(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();

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

    console.log("Starting audio upload process...");
    console.log("Audio blob size:", Math.round(blob.size / 1024), "KB");

    try {
      // Upload the audio recording to the API
      console.log("Sending audio to API...");
      const response = await uploadAudio(blob);

      // Handle the API response
      console.log("Audio upload response:", response);

      toast({
        title: "Voice sample uploaded",
        description: "Your voice sample has been uploaded successfully.",
      });

      // Start polling for process status
      if (response && response.id) {
        console.log("Received process ID:", response.id);
        console.log("Starting to poll for process status");

        // Poll for status with 2-second intervals, up to 30 attempts (60 seconds total)
        pollProcessStatus(response.id, 2000, 30)
          .then((finalStatus) => {
            console.log("Polling completed with final status:", finalStatus);

            if (finalStatus.status === "complete") {
              console.log(
                "Process completed successfully:",
                finalStatus.result
              );

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

  const handleNext = () => {
    if (voiceRecognized && !isUploading) {
      onNext();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
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
          {voiceRecognized ? (
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

        {voiceRecognized && audioUrl && (
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
              ? isPlaying
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
              ? isUploading
                ? "Please wait while we upload your voice sample..."
                : "You're ready for your first conversation"
              : isListening
              ? "Please speak naturally. Tap the microphone again when you're done"
              : "Let's record a sample of your voice"}
          </p>
        </div>

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
          disabled={!voiceRecognized || isUploading}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
