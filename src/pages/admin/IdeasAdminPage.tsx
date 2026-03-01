import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Hourglass, Wrench, Eye, Loader2 } from 'lucide-react';
import { useIdeasListQuery, useIdeaUpdateStatusMutation } from '@/features/ideas/ideasApi';
import { IdeaStatusFilter, IdeaStatus, IdeaSortBy, type Idea } from '@/types/ideas';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function IdeasAdminPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IdeaStatus>(IdeaStatus.APPROVED);
  const [adminNote, setAdminNote] = useState('');

  const { data, isLoading, error } = useIdeasListQuery({
    page: 1,
    limit: 50,
    status: IdeaStatusFilter.ALL,
    sortBy: IdeaSortBy.CREATED_AT,
  });

  const [updateStatus, { isLoading: isUpdating }] = useIdeaUpdateStatusMutation();

  const handleOpenModeration = (idea: Idea) => {
    setSelectedIdea(idea);
    setNewStatus(idea.status);
    setAdminNote(idea.adminNote || '');
    setModerationDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedIdea) return;

    try {
      await updateStatus({
        id: selectedIdea.id,
        body: {
          status: newStatus,
          adminNote: adminNote.trim() || undefined,
        },
      }).unwrap();
      setModerationDialogOpen(false);
      setSelectedIdea(null);
      setAdminNote('');
    } catch (err) {
      console.error('Failed to update idea status:', err);
    }
  };

  const getStatusVariant = (status: IdeaStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case IdeaStatus.PENDING:
        return 'secondary';
      case IdeaStatus.APPROVED:
        return 'default';
      case IdeaStatus.REJECTED:
        return 'destructive';
      case IdeaStatus.IMPLEMENTED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: IdeaStatus) => {
    switch (status) {
      case IdeaStatus.PENDING:
        return <Hourglass className="size-3.5" />;
      case IdeaStatus.APPROVED:
        return <Check className="size-3.5" />;
      case IdeaStatus.REJECTED:
        return <X className="size-3.5" />;
      case IdeaStatus.IMPLEMENTED:
        return <Wrench className="size-3.5" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: IdeaStatus) => {
    switch (status) {
      case IdeaStatus.PENDING:
        return t('ideas.status.pending');
      case IdeaStatus.APPROVED:
        return t('ideas.status.approved');
      case IdeaStatus.REJECTED:
        return t('ideas.status.rejected');
      case IdeaStatus.IMPLEMENTED:
        return t('ideas.status.implemented');
      default:
        return status;
    }
  };

  const getAuthorName = (idea: Idea) => {
    if (idea.author?.firstName || idea.author?.lastName) {
      return `${idea.author.firstName || ''} ${idea.author.lastName || ''}`.trim();
    }
    return idea.author?.email ?? '—';
  };

  return (
    <div className="animate-in fade-in duration-200">
      <PageHeader title={`💡 ${t('ideas.admin.title')}`} subtitle="" />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{t('ideas.errors.loadFailed')}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data?.ideas && (
        <Card className="border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('ideas.admin.table.title')}</TableHead>
                  <TableHead>{t('ideas.admin.table.description')}</TableHead>
                  <TableHead>{t('ideas.admin.table.author')}</TableHead>
                  <TableHead>{t('ideas.admin.table.status')}</TableHead>
                  <TableHead className="text-center">{t('ideas.admin.table.votes')}</TableHead>
                  <TableHead>{t('ideas.admin.table.date')}</TableHead>
                  <TableHead className="text-center">{t('ideas.admin.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ideas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {t('ideas.admin.noIdeas')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.ideas.map((idea: Idea) => (
                    <TableRow key={idea.id}>
                      <TableCell>
                        <span className="font-medium">{idea.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="max-w-[300px] truncate block text-muted-foreground">
                          {idea.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block text-sm">{getAuthorName(idea)}</span>
                        <span className="text-xs text-muted-foreground">{idea.author?.role}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(idea.status)} className="gap-1">
                          {getStatusIcon(idea.status)}
                          {getStatusLabel(idea.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {idea.votesCount}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateShort(idea.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleOpenModeration(idea)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('ideas.admin.moderate')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={moderationDialogOpen} onOpenChange={(open) => !isUpdating && setModerationDialogOpen(open)}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('ideas.admin.moderateTitle')}</DialogTitle>
          </DialogHeader>
          {selectedIdea && (
            <div className="flex flex-col gap-4 py-2">
              <div>
                <h4 className="font-semibold text-foreground">{selectedIdea.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedIdea.description}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>{t('ideas.card.author', { name: getAuthorName(selectedIdea) })}</p>
                <p>{t('ideas.admin.table.votes')}: {selectedIdea.votesCount}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">{t('ideas.admin.newStatus')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant={newStatus === IdeaStatus.APPROVED ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewStatus(IdeaStatus.APPROVED)}
                    className="gap-1"
                  >
                    <Check className="size-4" />
                    {t('ideas.admin.approve')}
                  </Button>
                  <Button
                    variant={newStatus === IdeaStatus.REJECTED ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setNewStatus(IdeaStatus.REJECTED)}
                    className="gap-1"
                  >
                    <X className="size-4" />
                    {t('ideas.admin.reject')}
                  </Button>
                  <Button
                    variant={newStatus === IdeaStatus.IMPLEMENTED ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setNewStatus(IdeaStatus.IMPLEMENTED)}
                    className="gap-1"
                  >
                    <Wrench className="size-4" />
                    {t('ideas.admin.markImplemented')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-note">{t('ideas.admin.adminNoteField')}</Label>
                <Textarea
                  id="admin-note"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={t('ideas.admin.adminNotePlaceholder')}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t('ideas.admin.adminNoteHelper', { count: adminNote.length })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModerationDialogOpen(false)} disabled={isUpdating}>
              {t('ideas.admin.cancel')}
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="size-4 animate-spin" /> : t('ideas.admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
