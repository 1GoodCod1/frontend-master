export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    grecaptcha?: {
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
    __MOLDMASTERS_ENV__?: Partial<{
      apiUrl: string;
      wsUrl: string;
      envName: string;
      useHttpOnly: boolean;
    }>;
    __REACT_APP_API_URL__?: string;
    __REACT_APP_WS_URL__?: string;
    _lastNotifSave?: number;
  }
}

