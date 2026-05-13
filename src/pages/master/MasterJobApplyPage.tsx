import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Send, ImagePlus, X, ChevronLeft, Loader2, CheckCircle2, Plus, Trash2, Clock } from 'lucide-react';
import { useJobByIdQuery, useJobApplyMutation, useMasterMyApplicationsQuery } from '@/features/jobs/jobsApi';
import { useJointsBalanceQuery } from '@/features/joints/jointsApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { cn } from '@/lib/utils';
import type { ApplicationPaymentType, MilestoneDto } from '@/types';
import toast from 'react-hot-toast';

const emptyMilestone = (): MilestoneDto => ({
  title: '',
  description: '',
  price: 0,
  dueDate: '',
});

export default function MasterJobApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  const { data: job, isLoading: jobLoading } = useJobByIdQuery({ id: id! }, { skip: !id });
  const { data: balanceData } = useJointsBalanceQuery(undefined, { skip: !isMaster });
  const { data: myApps } = useMasterMyApplicationsQuery(undefined, { skip: !isMaster });
  const [apply, { isLoading }] = useJobApplyMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, previews, pickFiles, upload, removeFile, isUploading } = useFileUpload({ maxFiles: 5, forLead: true });

  const [joints, setJoints] = useState(job?.minJoints ?? 5);
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<ApplicationPaymentType>('FULL');
  const [deadline, setDeadline] = useState<string>('');
  const [milestones, setMilestones] = useState<MilestoneDto[]>([emptyMilestone()]);

  const balance = balanceData?.balance ?? 0;
  const minJoints = job?.minJoints ?? 1;
  const alreadyApplied = (myApps?.items ?? []).some((a) => a.jobId === id);

  const updateMilestone = (i: number, patch: Partial<MilestoneDto>) => {
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  };
  const addMilestone = () => setMilestones((prev) => [...prev, emptyMilestone()]);
  const removeMilestone = (i: number) => setMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (joints < minJoints) { toast.error(t('jobs.minJointsRequired', { n: minJoints })); return; }
    if (joints > balance) { toast.error(t('jobs.insufficientJoints')); return; }
    if (!description.trim()) { toast.error(t('jobs.writeCoverLetter')); return; }

    if (paymentType === 'FULL' && !deadline) {
      toast.error(t('jobs.deadlineRequired', 'Please enter the completion time'));
      return;
    }
    if (paymentType === 'PARTIAL') {
      const invalid = milestones.some((m) => !m.title.trim() || !m.dueDate || m.price <= 0);
      if (invalid) { toast.error(t('jobs.milestonesInvalid', 'Fill in all milestone fields')); return; }
    }

    let photoFileIds: string[] | undefined;
    if (files.length > 0) {
      const uploaded = await upload();
      if (!uploaded) { toast.error(t('jobs.applyError')); return; }
      photoFileIds = uploaded.map((f) => f.id);
    }

    try {
      await apply({
        jobId: id,
        body: {
          jointsSpent: joints,
          description,
          paymentType,
          deadline: paymentType === 'FULL' && deadline ? Number(deadline) : undefined,
          milestones: paymentType === 'PARTIAL' ? milestones : undefined,
          photoFileIds,
        },
      }).unwrap();
      toast.success(t('jobs.appliedSuccess'));
      navigate('/dashboard/jobs/applications');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg ?? t('jobs.applyError'));
    }
  };

  if (!isAuthed || !isMaster) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{t('jobs.mastersOnly')}</p>
        <Button className="mt-4" onClick={() => navigate(paths.login)}>{t('jobs.logIn')}</Button>
      </div>
    );
  }

  if (jobLoading) return (
    <div className="flex justify-center pt-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" /></div>
  );

  if (!job) return null;

  if (job.status !== 'OPEN') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{t('jobs.notAccepting')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>{t('jobs.back')}</Button>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <p className="text-sm font-semibold text-foreground">{t('jobs.alreadyApplied')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('jobs.proposalSubmitted')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>{t('jobs.back')}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        to="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />{t('jobs.back')}
      </Link>

      {/* Job summary */}
      <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground leading-snug">{job.title}</h2>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly')}</span>
          {job.budget != null && <span className="font-medium text-foreground">{job.budget} MDL</span>}
          {job.hourlyRate != null && <span className="font-medium text-foreground">{job.hourlyRate} MDL/h</span>}
          <span className="flex items-center gap-0.5 text-amber-600 font-medium">
            <Zap className="h-3 w-3" />{t('jobs.minJointsLabel')}: {job.minJoints}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Joints */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <label className="mb-3 block text-sm font-semibold text-foreground">{t('jobs.jointsToBid')}</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={minJoints}
              max={balance}
              value={joints}
              onChange={(e) => setJoints(Math.max(minJoints, Number(e.target.value)))}
              className="w-28 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30"
            />
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>{t('jobs.yourBalance')}: <span className="font-semibold text-foreground">{balance}</span></p>
              <p>{t('jobs.minLabel')}: <span className="font-semibold text-foreground">{minJoints}</span></p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground/60">{t('jobs.boostHint')}</p>
        </div>

        {/* Cover letter */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <label className="mb-3 block text-sm font-semibold text-foreground">{t('jobs.coverLetter')}</label>
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('jobs.coverLetterPlaceholder')}
          />
        </div>

        {/* Payment type */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">{t('jobs.paymentApproach')}</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'FULL' as const, label: t('jobs.fullPayment'), hint: t('jobs.fullPaymentHint') },
              { value: 'PARTIAL' as const, label: t('jobs.partialPayment'), hint: t('jobs.partialPaymentHint') },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentType(opt.value)}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all',
                  paymentType === opt.value
                    ? 'border-amber-500/40 bg-amber-500/5 shadow-sm'
                    : 'border-black/5 dark:border-white/5 hover:border-amber-500/20',
                )}
              >
                <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground">{opt.hint}</span>
              </button>
            ))}
          </div>

          {/* FULL: deadline */}
          {paymentType === 'FULL' && (
            <div className="mt-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {t('jobs.deadlineDays', 'Completion time (days)')}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder={t('jobs.deadlinePlaceholder', 'e.g. 7')}
                className="w-32 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          {/* PARTIAL: milestones */}
          {paymentType === 'PARTIAL' && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">{t('jobs.milestones', 'Milestones')}</p>
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5">
                  <span className="shrink-0 w-4 text-center text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(i, { title: e.target.value })}
                    placeholder={t('jobs.milestoneTitle', 'Task title')}
                    maxLength={200}
                    className="flex-1 min-w-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    type="number"
                    min={1}
                    value={m.price || ''}
                    onChange={(e) => updateMilestone(i, { price: Number(e.target.value) })}
                    placeholder="MDL"
                    className="w-24 shrink-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    type="date"
                    value={m.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateMilestone(i, { dueDate: e.target.value })}
                    className="w-36 shrink-0 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {milestones.length > 1 && (
                    <button type="button" onClick={() => removeMilestone(i)} className="shrink-0 text-red-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addMilestone}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 py-3 text-xs text-muted-foreground hover:border-amber-500/40 hover:text-amber-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('jobs.addMilestone', 'Add milestone')}
              </button>

              {/* Budget summary */}
              {job.budget != null && (() => {
                const total = milestones.reduce((s, m) => s + (m.price || 0), 0);
                const remaining = job.budget - total;
                const over = remaining < 0;
                return (
                  <div className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-2.5 text-xs',
                    over
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground',
                  )}>
                    <span>
                      {t('jobs.milestonesTotal', 'Total')}: <span className="font-semibold text-foreground">{total} MDL</span>
                    </span>
                    <span>
                      {t('jobs.budget', 'Budget')}: <span className="font-semibold text-foreground">{job.budget} MDL</span>
                      {' · '}
                      {over
                        ? <span className="font-semibold text-red-600 dark:text-red-400">−{Math.abs(remaining)} MDL {t('jobs.overBudget', 'over budget')}</span>
                        : <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{remaining} MDL {t('jobs.remaining', 'remaining')}</span>
                      }
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {t('jobs.attachedPhotos')} <span className="text-xs font-normal text-muted-foreground">({t('common.optional', 'optional')})</span>
          </p>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && pickFiles(e.target.files)} />
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 text-muted-foreground/50 hover:border-amber-500/40 hover:text-amber-500 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">{t('jobs.addPhotos')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          {isLoading || isUploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
          {t('jobs.submitJoints', { joints })}
        </Button>
      </form>
    </div>
  );
}
