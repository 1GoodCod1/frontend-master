import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mediaUrl } from '@/utils/media';
import type { FileDto } from '@/types';

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: (FileDto & { id: string })[];
  onSubmit: (data: {
    beforeFileId: string;
    afterFileId: string;
    title?: string;
    description?: string;
    serviceTags?: string[];
  }) => void;
  isLoading: boolean;
}

export function CreatePortfolioDialog({
  open,
  onOpenChange,
  photos,
  onSubmit,
  isLoading,
}: CreatePortfolioDialogProps) {
  const { t } = useTranslation();
  const [beforeFileId, setBeforeFileId] = useState('');
  const [afterFileId, setAfterFileId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFileId || !afterFileId) {
      toast.error(t('portfolio.selectBothPhotos'));
      return;
    }
    if (beforeFileId === afterFileId) {
      toast.error(t('portfolio.samePhotoError'));
      return;
    }
    onSubmit({
      beforeFileId,
      afterFileId,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    setBeforeFileId('');
    setAfterFileId('');
    setTitle('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('portfolio.addWork')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('portfolio.photoBefore')}</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBeforeFileId(p.id)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    beforeFileId === p.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={mediaUrl(p.path ?? (p as { url?: string }).url)}
                    alt=""
                    className="size-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t('portfolio.photoAfter')}</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAfterFileId(p.id)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    afterFileId === p.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={mediaUrl(p.path ?? (p as { url?: string }).url)}
                    alt=""
                    className="size-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="title">{t('portfolio.titleField')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('portfolio.titlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">{t('portfolio.descriptionField')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('portfolio.descriptionPlaceholder')}
              rows={2}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('portfolio.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
