
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.127922a017a44f65aaab1f091b19b1a8',
  appName: 'voice-lens',
  webDir: 'dist',
  server: {
    url: 'https://127922a0-17a4-4f65-aaab-1f091b19b1a8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      spinnerColor: "#007AFF",
    }
  }
};

export default config;
