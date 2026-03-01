import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, MapPin, Briefcase, FileText, Save, ListChecks, Award } from 'lucide-react';
import { useMastersMyProfileQuery, useMastersUpdateMyProfileMutation } from '@/features/masters/mastersApi';
import { useCategoriesListQuery } from '@/features/categories/categoriesApi';
import { useCitiesListQuery } from '@/features/cities/citiesApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import { unwrapList } from '@/utils/data';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { UnsavedChangesPrompt } from '@/hooks/useUnsavedChangesPrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  description: yup.string().optional(),
  cityId: yup.string().optional(),
  categoryId: yup.string().optional(),
  experienceYears: yup.number().min(0).optional(),
});

export default function ProfilePage() {
  const { t } = useTranslation();
  const q = useMastersMyProfileQuery();
  const [update, upd] = useMastersUpdateMyProfileMutation();
  const categoriesQuery = useCategoriesListQuery({ isActive: true });
  const citiesQuery = useCitiesListQuery({ isActive: true });

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;

  const rawProfile = q.data as unknown;
  const profileData: any =
    rawProfile && typeof rawProfile === 'object' && 'data' in rawProfile
      ? (rawProfile as { data?: unknown }).data
      : rawProfile;
  const profileLastEditedAt = profileData?.profileLastEditedAt;

  const now = new Date();
  const lastEditedDate = profileLastEditedAt ? new Date(profileLastEditedAt) : null;
  const wasEdited = lastEditedDate !== null;

  const daysSinceUpdate = lastEditedDate
    ? Math.floor((now.getTime() - lastEditedDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const minDaysBetweenUpdates = 15;

  const isLocked = wasEdited
    && daysSinceUpdate !== null
    && daysSinceUpdate >= 0
    && daysSinceUpdate < minDaysBetweenUpdates;

  const categories = unwrapList(categoriesQuery.data);
  const cities = unwrapList(citiesQuery.data);

  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: getTranslatedCategoryName(t, cat) || cat.name || cat.id,
  }));

  const cityOptions = cities.map((city: any) => ({
    value: city.id,
    label: getTranslatedCityName(t, city) || city.name || city.id,
  }));

  const initial = {
    firstName: profileData?.user?.firstName || '',
    lastName: profileData?.user?.lastName || '',
    cityId: profileData?.cityId || '',
    categoryId: profileData?.categoryId || '',
    experienceYears: profileData?.experienceYears || '',
    description: profileData?.description || '',
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      </div>

      {isLocked && (
        <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
          <AlertDescription className="text-amber-700 dark:text-amber-400 font-medium">
            {t('profile.lockedMessageDays', {
              days: Math.max(0, minDaysBetweenUpdates - (daysSinceUpdate ?? 0)),
              maxPerMonth: 2,
            })}
          </AlertDescription>
        </Alert>
      )}

      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            const payload = {
              firstName: values.firstName,
              lastName: values.lastName,
              description: values.description,
              cityId: values.cityId || undefined,
              categoryId: values.categoryId || undefined,
              experienceYears:
                values.experienceYears === '' || values.experienceYears === null
                  ? undefined
                  : Number(values.experienceYears),
            };
            await update(payload as {
              firstName?: string;
              lastName?: string;
              description?: string;
              cityId?: string;
              categoryId?: string;
              experienceYears?: number;
            }).unwrap();
            toast.success(t('profile.saved'));
            q.refetch();
          } catch (e: unknown) {
            const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
            toast.error((msg as string) || (e instanceof Error ? e.message : t('profile.saveFailed')));
          }
        }}
      >
        {({ handleSubmit, dirty }) => (
          <>
            <UnsavedChangesPrompt when={dirty} message={t('unsaved.leaveConfirm')} />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

              {/* Main Content Column */}
              <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                {/* Basic Info Card */}
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
                  <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
                        <User className="size-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {t('profile.personalInfo')}
                      </h2>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormikTextField name="firstName" label={t('profile.firstName')} disabled={!!isLocked} fullWidth />
                      <FormikTextField name="lastName" label={t('profile.lastName')} disabled={!!isLocked} fullWidth />
                    </div>
                  </CardContent>
                </Card>

                {/* About Me Card */}
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
                  <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-500">
                        <FileText className="size-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {t('profile.description')}
                      </h2>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <FormikTextarea
                      name="description"
                      label={t('profile.description')}
                      rows={8}
                      className="w-full text-base"
                      disabled={!!isLocked}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                {/* Professional Details Card */}
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
                  <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-500">
                        <Award className="size-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {t('profile.professionalDetails')}
                      </h2>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                        <Briefcase className="size-4 text-muted-foreground" />
                        {t('profile.category')}
                      </div>
                      <FormikSelect
                        name="categoryId"
                        label=""
                        options={categoryOptions}
                        disabled={!!isLocked || !!categoriesQuery.isLoading}
                        fullWidth
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                        <MapPin className="size-4 text-muted-foreground" />
                        {t('profile.city')}
                      </div>
                      <FormikSelect
                        name="cityId"
                        label=""
                        options={cityOptions}
                        disabled={!!isLocked || !!citiesQuery.isLoading}
                        fullWidth
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                        <Award className="size-4 text-muted-foreground" />
                        {t('profile.experienceYears')}
                      </div>
                      <FormikTextField
                        name="experienceYears"
                        label=""
                        type="number"
                        disabled={!!isLocked}
                        fullWidth
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions Card */}
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none bg-white dark:bg-black/40 dark:backdrop-blur-xl">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <Button
                      type="submit"
                      disabled={!!isLocked || upd.isLoading}
                      size="lg"
                      className="w-full relative group overflow-hidden border-0 bg-amber-600 text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
                    >
                      <span className="relative flex items-center justify-center font-semibold">
                        <Save className="mr-2 size-5" />
                        {upd.isLoading ? t('common.saving') : t('common.save')}
                      </span>
                    </Button>

                    <Link
                      to="/dashboard/services"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-white/[0.08] dark:bg-transparent dark:text-foreground dark:hover:bg-white/[0.05]"
                    >
                      <ListChecks className="size-4" />
                      {t('profile.manageServicesLink')}
                    </Link>
                  </CardContent>
                </Card>
              </div>

            </form>
          </>
        )}
      </Formik>
    </div>
  );
}

