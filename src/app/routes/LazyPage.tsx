import React, { Suspense } from 'react';
import { LoadingState } from '@/components/common/States';

export function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState fullScreen />}>{children}</Suspense>;
}
