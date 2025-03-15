
import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import Onboarding from '@/components/Onboarding';
import RecordingList from '@/components/RecordingList';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const { isOnboarded } = useApp();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Set status bar color for mobile platforms
    if ((window as any).Capacitor?.isNativePlatform()) {
      try {
        // This would normally use StatusBar plugin
        console.log('Would set status bar style on native');
      } catch (err) {
        console.error('Failed to set status bar style:', err);
      }
    }
  }, []);
  
  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'mobile-safe-area' : ''}`}>
      {isOnboarded ? <RecordingList /> : <Onboarding />}
    </div>
  );
};

export default Index;
