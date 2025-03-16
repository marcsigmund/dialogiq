
import React, { createContext, useContext, useState, useEffect } from "react";

type UseCaseType = "language" | "sales" | "interview" | null;

interface ErrorItem {
  quote: string;
  error_type: string;
  correction: string;
}

interface VocabItem {
  quote: string;
  synonyms: string[];
}

interface ErrorItemRanged {
  ranges: [number, number, number][];
  error_type: string;
  correction: string;
}

interface VocabItemRanged {
  range: [number, number, number];
  synonyms: string[];
}

interface EvaluationResponse {
  mistakes: ErrorItem[];
  inaccuracies: ErrorItem[];
  vocabularies: VocabItem[];
}

interface EvaluationResponseRanged {
  mistakes: ErrorItemRanged[];
  inaccuracies: ErrorItemRanged[];
  vocabularies: VocabItemRanged[];
}

export interface Recording {
  id: string;
  title: string;
  timestamp: number;
  duration: number;
  audioUrl: string;
  transcript?: string;
  analysis?: {
    highlights?: {
      startIndex: number;
      endIndex: number;
      suggestion: string;
      type?: string; // For backward compatibility
      color?: string; // For backward compatibility
    }[];
    recommendations?: string;
    apiResponse?: EvaluationResponse;
    apiRangedResponse?: EvaluationResponseRanged;
  };
}

interface AppContextType {
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  useCase: UseCaseType;
  setUseCase: (value: UseCaseType) => void;
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, data: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  selectedRecordingId: string | null;
  setSelectedRecordingId: (id: string | null) => void;
  getSelectedRecording: () => Recording | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  const [useCase, setUseCase] = useState<UseCaseType>(() => {
    const stored = localStorage.getItem("useCase");
    return stored ? JSON.parse(stored) : null;
  });

  const [recordings, setRecordings] = useState<Recording[]>(() => {
    const stored = localStorage.getItem("recordings");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem("useCase", JSON.stringify(useCase));
  }, [useCase]);

  useEffect(() => {
    localStorage.setItem("recordings", JSON.stringify(recordings));
  }, [recordings]);

  const addRecording = (recording: Recording) => {
    setRecordings((prev) => [recording, ...prev]);
  };

  const updateRecording = (id: string, data: Partial<Recording>) => {
    setRecordings((prev) =>
      prev.map((recording) =>
        recording.id === id ? { ...recording, ...data } : recording
      )
    );
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((recording) => recording.id !== id));
  };

  const getSelectedRecording = () => {
    return recordings.find((r) => r.id === selectedRecordingId);
  };

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        setIsOnboarded,
        useCase,
        setUseCase,
        recordings,
        addRecording,
        updateRecording,
        deleteRecording,
        selectedRecordingId,
        setSelectedRecordingId,
        getSelectedRecording,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
