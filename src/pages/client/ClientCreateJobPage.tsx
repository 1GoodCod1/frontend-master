import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X, MapPin, Zap, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobsCreateMutation } from '@/features/jobs/jobsApi';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getTranslatedCityName } from '@/utils/translateCityCategory';
import { cn } from '@/lib/utils';
import type { CreateJobDto, JobType } from '@/types';
import toast from 'react-hot-toast';

export default function ClientCreateJobPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [create, { isLoading }] = useJobsCreateMutation();
  const { data: cities = [] } = useCitiesListQuery({ isActive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, previews, pickFiles, upload, removeFile, isUploading } = useFileUpload({ maxFiles: 10, forLead: true });

  const [form, setForm] = useState<Omit<CreateJobDto, 'photoFileIds'>>({
    title: '',
    description: '',
    type: 'FIXED_PRICE' as JobType,
    budget: undefined,
    hourlyRate: undefined,
    minJoints: 5,
    cityId: undefined,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'budget' || name === 'hourlyRate' || name === 'minJoints'
        ? value === '' ? undefined : Number(value)
        : value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error(t('jobs.titleDescRequired', 'Title and description are required'));
      return;
    }
    try {
      let photoFileIds: string[] | undefined;
      if (files.length > 0) {
        const uploaded = await upload();
        if (!uploaded) return;
        photoFileIds = uploaded.map((f) => f.id);
      }
      const job = await create({ ...form, photoFileIds }).unwrap();
      toast.success(t('jobs.created', 'Job posted successfully!'));
      navigate(`/client-dashboard/jobs/${job.id}`);
    } catch {
      toast.error(t('jobs.createError', 'Failed to create job posting'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t('jobs.postJob', 'Post a Job')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('jobs.postJobSubtitle', 'Describe your project and find the perfect master')}
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-semibold text-foreground">
            {t('jobs.title', 'Job Title')}
          </Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={t('jobs.titlePlaceholder', 'e.g. Fix kitchen sink')}
            maxLength={200}
            required
            className="h-10"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-semibold text-foreground">
            {t('jobs.description', 'Description')}
          </Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('jobs.descriptionPlaceholder', 'Describe what you need done, requirements, timeline...')}
            rows={5}
            maxLength={3000}
            required
            className="resize-none"
          />
        </div>

        {/* Payment type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">
            {t('jobs.type', 'Payment Type')}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {(['FIXED_PRICE', 'HOURLY'] as JobType[]).map((type) => {
              const isActive = form.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type }))}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200',
                    isActive
                      ? 'border-amber-500 bg-amber-500/8 shadow-md shadow-amber-500/10'
                      : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-sm',
                  )}
                >
                  <div className={cn(
                    'mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-500',
                  )}>
                    {type === 'FIXED_PRICE'
                      ? <DollarSign className="h-4 w-4" />
                      : <Clock className="h-4 w-4" />}
                  </div>
                  <p className={cn(
                    'text-sm font-semibold transition-colors',
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-foreground',
                  )}>
                    {type === 'FIXED_PRICE'
                      ? t('jobs.fixedPrice', 'Fixed Price')
                      : t('jobs.hourlyRate', 'Hourly Rate')}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {type === 'FIXED_PRICE'
                      ? t('jobs.fixedPriceDesc', 'Set amount for the whole project')
                      : t('jobs.hourlyRateDesc', 'Pay per hour of work')}
                  </p>
                  {isActive && (
                    <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget / hourly rate */}
        <div className="space-y-1.5">
          <Label
            htmlFor={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
            className="text-sm font-semibold text-foreground"
          >
            {form.type === 'FIXED_PRICE'
              ? t('jobs.budget', 'Budget (MDL)')
              : t('jobs.hourlyRateLabel', 'Hourly Rate (MDL/h)')}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
              name={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
              type="number"
              min={1}
              value={form.type === 'FIXED_PRICE' ? (form.budget ?? '') : (form.hourlyRate ?? '')}
              onChange={handleChange}
              placeholder={form.type === 'FIXED_PRICE' ? '500' : '100'}
              className="h-10 pl-9"
            />
          </div>
        </div>

        {/* Min joints */}
        <div className="space-y-1.5">
          <Label htmlFor="minJoints" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {t('jobs.minJoints', 'Minimum Joints to Apply')}
            <span className="text-xs font-normal text-muted-foreground">
              {t('jobs.minJointsHint', '(Masters spend joints to rank higher)')}
            </span>
          </Label>
          <Input
            id="minJoints"
            name="minJoints"
            type="number"
            min={1}
            max={500}
            value={form.minJoints}
            onChange={handleChange}
            required
            className="h-10"
          />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="cityId" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {t('jobs.city', 'City')}
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Select
            value={form.cityId ?? ''}
            onValueChange={(v) => setForm((f) => ({ ...f, cityId: v || undefined }))}
          >
            <SelectTrigger id="cityId">
              <SelectValue placeholder={t('jobs.anyCity', 'Any location')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('jobs.anyCity', 'Any location')}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {getTranslatedCityName(t, city) || city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">
            {t('jobs.photos', 'Photos')}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional, up to 10)</span>
          </Label>
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {files.length < 10 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) { pickFiles(e.target.files); e.target.value = ''; } }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <ImagePlus className="h-4 w-4" />
                {t('jobs.addPhotos', 'Add photos')}
              </button>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            size="lg"
            className="w-full rounded-xl bg-amber-600 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-700 hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading || isUploading
              ? t('common.saving', 'Posting...')
              : t('jobs.postJob', 'Post a Job')}
          </Button>
        </div>
      </form>
    </div>
  );
}
