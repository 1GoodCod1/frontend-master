export interface VerificationData {
  isVerified?: boolean;
  pendingVerification?: boolean;
  verification?: {
    status?: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    phoneVerified?: boolean;
    submittedAt?: string;
    notes?: string;
    documentFront?: { url?: string; path?: string };
    documentBack?: { url?: string; path?: string };
    selfie?: { url?: string; path?: string };
  };
}
