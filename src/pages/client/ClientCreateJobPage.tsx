import { useTranslation } from 'react-i18next';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import { JointsMark } from '@/components/joints';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import { useCategoriesListQuery } from '@/features/categories/categoriesApi';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { useCreateJobForm } from '@/hooks/jobs';
import { JobPaymentTypeSelector } from '@/features/jobs/components/JobPaymentTypeSelector';
import { JobPhotosUpload } from '@/features/jobs/components/JobPhotosUpload';
import { cn } from '@/lib/utils';
import {
  clientFormCardCls,
  clientFormLabelCls,
  clientInputCls,
  clientPageClassName,
  clientPrimaryBtnCls,
  clientSelectTriggerCls,
  clientTextareaCls,
  clientTextMuted,
} from '@/lib/clientCabinetStyles';

export default function ClientCreateJobPage() {
  const { t, i18n } = useTranslation();
  const { data: cities = [] } = useCitiesListQuery({ isActive: true });
  const { data: categories = [] } = useCategoriesListQuery({ isActive: true });

  const {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isLoading,
    files,
    previews,
    pickFiles,
    removeFile,
    isUploading,
  } = useCreateJobForm();

  return (
    <div className={clientPageClassName}>
      <PageHeader
        title={t('jobs.postJob', 'Post a Job')}
        subtitle={t('jobs.postJobSubtitle', 'Describe your project and find the perfect master')}
      />

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className={cn(clientFormCardCls, 'mx-auto max-w-2xl space-y-5')}
      >
        <div className="space-y-1.5">
          <Label htmlFor="title" className={clientFormLabelCls}>
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
            className={clientInputCls}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className={clientFormLabelCls}>
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
            className={clientTextareaCls}
          />
        </div>

        <JobPaymentTypeSelector value={form.type} onChange={(type) => setForm((p) => ({ ...p, type }))} />

        <div className="space-y-1.5">
          <Label
            htmlFor={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
            className={clientFormLabelCls}
          >
            {form.type === 'FIXED_PRICE'
              ? t('jobs.budget', 'Budget (MDL)')
              : t('jobs.hourlyRateLabel', 'Hourly Rate (MDL/h)')}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C757D]" />
            <Input
              id={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
              name={form.type === 'FIXED_PRICE' ? 'budget' : 'hourlyRate'}
              type="number"
              min={1}
              value={form.type === 'FIXED_PRICE' ? (form.budget ?? '') : (form.hourlyRate ?? '')}
              onChange={handleChange}
              placeholder={form.type === 'FIXED_PRICE' ? '500' : '100'}
              className={cn(clientInputCls, 'pl-9')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minJoints" className={cn('flex flex-wrap items-center gap-2', clientFormLabelCls)}>
            <JointsMark className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
            {t('jobs.minJoints', 'Minimum Joints to Apply')}
            <span className={cn('font-normal', clientTextMuted)}>
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
            className={clientInputCls}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId" className={cn('flex items-center gap-2', clientFormLabelCls)}>
            <Briefcase className="h-3.5 w-3.5 text-[#6C757D]" />
            {t('jobs.category', 'Category')}
            <span className="text-[#E97525]">*</span>
          </Label>
          <Select value={form.categoryId || ''} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
            <SelectTrigger id="categoryId" className={clientSelectTriggerCls}>
              <SelectValue placeholder={t('jobs.selectCategory', 'Select category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {getTranslatedCategoryName(t, cat, i18n.language) || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={clientTextMuted}>
            {t('jobs.categoryHint', { defaultValue: 'Specialiștii din această categorie vor vedea jobul mai sus în "Best matches".' })}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cityId" className={cn('flex items-center gap-2', clientFormLabelCls)}>
            <MapPin className="h-3.5 w-3.5 text-[#6C757D]" />
            {t('jobs.city', 'City')}
            <span className={cn('font-normal', clientTextMuted)}>(optional)</span>
          </Label>
          <Select value={form.cityId ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, cityId: v || undefined }))}>
            <SelectTrigger id="cityId" className={clientSelectTriggerCls}>
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

        <JobPhotosUpload files={files} previews={previews} pickFiles={pickFiles} removeFile={removeFile} maxFiles={10} />

        <div className="border-t border-[#E9ECEF] pt-4 dark:border-white/10">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className={cn(clientPrimaryBtnCls, 'h-11 w-full disabled:opacity-60')}
          >
            {isLoading || isUploading ? t('common.saving', 'Posting...') : t('jobs.postJob', 'Post a Job')}
          </Button>
        </div>
      </form>
    </div>
  );
}
