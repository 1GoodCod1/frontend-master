import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { clientFormLabelCls, clientTextMuted } from '@/lib/clientCabinetStyles';

interface JobPhotosUploadProps {
  files: File[];
  previews: string[];
  pickFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  maxFiles?: number;
}

export function JobPhotosUpload({ files, previews, pickFiles, removeFile, maxFiles = 10 }: JobPhotosUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label className={clientFormLabelCls}>
        {t('jobs.photos', 'Photos')}
        <span className={cn('ml-1.5 font-normal', clientTextMuted)}>(optional, up to {maxFiles})</span>
      </Label>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-[12px] border border-[#E9ECEF] dark:border-white/12">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length < maxFiles && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                pickFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed',
              'border-[#E9ECEF] px-4 py-3 text-[13px] text-[#6C757D] transition-colors',
              'hover:border-[#E97525]/45 hover:bg-[#E97525]/5 hover:text-[#E97525]',
              'dark:border-white/12 dark:hover:bg-[#E97525]/10',
            )}
          >
            <ImagePlus className="h-4 w-4" />
            {t('jobs.addPhotos', 'Add photos')}
          </button>
        </>
      )}
    </div>
  );
}
