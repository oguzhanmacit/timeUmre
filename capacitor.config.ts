import type { CapacitorConfig } from '@capacitor/cli';

const LOCATION_DESC =
  'TimeWarp yakınındaki tarihi yerleri göstermek için konumunuza ihtiyaç duyar';

const config: CapacitorConfig = {
  appId: 'com.umrem.app',
  appName: 'Umrem',
  webDir: 'dist/timewarp/browser',

  plugins: {
    FirebaseAuthentication: {
      // Native katman da oturum açar (google-services.json gerektirir); JS SDK'ya
      // credential köprüsü auth.service.ts'de kurulu (signInWithCredential).
      skipNativeAuth: false,
      providers: ['google.com', 'phone'],
    },
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
