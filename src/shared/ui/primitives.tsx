import { t } from '../i18n';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowUpRight, Plus, AlertTriangle } from 'lucide-react';
import { useId, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../lib/utils';

export function Modal({
  title,
  description,
  children,
  open,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  wide?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          ref={contentRef}
          className={`dialog-content ${wide ? 'wide' : ''}`}
          aria-describedby={description ? 'dialog-description' : undefined}
          onPointerDownOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(event) => {
            const field = contentRef.current?.querySelector<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >('input:not([type="hidden"]), textarea, select');
            if (field) {
              event.preventDefault();
              field.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus?.isConnected) returnFocus.focus();
            else document.getElementById('main-content')?.focus();
          }}
        >
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{t(title)}</Dialog.Title>
              {description && (
                <Dialog.Description id="dialog-description">{t(description)}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="icon-button" aria-label={t('Close dialog')}>
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Confirm({
  title,
  children,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal title={title} open onClose={onClose}>
      <p className="muted">{children}</p>
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <div className="form-actions">
        <button onClick={onClose} className="button secondary">
          {t('Cancel')}
        </button>
        <button
          className="button danger"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void onConfirm()
              .then(onClose)
              .catch((e: unknown) => {
                setError(errorMessage(e));
                setBusy(false);
              });
          }}
        >
          {busy ? t('Working…') : t('Confirm')}
        </button>
      </div>
    </Modal>
  );
}
export function Form({
  children,
  onSave,
  onCancel,
  submit = 'Save',
  className = '',
  version,
}: {
  children: ReactNode;
  onSave: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  submit?: string;
  className?: string;
  version?: number;
}) {
  const [initialVersion] = useState(version);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (version !== initialVersion) {
      setError('This project changed in another tab. Reload it before saving again.');
      return;
    }
    setBusy(true);
    setError('');
    void onSave(data)
      .catch((e: unknown) => setError(errorMessage(e)))
      .finally(() => setBusy(false));
  }
  return (
    <form onSubmit={handle} className={`form ${className}`}>
      {children}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            {t('Cancel')}
          </button>
        )}
        <button className="button primary" disabled={busy}>
          {busy ? t('Saving…') : t(submit)}
        </button>
      </div>
    </form>
  );
}
export type FieldProps = {
  name: string;
  label: string;
  value?: string | number;
  required?: boolean;
  type?: string;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  rows?: number;
  className?: string;
};
export function Field({
  name,
  label: title,
  value = '',
  required,
  type = 'text',
  hint,
  placeholder,
  options,
  min,
  max,
  rows = 3,
  className = '',
}: FieldProps) {
  const id = useId();
  const attrs = {
    id,
    name,
    defaultValue: value,
    required,
    'aria-describedby': hint ? `${id}-hint` : undefined,
  };
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {t(title)}
        {required && <span aria-label={t('required')}> *</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          {...attrs}
          rows={rows}
          maxLength={30_000}
          placeholder={placeholder ? t(placeholder) : undefined}
        />
      ) : type === 'select' ? (
        <select {...attrs}>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...attrs}
          type={type}
          min={min}
          max={max}
          step={type === 'number' ? 'any' : undefined}
          maxLength={
            type === 'text' ? (name === 'title' || name === 'name' ? 180 : 30_000) : undefined
          }
          placeholder={placeholder ? t(placeholder) : undefined}
        />
      )}
      {hint && <small id={`${id}-hint`}>{t(hint)}</small>}
    </div>
  );
}
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`badge ${tone}`}>{typeof children === 'string' ? t(children) : children}</span>
  );
}
export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div className="notice error" role="alert">
      <AlertTriangle size={18} />
      <div>{typeof children === 'string' ? t(children) : children}</div>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <AlertTriangle size={17} />
      <div>{typeof children === 'string' ? t(children) : children}</div>
    </div>
  );
}
export function Empty({
  title,
  children,
  action,
  onAction,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Plus />
      </div>
      <h3>{t(title)}</h3>
      <p>{children}</p>
      {action && (
        <button className="button primary" onClick={onAction}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}
export function TextBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="text-block">
      <h3>{t(title)}</h3>
      <div className="prose">{children || <span className="muted">{t('Not recorded')}</span>}</div>
    </section>
  );
}
export function ToolLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
