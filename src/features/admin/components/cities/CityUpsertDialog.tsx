import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
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
import type { CreateCityDto } from '@/types';

const Schema = Yup.object({
  name: Yup.string().trim().required('Required'),
  slug: Yup.string().trim().required('Required'),
  isActive: Yup.boolean().optional(),
});

interface CityUpsertDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CreateCityDto;
  onClose: () => void;
  onSubmit: (values: CreateCityDto) => Promise<void>;
}

export default function CityUpsertDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: CityUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold">{mode === 'create' ? 'Create city' : 'Edit city'}</DialogTitle>
        </DialogHeader>
        <Formik
        initialValues={initial}
        enableReinitialize
        validationSchema={Schema}
        onSubmit={async (values, helpers) => {
          try {
            await onSubmit(values);
            helpers.setSubmitting(false);
            onClose();
          } catch {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ values, isSubmitting, submitForm, setFieldValue }) => (
          <>
            <div className="flex flex-col gap-4">
              <FormikTextField label="Name" name="name" placeholder="Chișinău" />
              <FormikTextField label="Slug" name="slug" placeholder="chisinau" />
              <div className="flex items-center space-x-2">
                <Switch
                  id="city-active"
                  checked={Boolean(values.isActive)}
                  onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                />
                <Label htmlFor="city-active">Active</Label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
              >
                Cancel
              </Button>
              <Button
                onClick={submitForm}
                disabled={isSubmitting}
                className="border-0 bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
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
