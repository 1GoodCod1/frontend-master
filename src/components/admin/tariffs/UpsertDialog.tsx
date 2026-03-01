import React from 'react';
import { Formik } from 'formik';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-extrabold">
            {mode === 'create' ? 'Create tariff' : 'Edit tariff'}
          </DialogTitle>
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
              <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto">
                <FormikTextField label="Name" name="name" placeholder="VIP Plan" />
                <FormikSelect
                  label="Type"
                  name="type"
                  options={[
                    { value: 'BASIC', label: 'BASIC' },
                    { value: 'VIP', label: 'VIP' },
                    { value: 'PREMIUM', label: 'PREMIUM' },
                  ]}
                  fullWidth
                />
                <FormikTextField label="Price (display)" name="price" placeholder="199 MDL / month" />
                <FormikTextField label="Amount (numeric)" name="amount" type="number" placeholder="199" />
                <FormikTextField label="Days" name="days" type="number" placeholder="30" />

                <FormikTextarea
                  label="Description"
                  name="description"
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full"
                />
                <div className="flex flex-col gap-1.5">
                  <Label className={touched.features && errors.features ? 'text-destructive' : undefined}>
                    Features (one per line)
                  </Label>
                  <Textarea
                    value={featuresText}
                    onChange={(e) => {
                      setFeaturesText(e.target.value);
                      const features = e.target.value.split('\n').filter((f) => f.trim());
                      setFieldValue('features', features);
                    }}
                    onBlur={() => setFieldTouched('features', true)}
                    placeholder="Enter one feature per line"
                    rows={5}
                    className={touched.features && errors.features ? 'border-destructive' : ''}
                  />
                  <p className={touched.features && errors.features ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
                    {touched.features && errors.features ? String(errors.features) : 'Enter one feature per line'}
                  </p>
                </div>
                <FormikTextField label="Sort order" name="sortOrder" type="number" />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tariff-active"
                    checked={Boolean(values.isActive)}
                    onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                  />
                  <Label htmlFor="tariff-active">Active</Label>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={submitForm} disabled={isSubmitting}>
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
