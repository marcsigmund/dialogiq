
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import Onboarding from '@/components/Onboarding';
import RecordingList from '@/components/RecordingList';

const Index: React.FC = () => {
  const { isOnboarded } = useApp();
  
  return (
    <div className="min-h-screen bg-background">
      {isOnboarded ? <RecordingList /> : <Onboarding />}
    </div>
  );
};

export default Index;
