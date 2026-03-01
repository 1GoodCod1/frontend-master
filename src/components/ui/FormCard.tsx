import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';

export function FormCard(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  const { title, subtitle, children, maxWidth = 520 } = props;
  return (
    <div className="mt-8 flex justify-center md:mt-12">
      <div className="w-full" style={{ maxWidth }}>
        <SectionCard title={title} subtitle={subtitle}>
          {children}
        </SectionCard>
      </div>
    </div>
  );
}
