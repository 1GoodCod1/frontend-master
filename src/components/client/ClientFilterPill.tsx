import { CabinetFilterPill } from '@/components/cabinet/CabinetFilterPill';

type ClientFilterPillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export function ClientFilterPill(props: ClientFilterPillProps) {
  return <CabinetFilterPill {...props} />;
}
