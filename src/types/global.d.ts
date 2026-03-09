export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    grecaptcha?: {
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
    __MASTER_HUB_ENV__?: Partial<{
      apiUrl: string;
      wsUrl: string;
      envName: string;
      useHttpOnly: boolean;
    }>;
    _lastNotifSave?: number;
  }
}

