import { useTranslation } from 'react-i18next';
import { JointsBadge } from '@/components/joints';
import { cn } from '@/lib/utils';
import { masterCardStaticCls, masterTextMuted } from '@/lib/masterCabinetStyles';

interface JobApplyJointsBidProps {
  joints: number | null;
  setJoints: (val: number) => void;
  minJoints: number;
  balance: number;
}

export function JobApplyJointsBid({ joints, setJoints, minJoints, balance }: JobApplyJointsBidProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(masterCardStaticCls, 'px-5 py-5')}>
      <label className="mb-3 block text-sm font-semibold text-[#212529] dark:text-white">
        {t('jobs.jointsToBid')}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="number"
          min={minJoints}
          max={balance}
          value={joints ?? ''}
          onChange={(e) => setJoints(Math.max(minJoints, Number(e.target.value)))}
          className="w-28 rounded-[12px] border border-[#E9ECEF] bg-white px-3 py-2 text-sm font-semibold text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#E97525]/20 focus:border-[#E97525]/45 dark:border-white/12 dark:bg-white/[0.04] dark:text-white"
        />
        <div className="flex flex-wrap items-center gap-2">
          <JointsBadge value={balance} size="sm" showLabel />
          <JointsBadge value={minJoints} size="xs" prefix={t('jobs.minLabel')} />
        </div>
      </div>
      <p className={cn('mt-2', masterTextMuted)}>{t('jobs.boostHint')}</p>
    </div>
  );
}
