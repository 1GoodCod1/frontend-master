import {
  Bell,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Info,
  Calendar,
  MessageCircle,
  Star,
  Zap,
} from 'lucide-react';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';

type Props = { type: string };

export function NotificationIcon({ type }: Props) {
  switch (type) {
    case NOTIFICATION_EVENT_TYPE.new_lead:
    case NOTIFICATION_EVENT_TYPE.admin_new_lead:
    case NOTIFICATION_EVENT_TYPE.lead_status_updated:
    case NOTIFICATION_EVENT_TYPE.lead_sent:
      return <Zap className="h-4 w-4 text-orange-500" />;
    case NOTIFICATION_EVENT_TYPE.new_review:
    case NOTIFICATION_EVENT_TYPE.admin_new_review:
      return <Star className="h-4 w-4 text-yellow-500" />;
    case NOTIFICATION_EVENT_TYPE.new_chat_message:
    case NOTIFICATION_EVENT_TYPE.master_responded:
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case NOTIFICATION_EVENT_TYPE.master_available:
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case NOTIFICATION_EVENT_TYPE.subscription_expiring:
    case NOTIFICATION_EVENT_TYPE.subscription_expired:
    case NOTIFICATION_EVENT_TYPE.payment_failed:
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case NOTIFICATION_EVENT_TYPE.payment_success:
    case NOTIFICATION_EVENT_TYPE.admin_new_payment:
      return <CreditCard className="h-4 w-4 text-green-500" />;
    case NOTIFICATION_EVENT_TYPE.verification_approved:
    case NOTIFICATION_EVENT_TYPE.admin_new_verification:
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    case NOTIFICATION_EVENT_TYPE.verification_rejected:
    case NOTIFICATION_EVENT_TYPE.admin_new_report:
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case NOTIFICATION_EVENT_TYPE.admin_new_user:
    case NOTIFICATION_EVENT_TYPE.admin_new_master:
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case NOTIFICATION_EVENT_TYPE.booking_confirmed:
    case NOTIFICATION_EVENT_TYPE.booking_cancelled:
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case NOTIFICATION_EVENT_TYPE.system_maintenance:
    case NOTIFICATION_EVENT_TYPE.system_update:
    case NOTIFICATION_EVENT_TYPE.admin_system_alert:
      return <Info className="h-4 w-4 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}
