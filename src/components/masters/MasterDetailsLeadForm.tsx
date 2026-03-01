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
import { useLeadsSubscribeToAvailabilityMutation, useLeadsActiveToMasterQuery } from '@/features/leads/leadsApi';
import { useCreateConversationMutation, useGetConversationByLeadIdQuery } from '@/features/chat/chatApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LeadSubmissionState } from '@/hooks/leads/useLeadSubmission';

interface MasterDetailsLeadFormProps {
  isAuthed: boolean;
  role: string | null;
  masterId: string;
  fullName: string;
  leadSubmission: LeadSubmissionState;
  isMasterAvailable: boolean;
  availabilityStatus: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const data = isRecord(error.data) ? error.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof error.message === 'string' ? error.message : undefined)
  );
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
  const [subscribed, setSubscribed] = useState(false);

  const { attach, setAttach, handleSendLead, isLoading: isSubmitting, submittedLeadId } = leadSubmission;

  const [message, setMessage] = useState('');

  const userId = useAppSelector((state) => state.auth.me?.id ?? '');
  const { data: activeLeadData } = useLeadsActiveToMasterQuery(
    { masterId, userId },
    { skip: !isAuthed || role !== 'CLIENT' || !userId },
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
      setSubscribed(true);
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
      toast.error(toErrorMessage(error) ?? 'Не удалось открыть чат');
    }
  };

  if (activeLead && !submittedLeadId) {
    return (
      <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] relative overflow-hidden shadow-xl shadow-amber-900/20 dark:shadow-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80" />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">У вас есть активная заявка</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Вы уже отправили заявку этому мастеру. Дождитесь её завершения, прежде чем отправлять новую.
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500" onClick={handleOpenActiveChat} disabled={isCreatingChat}>
              {isCreatingChat ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Перейти в чат с мастером
            </Button>
            <Button variant="outline" size="lg" className="w-full font-semibold border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 hover:bg-amber-50/80 dark:hover:bg-amber-500/10" onClick={() => navigate('/client-dashboard/leads')}>
              Мои заявки
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submittedLeadId) {
    return (
      <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] relative overflow-hidden shadow-xl shadow-amber-900/20 dark:shadow-none">
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
            <Button size="lg" className="w-full gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500" onClick={() => navigate(`/client-dashboard/leads/${submittedLeadId}/book`)}>
              <CalendarDays className="h-4 w-4" />
              {t('masterDetails.chooseTime', 'Выбрать время')}
            </Button>
            <Button size="lg" variant="outline" className="w-full gap-2 font-semibold border-[#f5f4eb] dark:border-white/10 hover:border-amber-500/40 hover:bg-amber-50/80 dark:hover:bg-amber-500/10" onClick={handleOpenChat} disabled={isCreatingChat}>
              {isCreatingChat ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {t('masterDetails.openChat', 'Открыть чат с мастером')}
            </Button>
            <Button variant="outline" size="lg" className="w-full font-semibold border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 hover:bg-amber-50/80 dark:hover:bg-amber-500/10" onClick={() => navigate('/client-dashboard/leads')}>
              {t('clientDashboard.myLeads', 'Мои заявки')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === 'MASTER') return null;

  if (!isAuthed || role !== 'CLIENT') {
    return (
      <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] relative overflow-hidden shadow-xl shadow-amber-900/20 dark:shadow-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80" />
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-9 w-9" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">{t('masterDetails.becomeClientTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t('masterDetails.becomeClientDesc')}</p>
          <Button size="lg" className="w-full gap-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500" onClick={() => navigate('/register')}>
            {t('masterDetails.registerAsClient')}
            <Send className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] relative overflow-hidden shadow-xl shadow-amber-900/20 dark:shadow-none">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500/80" />
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{t('masterDetails.sendLead')}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t('masterDetails.sendLeadSubtitle')}</p>
        </div>

        {!isMasterAvailable && (
          <Alert className="border-amber-500/40 bg-amber-500/5">
            <AlertDescription>
              <p className="font-semibold text-sm">
                {availabilityStatus === 'BUSY'
                  ? t('masterDetails.masterBusyAlert', 'Master is currently busy')
                  : availabilityStatus === 'OFFLINE'
                    ? t('masterDetails.masterOfflineAlert', 'Master is offline')
                    : t('masterDetails.masterFullAlert', 'Master has reached maximum leads')}
              </p>
              {!subscribed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 gap-1 font-semibold text-foreground"
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                >
                  <Bell className="h-4 w-4" />
                  {t('masterDetails.subscribeNotify', 'Notify me')}
                </Button>
              ) : (
                <p className="text-xs mt-1">✓ {t('masterDetails.subscriptionConfirmed', 'You will be notified when available')}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="lead_message">{t('masterDetails.message')}</Label>
          <Textarea
            id="lead_message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isMasterAvailable}
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2 border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40" disabled={!isMasterAvailable} asChild>
          <label>
            <Paperclip className="h-4 w-4" />
            Attach files (max 10)
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                const remaining = 10 - attach.length;
                if (remaining <= 0) {
                  toast.error('Maximum 10 files allowed');
                  return;
                }
                if (list.length > remaining) {
                  toast(`Only ${remaining} more file(s) can be added.`, { icon: '⚠️', duration: 4000 });
                }
                setAttach([...attach, ...list.slice(0, remaining)]);
                e.target.value = '';
              }}
            />
          </label>
        </Button>

        {attach.length > 0 && (
          <div className="rounded-xl border border-[#f5f4eb] dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-900/15 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{attach.length} file(s) selected</p>
            <ul className="space-y-1">
              {attach.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#f5f4eb] dark:border-white/10 bg-card px-3 py-2"
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
          className="w-full gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500"
          onClick={handleSubmitLead}
          disabled={isSubmitting || !isMasterAvailable || !message.trim()}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? t('masterDetails.sendSending') : t('masterDetails.send')}
        </Button>
      </CardContent>
    </Card>
  );
};
