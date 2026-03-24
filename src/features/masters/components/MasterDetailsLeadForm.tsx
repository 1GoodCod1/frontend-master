import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  Paperclip,
  Trash2,
  Heart,
  Bell,
  Send,
  MessageCircle,
  CheckCircle,
  Clock,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  useLeadsSubscribeToAvailabilityMutation,
  useLeadsActiveToMasterQuery,
  useLeadsCheckAvailabilitySubscriptionQuery,
} from '@/features/leads/leadsApi';
import { useCreateConversationMutation, useGetConversationByLeadIdQuery } from '@/features/chat/chatApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RequestSubmissionState as LeadSubmissionState } from '@/hooks/requests';
import { partitionLeadImageFiles } from '@/utils/leadImageUpload';
import { toErrorMessage } from '@/utils/errors';

interface MasterDetailsLeadFormProps {
  isAuthed: boolean;
  role: string | null;
  masterId: string;
  fullName: string;
  leadSubmission: LeadSubmissionState;
  isMasterAvailable: boolean;
  availabilityStatus: string;
}

export const MasterDetailsLeadForm = ({
  isAuthed,
  role,
  masterId,
  leadSubmission,
  isMasterAvailable,
  availabilityStatus,
}: MasterDetailsLeadFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subscribeToAvailability, { isLoading: isSubscribing }] = useLeadsSubscribeToAvailabilityMutation();

  const { data: subData } = useLeadsCheckAvailabilitySubscriptionQuery(
    { masterId },
    { skip: !isAuthed || role !== 'CLIENT' || !masterId },
  );
  const subscribed = !!subData?.subscribed;

  const { attach, setAttach, handleSendLead, isLoading: isSubmitting, submittedLeadId } = leadSubmission;

  const [message, setMessage] = useState('');

  const userId = useAppSelector((state) => state.auth.me?.id ?? '');
  const { data: activeLeadData } = useLeadsActiveToMasterQuery(
    { masterId, userId },
    {
      skip: !isAuthed || role !== 'CLIENT' || !userId,
      refetchOnMountOrArgChange: true,
    },
  );
  const activeLead = activeLeadData;

  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();
  const { data: existingConversation } = useGetConversationByLeadIdQuery(submittedLeadId || activeLead?.id || '', {
    skip: !submittedLeadId && !activeLead?.id,
  });

  const handleOpenChat = async () => {
    if (!submittedLeadId) return;
    try {
      if (existingConversation) {
        navigate(`/client-dashboard/chat/${existingConversation.id}`);
        return;
      }
      const conversation = await createConversation({ leadId: submittedLeadId }).unwrap();
      navigate(`/client-dashboard/chat/${conversation.id}`);
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? 'Failed to open chat');
    }
  };

  const handleSubmitLead = async () => {
    try {
      await handleSendLead({ message });
      setMessage('');
    } catch {
      // keep form values on error
    }
  };

  const handleSubscribe = async () => {
    try {
      await subscribeToAvailability({ masterId }).unwrap();
      toast.success(t('masterDetails.subscribedToNotifications', 'You will be notified when this master becomes available'));
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? 'Failed to subscribe');
    }
  };

  const handleOpenActiveChat = async () => {
    if (!activeLead?.id) return;
    try {
      if (existingConversation?.id) {
        navigate(`/client-dashboard/chat/${existingConversation.id}`);
        return;
      }
      const conversation = await createConversation({ leadId: activeLead.id }).unwrap();
      navigate(`/client-dashboard/chat/${conversation.id}`);
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? t('masterDetails.chatOpenError', 'Failed to open chat'));
    }
  };

  if (activeLead && !submittedLeadId) {
    return (
      <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] relative overflow-hidden rounded-2xl shadow-sm transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80" />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">{t('masterDetails.activeLeadTitle', 'You have an active request')}</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {t('masterDetails.activeLeadDesc', 'You have already sent a request to this master. Wait for it to complete before sending a new one.')}
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full gap-2 font-semibold " onClick={handleOpenActiveChat} disabled={isCreatingChat}>
              {isCreatingChat ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {t('masterDetails.goToChat', 'Go to chat with master')}
            </Button>
            <Button variant="outline" size="lg" className="w-full font-semibold dark:border-white/10 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10" onClick={() => navigate('/client-dashboard/leads')}>
              {t('clientDashboard.myLeads', 'My requests')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submittedLeadId) {
    return (
      <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] relative overflow-hidden rounded-2xl shadow-sm transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-500/80" />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">
            {t('masterDetails.leadSentTitle', 'Заявка отправлена!')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {t('masterDetails.leadSentDesc', 'Мастер получил вашу заявку. Вы можете начать чат для обсуждения деталей.')}
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full gap-2 font-semibold " onClick={() => navigate(`/client-dashboard/leads/${submittedLeadId}/book`)}>
              <CalendarDays className="h-4 w-4" />
              {t('masterDetails.chooseTime', 'Выбрать время')}
            </Button>
            <Button size="lg" variant="outline" className="w-full gap-2 font-semibold dark:border-white/10 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10" onClick={handleOpenChat} disabled={isCreatingChat}>
              {isCreatingChat ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {t('masterDetails.openChat', 'Открыть чат с мастером')}
            </Button>
            <Button variant="outline" size="lg" className="w-full font-semibold dark:border-white/10 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10" onClick={() => navigate('/client-dashboard/leads')}>
              {t('clientDashboard.myLeads', 'Мои заявки')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === 'MASTER' || role === 'ADMIN') return null;

  if (!isAuthed || role !== 'CLIENT') {
    return (
      <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] relative overflow-hidden rounded-2xl shadow-sm transition-colors duration-300">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <h3 className="font-bold text-white text-lg">{t('masterDetails.orderThisMaster', 'Order this master')}</h3>
          <p className="text-amber-100 text-sm mt-1">{t('masterDetails.becomeClientDesc')}</p>
        </div>
        <CardContent className="p-5 space-y-3 bg-white dark:bg-[hsl(47,22%,9%)]">
          <Button size="lg" className="w-full gap-2 font-semibold " onClick={() => navigate('/register')}>
            <Send className="h-4 w-4" />
            {t('masterDetails.registerAsClient')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border border-gray-200 dark:border-white/20 bg-white text-gray-800 dark:bg-[hsl(47,22%,9%)] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10"
            onClick={() => navigate('/login')}
          >
            {t('masterDetails.alreadyHaveAccount', 'I already have an account — Login')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Master is unavailable (BUSY or at lead limit) ───
  if (!isMasterAvailable) {
    const isBusy = availabilityStatus === 'BUSY';

    return (
      <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] relative overflow-hidden rounded-2xl shadow-sm transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600" />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">
            {isBusy
              ? t('masterDetails.masterBusyTitle', 'Master is busy')
              : t('masterDetails.masterAtLimitTitle', 'Master is at full capacity')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {isBusy
              ? t('masterDetails.masterBusyDesc', 'This master is currently busy and cannot accept new requests. Subscribe to get notified when they become available.')
              : t('masterDetails.masterAtLimitDesc', 'This master has reached the maximum number of active requests. Subscribe to get notified when a spot opens up.')}
          </p>

          {!subscribed ? (
            <Button
              size="lg"
              className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {t('masterDetails.subscribeNotify', 'Notify me when available')}
            </Button>
          ) : (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-950/30 p-4">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-semibold">
                  {t('masterDetails.subscriptionConfirmed', 'You will be notified when available')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] relative overflow-hidden rounded-2xl shadow-sm transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80" />
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{t('masterDetails.sendLead')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t('masterDetails.sendLeadSubtitle')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_message">{t('masterDetails.message')}</Label>
          <Textarea
            id="lead_message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="rounded-xl min-h-[120px] resize-y"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2 border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40" asChild>
          <label>
            <Paperclip className="h-4 w-4" />
            {t('masterDetails.attachPhotos', 'Attach photos (max 10)')}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
              className="hidden"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                const { accepted, rejected } = partitionLeadImageFiles(list);
                if (rejected > 0) {
                  toast.error(t('masterDetails.imagesOnlyError'));
                }
                if (accepted.length === 0) {
                  e.target.value = '';
                  return;
                }
                const remaining = 10 - attach.length;
                if (remaining <= 0) {
                  toast.error(t('masterDetails.maxFilesError', 'Maximum 10 files allowed'));
                  e.target.value = '';
                  return;
                }
                if (accepted.length > remaining) {
                  toast(t('masterDetails.filesLimitWarning', { count: remaining }), { icon: '⚠️', duration: 4000 });
                }
                setAttach([...attach, ...accepted.slice(0, remaining)]);
                e.target.value = '';
              }}
            />
          </label>
        </Button>

        {attach.length > 0 && (
          <div className="rounded-xl border border-[#f5f4eb] dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-900/15 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t('masterDetails.photosSelectedCount', { count: attach.length })}
            </p>
            <ul className="space-y-1">
              {attach.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#f5f4eb] dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2"
                >
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    onClick={() => setAttach(attach.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          size="lg"
          className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all "
          onClick={handleSubmitLead}
          disabled={isSubmitting || !message.trim()}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? t('masterDetails.sendSending') : t('masterDetails.send')}
        </Button>
      </CardContent>
    </Card>
  );
};
