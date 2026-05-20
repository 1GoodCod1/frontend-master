import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobsCreateMutation, useJobApplyMutation } from '@/features/jobs/jobsApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { CreateJobDto, JobType, ApplicationPaymentType, MilestoneDto } from '@/types';
import { emptyMilestone } from '@/utils/jobs';
import toast from 'react-hot-toast';

export type PublicJobsTab = 'best' | 'recent' | 'saved';

const ALL_FILTER = 'all';

export function usePublicJobsState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as PublicJobsTab | null;
  const [tab, setTab] = useState<PublicJobsTab>(
    sortParam === 'best' || sortParam === 'saved' ? sortParam : 'recent',
  );
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') ?? '');
  const [cityId, setCityId] = useState(searchParams.get('city') ?? ALL_FILTER);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? ALL_FILTER);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('apply'));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (tab !== 'recent') params.sort = tab;
    if (search) params.q = search;
    if (cityId && cityId !== ALL_FILTER) params.city = cityId;
    if (categoryId && categoryId !== ALL_FILTER) params.category = categoryId;
    if (selectedId) params.apply = selectedId;
    setSearchParams(params, { replace: true });
  }, [tab, search, cityId, categoryId, selectedId, setSearchParams]);

  const apiSort: 'recent' | 'best' | undefined =
    tab === 'best' ? 'best' : tab === 'recent' ? 'recent' : undefined;

  const apiCityId = cityId !== ALL_FILTER ? cityId : undefined;
  const apiCategoryId = categoryId !== ALL_FILTER ? categoryId : undefined;

  const resetFilters = useCallback(() => {
    setCityId(ALL_FILTER);
    setCategoryId(ALL_FILTER);
    setPage(1);
  }, []);

  return {
    tab,
    setTab,
    search,
    setSearch,
    debouncedSearch,
    cityId,
    setCityId,
    categoryId,
    setCategoryId,
    page,
    setPage,
    selectedId,
    setSelectedId,
    apiSort,
    apiCityId,
    apiCategoryId,
    resetFilters,
    allFilterValue: ALL_FILTER,
  };
}

export function useApplyJobForm(jobId: string, minJoints: number, balance: number) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apply, { isLoading }] = useJobApplyMutation();
  const fileUploadProps = useFileUpload({ maxFiles: 5, forLead: true });

  const [joints, setJoints] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<ApplicationPaymentType>('FULL');
  const [deadline, setDeadline] = useState<string>('');
  const [milestones, setMilestones] = useState<MilestoneDto[]>([emptyMilestone()]);

  const updateMilestone = (i: number, patch: Partial<MilestoneDto>) => {
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  };
  const addMilestone = () => setMilestones((prev) => [...prev, emptyMilestone()]);
  const removeMilestone = (i: number) => setMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const jointsValue = joints ?? minJoints;
    if (jointsValue < minJoints) {
      toast.error(t('jobs.minJointsRequired', { n: minJoints }));
      return;
    }
    if (jointsValue > balance) {
      toast.error(t('jobs.insufficientJoints'));
      return;
    }
    if (!description.trim()) {
      toast.error(t('jobs.writeCoverLetter'));
      return;
    }

    if (paymentType === 'FULL' && !deadline) {
      toast.error(t('jobs.deadlineRequired', 'Please enter the completion time'));
      return;
    }
    if (paymentType === 'PARTIAL') {
      const invalid = milestones.some((m) => !m.title.trim() || !m.dueDate || m.price <= 0);
      if (invalid) {
        toast.error(t('jobs.milestonesInvalid', 'Fill in all milestone fields'));
        return;
      }
    }

    let photoFileIds: string[] | undefined;
    if (fileUploadProps.files.length > 0) {
      const uploaded = await fileUploadProps.upload();
      if (!uploaded) return;
      photoFileIds = uploaded.map((f) => f.id);
    }

    try {
      await apply({
        jobId,
        body: {
          jointsSpent: jointsValue,
          description,
          paymentType,
          deadline: paymentType === 'FULL' && deadline ? Number(deadline) : undefined,
          milestones: paymentType === 'PARTIAL' ? milestones : undefined,
          photoFileIds,
        },
      }).unwrap();
      toast.success(t('jobs.appliedSuccess'));
      navigate('/dashboard/jobs/applications');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg ?? t('jobs.applyError'));
    }
  };

  return {
    joints,
    setJoints,
    description,
    setDescription,
    paymentType,
    setPaymentType,
    deadline,
    setDeadline,
    milestones,
    setMilestones,
    updateMilestone,
    addMilestone,
    removeMilestone,
    handleSubmit,
    isLoading,
    ...fileUploadProps,
  };
}

export function useCreateJobForm() {
// ... existing code ...
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [create, { isLoading }] = useJobsCreateMutation();
  const fileUploadProps = useFileUpload({ maxFiles: 10, forLead: true });

  const [form, setForm] = useState<Omit<CreateJobDto, 'photoFileIds'>>({
    title: '',
    description: '',
    type: 'FIXED_PRICE' as JobType,
    budget: undefined,
    hourlyRate: undefined,
    minJoints: 5,
    cityId: undefined,
    categoryId: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'budget' || name === 'hourlyRate' || name === 'minJoints'
        ? value === '' ? undefined : Number(value)
        : value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error(t('jobs.titleDescRequired', 'Title and description are required'));
      return;
    }
    if (!form.categoryId) {
      toast.error(t('jobs.categoryRequired', 'Selectează o categorie'));
      return;
    }
    try {
      let photoFileIds: string[] | undefined;
      if (fileUploadProps.files.length > 0) {
        const uploaded = await fileUploadProps.upload();
        if (!uploaded) return;
        photoFileIds = uploaded.map((f) => f.id);
      }
      const job = await create({ ...form, photoFileIds }).unwrap();
      toast.success(t('jobs.created', 'Job posted successfully!'));
      navigate(`/client-dashboard/jobs/${job.id}`);
    } catch {
      toast.error(t('jobs.createError', 'Failed to create job posting'));
    }
  };

  return {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isLoading,
    ...fileUploadProps,
  };
}

const SAVED_KEY = 'faber_saved_jobs';

export function useSavedJobs() {
  const [saved, setSaved] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]'));
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { saved, toggle };
}
