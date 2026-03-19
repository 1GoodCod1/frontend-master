import { lazy } from 'react';

export const LazyToaster = lazy(() =>
  import('react-hot-toast').then((m) => ({ default: m.Toaster }))
);
