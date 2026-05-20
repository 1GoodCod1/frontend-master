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
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterFormCardCls,
  masterIconWrapCls,
  masterPageClassName,
  masterOutlineBtnCls,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
} from '@/lib/masterCabinetStyles';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import { unwrapList } from '@/utils/data';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { UnsavedChangesPrompt } from '@/hooks/useUnsavedChangesPrompt';
import { CardContent } from '@/components/ui/card';
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
  const profileData: Record<string, unknown> | undefined =
    rawProfile && typeof rawProfile === 'object' && 'data' in rawProfile
      ? (rawProfile as { data?: unknown }).data as Record<string, unknown> | undefined
      : (rawProfile as Record<string, unknown> | undefined);
  const profileLastEditedAt = profileData?.profileLastEditedAt as string | undefined;

  const now = new Date();
  const lastEditedDate = profileLastEditedAt && typeof profileLastEditedAt === 'string' ? new Date(profileLastEditedAt) : null;
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

  const profileCategory = profileData?.category as Record<string, unknown> | null | undefined;
  const profileCity = profileData?.city as Record<string, unknown> | null | undefined;
  const profileCityId = (profileData?.cityId ?? profileCity?.id) as string | undefined;
  const profileCategoryId = (profileData?.categoryId ?? profileCategory?.id) as string | undefined;

  const categoryOptions = (categories as Record<string, unknown>[]).map((cat) => ({
    value: String(cat.id ?? ''),
    label: getTranslatedCategoryName(t, cat) || String(cat.name ?? cat.id ?? ''),
  }));
  if (profileCategory && profileCategoryId && !categoryOptions.some((o) => o.value === String(profileCategoryId))) {
    categoryOptions.unshift({
      value: String(profileCategoryId),
      label: getTranslatedCategoryName(t, profileCategory) || String(profileCategory.name ?? profileCategoryId),
    });
  }

  const cityOptions = (cities as Record<string, unknown>[]).map((city) => ({
    value: String(city.id ?? ''),
    label: getTranslatedCityName(t, city) || String(city.name ?? city.id ?? ''),
  }));
  if (profileCity && profileCityId && !cityOptions.some((o) => o.value === String(profileCityId))) {
    cityOptions.unshift({
      value: String(profileCityId),
      label: getTranslatedCityName(t, profileCity) || String(profileCity.name ?? profileCityId),
    });
  }

  const profileUser = profileData?.user as { firstName?: string; lastName?: string } | undefined;
  const initial = {
    firstName: profileUser?.firstName || '',
    lastName: profileUser?.lastName || '',
    cityId: profileCityId ?? '',
    categoryId: profileCategoryId ?? '',
    experienceYears: profileData?.experienceYears ?? '',
    description: profileData?.description ?? '',
  };

  return (
    <div className={masterPageClassName}>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {isLocked && (
        <Alert className="mb-8 border-[#E97525]/50 bg-[#FFF8EB]/80 dark:bg-[#E97525]/10">
          <AlertDescription className="font-medium text-[#c45f1a] dark:text-[#f08540]">
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
                <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
                  <div className="border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
                    <div className="flex items-center gap-3">
                      <span className={masterIconWrapCls}>
                        <User className="size-5" />
                      </span>
                      <h2 className={masterSectionTitleCls}>{t('profile.personalInfo')}</h2>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormikTextField name="firstName" label={t('profile.firstName')} disabled={!!isLocked} fullWidth />
                      <FormikTextField name="lastName" label={t('profile.lastName')} disabled={!!isLocked} fullWidth />
                    </div>
                  </CardContent>
                </div>

                <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
                  <div className="border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
                    <div className="flex items-center gap-3">
                      <span className={masterIconWrapCls}>
                        <FileText className="size-5" />
                      </span>
                      <h2 className={masterSectionTitleCls}>{t('profile.description')}</h2>
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
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
                  <div className="border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
                    <div className="flex items-center gap-3">
                      <span className={masterIconWrapCls}>
                        <Award className="size-5" />
                      </span>
                      <h2 className={masterSectionTitleCls}>{t('profile.professionalDetails')}</h2>
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
                </div>

                <div className={masterFormCardCls}>
                  <CardContent className="flex flex-col gap-4 p-6">
                    <Button
                      type="submit"
                      disabled={!!isLocked || upd.isLoading}
                      size="lg"
                      className={cn(masterPrimaryBtnCls, 'w-full')}
                    >
                      <span className="relative flex items-center justify-center font-semibold">
                        <Save className="mr-2 size-5" />
                        {upd.isLoading ? t('common.saving') : t('common.save')}
                      </span>
                    </Button>

                    <Link
                      to="/dashboard/services"
                      className={cn(
                        masterOutlineBtnCls,
                        'inline-flex w-full items-center justify-center gap-2 px-4 py-3',
                      )}
                    >
                      <ListChecks className="size-4" />
                      {t('profile.manageServicesLink')}
                    </Link>
                  </CardContent>
                </div>
              </div>

            </form>
          </>
        )}
      </Formik>
    </div>
  );
}

