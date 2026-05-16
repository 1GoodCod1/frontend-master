import { useTranslation } from 'react-i18next';
import { MapPin, Zap, DollarSign, Briefcase } from 'lucide-react';
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
    isUploading
  } = useCreateJobForm();

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
        <JobPaymentTypeSelector
          value={form.type}
          onChange={(type) => setForm(p => ({ ...p, type }))}
        />

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

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="categoryId" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            {t('jobs.category', 'Category')}
            <span className="text-xs font-normal text-rose-500">*</span>
          </Label>
          <Select
            value={form.categoryId || ''}
            onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
          >
            <SelectTrigger id="categoryId">
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
          <p className="text-xs text-muted-foreground mt-1">
            {t('jobs.categoryHint', { defaultValue: 'Specialiștii din această categorie vor vedea jobul mai sus în "Best matches".' })}
          </p>
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
        <JobPhotosUpload
          files={files}
          previews={previews}
          pickFiles={pickFiles}
          removeFile={removeFile}
          maxFiles={10}
        />

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
