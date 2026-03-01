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

type Props = { type: string };

export function NotificationIcon({ type }: Props) {
  switch (type) {
    case 'new_lead':
    case 'admin_new_lead':
    case 'lead_status_updated':
    case 'lead_sent':
      return <Zap className="h-4 w-4 text-orange-500" />;
    case 'new_review':
    case 'admin_new_review':
      return <Star className="h-4 w-4 text-yellow-500" />;
    case 'new_chat_message':
    case 'master_responded':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'master_available':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case 'subscription_expiring':
    case 'subscription_expired':
    case 'payment_failed':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'payment_success':
    case 'admin_new_payment':
      return <CreditCard className="h-4 w-4 text-green-500" />;
    case 'verification_approved':
    case 'admin_new_verification':
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    case 'verification_rejected':
    case 'admin_new_report':
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case 'admin_new_user':
    case 'admin_new_master':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'booking_confirmed':
    case 'booking_cancelled':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'system_maintenance':
    case 'system_update':
    case 'admin_system_alert':
      return <Info className="h-4 w-4 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}
