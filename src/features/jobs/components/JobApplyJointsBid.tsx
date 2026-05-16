import { useTranslation } from 'react-i18next';

interface JobApplyJointsBidProps {
  joints: number | null;
  setJoints: (val: number) => void;
  minJoints: number;
  balance: number;
}

export function JobApplyJointsBid({ joints, setJoints, minJoints, balance }: JobApplyJointsBidProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-5 py-5 shadow-sm">
      <label className="mb-3 block text-sm font-semibold text-foreground">{t('jobs.jointsToBid')}</label>
      <div className="flex items-center gap-4">
        <input
          type="number"
          min={minJoints}
          max={balance}
          value={joints ?? ''}
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
  );
}
