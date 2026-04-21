import { useForm, useWatch, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { config } from '../config';
import { postSchema, type PostFormValues } from '../schemas';
import type { PostInput, PostStatus } from '../types';

interface Props {
  initial?: Partial<PostInput>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (input: PostInput) => void | Promise<void>;
  onCancel?: () => void;
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => t.slice(0, config.validation.maxTagLength));
}

export function PostForm({
  initial,
  submitting,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initial?.title ?? '',
      content: initial?.content ?? '',
      tags: (initial?.tags ?? []).join(', '),
      status: initial?.status ?? 'draft',
    },
  });

  const content = useWatch({ control, name: 'content' }) ?? '';
  const status = useWatch({ control, name: 'status' });
  const tagsRaw = useWatch({ control, name: 'tags' }) ?? '';
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const tagList = parseTags(tagsRaw);

  async function submit(values: PostFormValues) {
    await onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      tags: parseTags(values.tags ?? ''),
      status: values.status as PostStatus,
    });
  }

  const busy = submitting || isSubmitting;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          className={`input !text-lg !py-3 ${errors.title ? 'input-error' : ''}`}
          placeholder="A great post title"
          {...register('title')}
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label !mb-0" htmlFor="content">Content</label>
          <span className="text-[11px] text-content-subtle">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <textarea
          id="content"
          className={`input min-h-[320px] leading-relaxed font-mono text-sm ${errors.content ? 'input-error' : ''}`}
          placeholder="Write your post…"
          {...register('content')}
        />
        {errors.content && <p className="form-error">{errors.content.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label" htmlFor="tags">Tags</label>
          <input
            id="tags"
            className="input"
            placeholder="react, design, 2026"
            {...register('tags')}
          />
          {tagList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagList.map((t) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Status</label>
          <div className="grid grid-cols-2 gap-2">
            <StatusPill label="Draft" value="draft" active={status === 'draft'} register={register} />
            <StatusPill label="Published" value="published" active={status === 'published'} register={register} />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2 border-t border-surface-border">
        {onCancel && (
          <button type="button" className="btn-secondary sm:ml-auto" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary !px-6" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function StatusPill({
  label,
  value,
  active,
  register,
}: {
  label: string;
  value: 'draft' | 'published';
  active: boolean;
  register: UseFormRegister<PostFormValues>;
}) {
  return (
    <label
      className={[
        'relative flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all select-none',
        active
          ? 'border-brand-500 bg-brand-500/10 text-brand-600 shadow-sm'
          : 'border-surface-border bg-surface/50 text-content-muted hover:border-brand-500/50 hover:text-content',
      ].join(' ')}
    >
      <input type="radio" value={value} className="sr-only" {...register('status')} />
      <span
        className={[
          'h-2 w-2 rounded-full transition',
          active ? 'bg-brand-500' : 'bg-content-subtle',
        ].join(' ')}
      />
      {label}
    </label>
  );
}
