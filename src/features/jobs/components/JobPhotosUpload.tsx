import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
      <Label className="text-sm font-semibold text-foreground">
        {t('jobs.photos', 'Photos')}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          (optional, up to {maxFiles})
        </span>
      </Label>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
              <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
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
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400"
          >
            <ImagePlus className="h-4 w-4" />
            {t('jobs.addPhotos', 'Add photos')}
          </button>
        </>
      )}
    </div>
  );
}
