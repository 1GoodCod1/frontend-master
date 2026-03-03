import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { useLeadsCreateMutation } from '@/features/leads/leadsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { useNavigate } from 'react-router-dom';
import type { CreateLeadDto } from '@/types';

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

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

function toErrorMessage(e: unknown): string {
    if (!isRecord(e)) return 'Failed to send lead';
    const data = isRecord(e.data) ? e.data : undefined;
    const msg =
        (typeof data?.message === 'string' ? data.message : undefined) ??
        (typeof e.message === 'string' ? e.message : undefined);
    return msg ?? 'Failed to send lead';
}

export function useLeadSubmission(masterId: string | undefined, isAuthed: boolean, role: string | null): LeadSubmissionState {
    const navigate = useNavigate();
    const [attach, setAttach] = useState<File[]>([]);
    const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
    // const [premiumSessionId, setPremiumSessionId] = useState<string | null>(null); // PREMIUM LEAD: commented out

    const [uploadMany] = useFilesUploadManyMutation();
    const [createLead, { isLoading }] = useLeadsCreateMutation();

    const handleSendLead = async (formData: LeadSubmissionFormData) => {
        if (!isAuthed || role !== 'CLIENT') {
            toast.error('Only authorized clients can send leads. Please register or log in.');
            navigate('/register');
            return;
        }
        if (!masterId) {
            toast.error('Master is not loaded yet.');
            return;
        }

        try {
            let fileIds: string[] = [];
            if (attach.length) {
                const up = await uploadMany({
                    files: attach,
                    forLead: true,
                }).unwrap();
                const items = up?.items ?? [];
                fileIds = (Array.isArray(items) ? items : [])
                    .map((x) =>
                        x && typeof x === 'object' && 'id' in x ? String((x as { id?: unknown }).id ?? '') : ''
                    )
                    .filter(Boolean);
            }

            const payload: CreateLeadDto = {
              masterId,
              clientName: formData.clientName?.trim() || undefined,
              message: formData.message || '',
              fileIds,
              // premiumPaymentSessionId: premiumSessionId || undefined, // PREMIUM LEAD: commented out
            };

            const result = await createLead(payload).unwrap();
            const lead = result as { encodedId?: string; id?: string };
            setSubmittedLeadId(lead?.encodedId ?? lead?.id ?? null);
            toast.success('Lead sent');

            setAttach([]);
            // setPremiumSessionId(null); // PREMIUM LEAD: commented out
        } catch (e: unknown) {
            toast.error(toErrorMessage(e));
        }
    };

    const resetSubmittedLead = () => {
        setSubmittedLeadId(null);
    };

    return {
        attach,
        setAttach,
        // premiumSessionId, setPremiumSessionId, // PREMIUM LEAD: commented out
        handleSendLead,
        isLoading,
        submittedLeadId,
        resetSubmittedLead,
    };
}
