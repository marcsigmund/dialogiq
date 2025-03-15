
import React from 'react';
import { CheckCircle, MessageSquare, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface IntroScreenProps {
  onNext: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onNext }) => {
  return (
    <>
      <div className="flex flex-col items-center space-y-5">
        <div className="flex space-x-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="w-16 h-16 rounded-full bg-app-green/10 flex items-center justify-center text-app-green">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="w-16 h-16 rounded-full bg-app-red/10 flex items-center justify-center text-app-red">
            <Volume2 className="w-8 h-8" />
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-medium mb-3">Master Your Communication</h2>
          <p className="text-gray-600 mb-4">
            DialogIQ helps you practice conversations, receive real-time feedback, 
            and improve your communication skills through AI-powered analysis.
          </p>
          <ul className="text-left space-y-2 mb-4">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
              <span>Learn by doing mistakes</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
              <span>Get personalized feedback on every conversation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-app-green mr-2 mt-0.5" />
              <span>Track your improvement over time</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="w-20"></div>
        <Button variant="default" onClick={onNext} className="w-full">
          Get Started
        </Button>
      </div>
    </>
  );
};
