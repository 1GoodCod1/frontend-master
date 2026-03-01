import { useState } from 'react';
import {
  ThumbsUp,
  Plus,
  Filter,
  ArrowUpDown,
  Check,
  X,
  Hourglass,
  Lightbulb,
  Wrench,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import {
  useIdeasListQuery,
  useIdeaCreateMutation,
  useIdeaToggleVoteMutation,
} from '@/features/ideas/ideasApi';
import {
  IdeaStatusFilter,
  IdeaSortBy,
  IdeaStatus,
  type Idea,
} from '@/types/ideas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

function getStatusVariant(status: IdeaStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case IdeaStatus.APPROVED:
      return 'default';
    case IdeaStatus.REJECTED:
      return 'destructive';
    case IdeaStatus.PENDING:
      return 'secondary';
    case IdeaStatus.IMPLEMENTED:
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status: IdeaStatus) {
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
}

function getAuthorName(idea: Idea): string {
  const author = idea.author;
  if (author?.firstName || author?.lastName) {
    return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim();
  }
  return author?.email ?? '';
}

export default function IdeasPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const isAuthed = useAppSelector(selectIsAuthed);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<IdeaStatusFilter>(IdeaStatusFilter.ALL);
  const [sortBy, setSortBy] = useState<IdeaSortBy>(IdeaSortBy.VOTES);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDescription, setNewIdeaDescription] = useState('');

  const { data, isLoading, error } = useIdeasListQuery({
    page,
    limit: 20,
    status: statusFilter,
    sortBy,
  });

  const [createIdea, { isLoading: isCreating }] = useIdeaCreateMutation();
  const [toggleVote] = useIdeaToggleVoteMutation();

  const handleCreateIdea = async () => {
    if (!newIdeaTitle.trim() || !newIdeaDescription.trim()) return;
    try {
      await createIdea({
        title: newIdeaTitle.trim(),
        description: newIdeaDescription.trim(),
      }).unwrap();
      setCreateDialogOpen(false);
      setNewIdeaTitle('');
      setNewIdeaDescription('');
    } catch (err) {
      console.error('Failed to create idea:', err);
    }
  };

  const handleVote = async (ideaId: string) => {
    if (!isAuthed) {
      alert(t('ideas.vote.loginRequired'));
      return;
    }
    try {
      await toggleVote(ideaId).unwrap();
    } catch (err) {
      console.error('Failed to toggle vote:', err);
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

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">💡 {t('ideas.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('ideas.subtitle')}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isAuthed && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 whitespace-nowrap">
              <Plus className="size-4" />
              {t('ideas.suggest')}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Label className="sr-only">{t('ideas.filter.status')}</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as IdeaStatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={t('ideas.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IdeaStatusFilter.ALL}>{t('ideas.status.all')}</SelectItem>
                <SelectItem value={IdeaStatusFilter.PENDING}>{t('ideas.status.pending')}</SelectItem>
                <SelectItem value={IdeaStatusFilter.APPROVED}>{t('ideas.status.approved')}</SelectItem>
                <SelectItem value={IdeaStatusFilter.REJECTED}>{t('ideas.status.rejected')}</SelectItem>
                <SelectItem value={IdeaStatusFilter.IMPLEMENTED}>{t('ideas.status.implemented')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <Label className="sr-only">{t('ideas.filter.sort')}</Label>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as IdeaSortBy);
                setPage(1);
              }}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={t('ideas.filter.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IdeaSortBy.VOTES}>{t('ideas.sortBy.votes')}</SelectItem>
                <SelectItem value={IdeaSortBy.CREATED_AT}>{t('ideas.sortBy.createdAt')}</SelectItem>
                <SelectItem value={IdeaSortBy.UPDATED_AT}>{t('ideas.sortBy.updatedAt')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6 rounded-lg">
          <AlertDescription>{t('ideas.errors.loadFailed')}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data?.ideas && (
        <>
          <div className="space-y-4">
            {data.ideas.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('ideas.noIdeas')}
                </CardContent>
              </Card>
            ) : (
              data.ideas.map((idea: Idea, idx: number) => (
                <ScrollReveal key={idea.id} delay={idx * 0.03} duration={0.4}>
                  <Card className="border-border transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6">
                      <div className="flex min-w-[60px] flex-col items-center gap-1">
                        <Button
                          variant={idea.hasVoted ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => handleVote(idea.id)}
                          disabled={idea.status !== IdeaStatus.APPROVED}
                          className="shrink-0"
                        >
                          <ThumbsUp className={cn('size-5', idea.hasVoted && 'fill-current')} />
                        </Button>
                        <span className="text-lg font-bold">{idea.votesCount}</span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold">{idea.title}</h2>
                          <Badge variant={getStatusVariant(idea.status)} className="gap-1 font-semibold">
                            {getStatusIcon(idea.status)}
                            {getStatusLabel(idea.status)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{idea.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span>{t('ideas.card.author', { name: getAuthorName(idea) })}</span>
                          <span>{formatDateShort(idea.createdAt, locale)}</span>
                        </div>

                        {idea.adminNote && (
                          <Alert className="mt-3 rounded-lg">
                            <AlertDescription>
                              <strong>{t('ideas.card.adminNote')}</strong> {idea.adminNote}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                      isActive={page === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Dialog open={createDialogOpen} onOpenChange={(open) => !isCreating && setCreateDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Lightbulb className="size-4" />
              </div>
              {t('ideas.create.title')}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('ideas.create.titleField')}</Label>
                <Input
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  placeholder={t('ideas.create.titlePlaceholder')}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {t('ideas.create.titleHelper', { count: newIdeaTitle.length })}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('ideas.create.descriptionField')}</Label>
                <Textarea
                  value={newIdeaDescription}
                  onChange={(e) => setNewIdeaDescription(e.target.value)}
                  placeholder={t('ideas.create.descriptionPlaceholder')}
                  rows={5}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t('ideas.create.descriptionHelper', { count: newIdeaDescription.length })}
                </p>
              </div>
              <Alert className="rounded-xl border-amber-200/70 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300">
                <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  {t('ideas.create.moderationNote')}
                </AlertDescription>
              </Alert>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              {t('ideas.create.cancel')}
            </Button>
            <Button
              onClick={handleCreateIdea}
              disabled={
                isCreating ||
                newIdeaTitle.trim().length < 5 ||
                newIdeaDescription.trim().length < 20
              }
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('ideas.create.submit')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
