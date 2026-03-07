import React, { useState } from 'react';
import { Ban } from 'lucide-react';
import {
  useSecurityBanUserMutation,
  useSecurityUnbanUserMutation,
  useSecurityBlacklistIpMutation,
} from '@/features/security/securityApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export const SecurityManagement: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipReason, setIpReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [banUserMutation, { isLoading: isBanning }] = useSecurityBanUserMutation();
  const [unbanUserMutation, { isLoading: isUnbanning }] = useSecurityUnbanUserMutation();
  const [blacklistIpMutation, { isLoading: isBlacklisting }] = useSecurityBlacklistIpMutation();

  const loading = isBanning || isUnbanning || isBlacklisting;

  const handleBanUser = async () => {
    if (!userId || !banReason) {
      setMessage({ type: 'error', text: 'Заполните все поля' });
      return;
    }
    setMessage(null);
    try {
      await banUserMutation({ userId, reason: banReason }).unwrap();
      setMessage({ type: 'success', text: 'Пользователь заблокирован' });
      setUserId('');
      setBanReason('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      setMessage({ type: 'error', text: (msg as string) || 'Ошибка' });
    }
  };

  const handleUnbanUser = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'Введите ID пользователя' });
      return;
    }
    setMessage(null);
    try {
      await unbanUserMutation({ userId }).unwrap();
      setMessage({ type: 'success', text: 'Пользователь разблокирован' });
      setUserId('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      setMessage({ type: 'error', text: (msg as string) || 'Ошибка' });
    }
  };

  const handleBlacklistIp = async () => {
    if (!ipAddress || !ipReason) {
      setMessage({ type: 'error', text: 'Заполните все поля' });
      return;
    }
    setMessage(null);
    try {
      await blacklistIpMutation({ ipAddress, reason: ipReason }).unwrap();
      setMessage({ type: 'success', text: 'IP адрес заблокирован' });
      setIpAddress('');
      setIpReason('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      setMessage({ type: 'error', text: (msg as string) || 'Ошибка' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Управление безопасностью</h1>

      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className="rounded-lg"
        >
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="shrink-0 rounded p-1 hover:bg-black/10"
              aria-label="Close"
            >
              ×
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border">
        <CardContent className="space-y-4 pt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Ban className="size-5" />
            Блокировка пользователя
          </h2>
          <div className="space-y-2">
            <Label htmlFor="security-user-id">ID пользователя</Label>
            <Input
              id="security-user-id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="security-ban-reason">Причина блокировки</Label>
            <Textarea
              id="security-ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" onClick={handleBanUser} disabled={loading}>
              Заблокировать
            </Button>
            <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={handleUnbanUser} disabled={loading}>
              Разблокировать
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-border">
        <CardContent className="space-y-4 pt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Ban className="size-5" />
            Блокировка IP адреса
          </h2>
          <div className="space-y-2">
            <Label htmlFor="security-ip">IP адрес</Label>
            <Input
              id="security-ip"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="security-ip-reason">Причина блокировки</Label>
            <Textarea
              id="security-ip-reason"
              value={ipReason}
              onChange={(e) => setIpReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <Button variant="destructive" onClick={handleBlacklistIp} disabled={loading}>
            Заблокировать IP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
