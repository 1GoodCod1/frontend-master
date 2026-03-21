import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLeadsCreateMutation } from '@/features/leads/leadsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CreateLeadDto } from '@/types';
import { toErrorMessage } from '@/utils/errors';
import type { LeadSubmissionFormData, LeadSubmissionState } from '.';

export function useLeadSubmission(masterId: string | undefined, isAuthed: boolean, role: string | null): LeadSubmissionState {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [attach, setAttach] = useState<File[]>([]);
    const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);


    const [uploadMany] = useFilesUploadManyMutation();
    const [createLead, { isLoading }] = useLeadsCreateMutation();

    const handleSendLead = async (formData: LeadSubmissionFormData) => {
        if (!isAuthed || role !== 'CLIENT') {
            toast.error(t('common.actionRequiresClient', 'Only authorized clients can send requests. Please register or log in.'));
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
            };

            const result = await createLead(payload).unwrap();
            const lead = result as { encodedId?: string; id?: string };
            // Use short UUID for lead-success URL; encodedId is too long (~120+ chars)
            const resolvedLeadId = lead?.id ?? lead?.encodedId ?? null;
            setSubmittedLeadId(resolvedLeadId);
            toast.success(t('notifications.types.lead_sent', 'Request sent'));

            setAttach([]);
            // Navigate to the lead success page for full post-lead UX
            if (resolvedLeadId) {
                navigate(`/client-dashboard/lead-success/${resolvedLeadId}`);
            }
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('common.errorGeneric', 'Failed to send request'));
        }
    };

    const resetSubmittedLead = () => {
        setSubmittedLeadId(null);
    };

    return {
        attach,
        setAttach,
        handleSendLead,
        isLoading,
        submittedLeadId,
        resetSubmittedLead,
    };
}
