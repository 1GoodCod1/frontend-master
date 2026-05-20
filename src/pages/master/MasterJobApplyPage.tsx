import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, ChevronLeft, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { JointsBadge } from '@/components/joints';
import { useJobByIdQuery, useJobMyApplicationQuery } from '@/features/jobs/jobsApi';
import { useJointsBalanceQuery } from '@/features/joints/jointsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { useApplyJobForm } from '@/hooks/jobs';
import { JobApplyJointsBid } from '@/features/jobs/components/JobApplyJointsBid';
import { JobApplyPaymentApproach } from '@/features/jobs/components/JobApplyPaymentApproach';
import { JobApplyMilestones } from '@/features/jobs/components/JobApplyMilestones';
import { JobPhotosUpload } from '@/features/jobs/components/JobPhotosUpload';
import { cn } from '@/lib/utils';
import {
  masterLinkCls,
  masterPageNarrowClassName,
  masterPrimaryBtnCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

export default function MasterJobApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  const { data: job, isLoading: jobLoading } = useJobByIdQuery({ id: id! }, { skip: !id });
  const { data: balanceData } = useJointsBalanceQuery(undefined, { skip: !isMaster });
  const { data: myApp } = useJobMyApplicationQuery({ jobId: id! }, { skip: !id || !isMaster });

  const balance = balanceData?.balance ?? 0;
  const minJoints = job?.minJoints ?? 1;
  const alreadyApplied = myApp?.applied ?? false;

  const {
    joints, setJoints,
    description, setDescription,
    paymentType, setPaymentType,
    deadline, setDeadline,
    milestones,
    updateMilestone, addMilestone, removeMilestone,
    handleSubmit,
    isLoading,
    files, previews, pickFiles, removeFile, isUploading
  } = useApplyJobForm(id!, minJoints, balance);

  if (!isAuthed || !isMaster) {
    return (
      <div className={cn(masterPageNarrowClassName, 'py-20 text-center')}>
        <p className={masterTextMuted}>{t('jobs.mastersOnly')}</p>
        <Button className={cn(masterPrimaryBtnCls, 'mt-4')} onClick={() => navigate(paths.login)}>{t('jobs.logIn')}</Button>
      </div>
    );
  }

  if (jobLoading) return (
    <div className="flex justify-center pt-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" /></div>
  );

  if (!job) return null;

  if (job.status !== 'OPEN') {
    return (
      <div className={cn(masterPageNarrowClassName, 'py-20 text-center')}>
        <p className={masterTextMuted}>{t('jobs.notAccepting')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>{t('jobs.back')}</Button>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className={cn(masterPageNarrowClassName, 'py-20 text-center')}>
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <p className="text-sm font-semibold text-foreground">{t('jobs.alreadyApplied')}</p>
        <p className={cn('mt-1', masterTextMuted)}>{t('jobs.proposalSubmitted')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>{t('jobs.back')}</Button>
      </div>
    );
  }

  return (
    <div className={masterPageNarrowClassName}>
      <Link
        to="/jobs"
        className={cn('mb-6 inline-flex items-center gap-1.5 text-sm transition-colors', masterLinkCls)}
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
          <JointsBadge value={job.minJoints} size="xs" prefix={t('jobs.minJointsLabel')} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Joints */}
        <JobApplyJointsBid joints={joints} setJoints={setJoints} minJoints={minJoints} balance={balance} />

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

        {/* Payment approach */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <JobApplyPaymentApproach value={paymentType} onChange={setPaymentType} />

          {/* FULL: deadline */}
          {paymentType === 'FULL' && (
            <div className="mt-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-[#E97525]" />
                {t('jobs.deadlineDays', 'Completion time (days)')}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder={t('jobs.deadlinePlaceholder', 'e.g. 7')}
                className="w-32 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E97525]/20"
              />
            </div>
          )}

          {/* PARTIAL: milestones */}
          {paymentType === 'PARTIAL' && (
            <JobApplyMilestones
              milestones={milestones}
              updateMilestone={updateMilestone}
              addMilestone={addMilestone}
              removeMilestone={removeMilestone}
              jobBudget={job.budget}
            />
          )}
        </div>

        {/* Photos */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {t('jobs.attachedPhotos')} <span className="text-xs font-normal text-muted-foreground">({t('common.optional', 'optional')})</span>
          </p>
          <JobPhotosUpload
            files={files}
            previews={previews}
            pickFiles={pickFiles}
            removeFile={removeFile}
            maxFiles={5}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full h-12 gap-2 bg-[#E97525] hover:bg-[#d86920] text-white font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          {isLoading || isUploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
          {t('jobs.submitJoints', { joints: joints ?? minJoints })}
        </Button>
      </form>
    </div>
  );
}
