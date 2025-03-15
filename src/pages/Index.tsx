
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import Onboarding from '@/components/Onboarding';
import RecordingList from '@/components/RecordingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index: React.FC = () => {
  const { isOnboarded } = useApp();
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "min-h-screen bg-background",
      isMobile && "safe-area-padding"
    )}>
      {isOnboarded ? <RecordingList /> : <Onboarding />}
    </div>
  );
};

export default Index;
