
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import RecordingView from "./pages/RecordingView";
import RecordingDetail from "./components/RecordingDetail";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { App as CapApp } from "@capacitor/core";

const queryClient = new QueryClient();

const App = () => {
  // Handle hardware back button for Android
  useEffect(() => {
    const handleBackButton = () => {
      // This will only run on native mobile platforms
      if ((window as any).Capacitor?.isNativePlatform()) {
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            // If at the root of the app, prompt before exiting
            CapApp.exitApp();
          }
        });
      }
    };

    handleBackButton();

    return () => {
      if ((window as any).Capacitor?.isNativePlatform()) {
        CapApp.removeAllListeners();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/new-recording" element={<RecordingView />} />
              <Route path="/recording/:id" element={<RecordingDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
