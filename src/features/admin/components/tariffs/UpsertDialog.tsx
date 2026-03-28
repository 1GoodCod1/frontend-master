import React from 'react';
import { Formik } from 'formik';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import { Textarea } from '@/components/ui/textarea';
import type { CreateTariffDto } from '@/features/tariffs/tariffsApi';

const Schema = Yup.object({
  name: Yup.string().trim().required('Required'),
  type: Yup.string().oneOf(['BASIC', 'VIP', 'PREMIUM']).required('Required'),
  price: Yup.string().trim().required('Required'),
  amount: Yup.number().positive().required('Required'),
  days: Yup.number().positive().optional(),
  description: Yup.string().optional(),
  features: Yup.array().of(Yup.string()).min(1, 'At least one feature required').required('Required'),
  isActive: Yup.boolean().optional(),
  sortOrder: Yup.number().nullable().transform((v, o) => (o === '' ? null : v)).optional(),
});

interface UpsertDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CreateTariffDto & { sortOrder?: number | null; features?: string[] };
  onClose: () => void;
  onSubmit: (values: CreateTariffDto) => Promise<void>;
}

export default function UpsertDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: UpsertDialogProps) {
  const [featuresText, setFeaturesText] = React.useState(
    initial.features?.join('\n') || ''
  );

  React.useEffect(() => {
    setFeaturesText(initial.features?.join('\n') || '');
  }, [initial.features]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-xl flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === 'create' ? 'Create tariff' : 'Edit tariff'}
          </DialogTitle>
          <p className="pr-2 text-sm text-muted-foreground">
            Subscription plan shown on the public plans page and at checkout.
          </p>
        </DialogHeader>
        <Formik
          initialValues={initial}
          enableReinitialize
          validationSchema={Schema}
          onSubmit={async (values, helpers) => {
            try {
              const features = featuresText.split('\n').filter((f) => f.trim());
              await onSubmit({ ...values, features });
              helpers.setSubmitting(false);
              onClose();
            } catch {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, submitForm, setFieldValue, setFieldTouched, errors, touched }) => (
            <>
              <DialogBody className="space-y-6 py-5">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Plan identity
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      Internal name and tariff tier (BASIC / VIP / PREMIUM).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormikTextField label="Name" name="name" placeholder="VIP Plan" />
                    <FormikSelect
                      label="Type"
                      name="type"
                      placeholder="Select type"
                      options={[
                        { value: 'BASIC', label: 'BASIC' },
                        { value: 'VIP', label: 'VIP' },
                        { value: 'PREMIUM', label: 'PREMIUM' },
                      ]}
                      fullWidth
                      className="h-9 w-full"
                    />
                  </div>
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Pricing &amp; duration
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      Display string for UI, numeric amount for payments, optional period in days.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormikTextField label="Price (display)" name="price" placeholder="199 MDL / month" />
                    <FormikTextField label="Amount (numeric)" name="amount" type="number" placeholder="199" />
                    <FormikTextField label="Days" name="days" type="number" placeholder="30" />
                  </div>
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Description
                  </h3>
                  <FormikTextarea
                    name="description"
                    placeholder="Optional short description…"
                    rows={3}
                    className="w-full"
                  />
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-3">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Features
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">One bullet per line; shown on the plans page.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="tariff-features-text"
                      className={touched.features && errors.features ? 'text-destructive' : undefined}
                    >
                      Feature list
                    </Label>
                    <Textarea
                      id="tariff-features-text"
                      value={featuresText}
                      onChange={(e) => {
                        setFeaturesText(e.target.value);
                        const features = e.target.value.split('\n').filter((f) => f.trim());
                        setFieldValue('features', features);
                      }}
                      onBlur={() => setFieldTouched('features', true)}
                      placeholder="Enter one feature per line"
                      rows={5}
                      className={
                        touched.features && errors.features
                          ? 'border-destructive focus-visible:ring-destructive'
                          : undefined
                      }
                    />
                    <p
                      className={
                        touched.features && errors.features
                          ? 'text-sm text-destructive'
                          : 'text-sm text-muted-foreground'
                      }
                    >
                      {touched.features && errors.features ? String(errors.features) : 'At least one non-empty line required.'}
                    </p>
                  </div>
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Order &amp; visibility
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">Lower sort values appear first where lists are ordered.</p>
                  </div>
                  <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                    <FormikTextField label="Sort order" name="sortOrder" type="number" />
                    <div className="flex min-h-[72px] flex-col justify-center gap-2 rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <Label htmlFor="tariff-active" className="text-sm font-medium">
                            Active
                          </Label>
                          <p className="text-xs text-muted-foreground">Offered for purchase when on.</p>
                        </div>
                        <Switch
                          id="tariff-active"
                          checked={Boolean(values.isActive)}
                          onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </DialogBody>
              <DialogFooter className="gap-2 sm:gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="min-w-[7rem] border-amber-500/50 bg-transparent text-amber-800 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => submitForm()}
                  disabled={isSubmitting}
                  className="min-w-[7rem] border-0 bg-amber-600 text-white shadow-md transition hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
