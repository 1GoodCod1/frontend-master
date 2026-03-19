import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { PortfolioItemDto } from '@/types';

interface EditPortfolioDialogProps {
  item: PortfolioItemDto;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    description?: string;
    serviceTags?: string[];
  }) => void;
  isLoading: boolean;
}

export function EditPortfolioDialog({
  item,
  onClose,
  onSubmit,
  isLoading,
}: EditPortfolioDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(item.title ?? '');
  const [description, setDescription] = useState(item.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('portfolio.editWork')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">{t('portfolio.titleField')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('portfolio.titlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">
              {t('portfolio.descriptionField')}
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('portfolio.descriptionPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('portfolio.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
