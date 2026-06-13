import type { CapacitorConfig } from '@capacitor/cli';

const LOCATION_DESC =
  'TimeWarp yakınındaki tarihi yerleri göstermek için konumunuza ihtiyaç duyar';

const config: CapacitorConfig = {
  appId: 'com.umrem.app',
  appName: 'Umrem',
  webDir: 'dist/timewarp/browser',

  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#1a7a4a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },

  ios: {
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_DESC,
      NSLocationAlwaysUsageDescription: LOCATION_DESC,
    },
  } as any,
};

export default config;
