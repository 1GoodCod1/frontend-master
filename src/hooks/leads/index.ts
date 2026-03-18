import type { Dispatch, SetStateAction } from 'react';

export type LeadSubmissionFormData = {
  message: string;
  clientName?: string;
};

export type LeadSubmissionState = {
  attach: File[];
  setAttach: Dispatch<SetStateAction<File[]>>;
  handleSendLead: (formData: LeadSubmissionFormData) => Promise<void>;
  isLoading: boolean;
  submittedLeadId: string | null;
  resetSubmittedLead: () => void;
};

export { useLeadSubmission } from './useLeadSubmission';
