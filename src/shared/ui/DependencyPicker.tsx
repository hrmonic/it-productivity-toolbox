import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import { t } from '../i18n';

type Option = { value: string; label: string };
export function DependencyPicker({
  label,
  options,
  value,
  defaultValue = [],
  onChange,
  name,
}: {
  label: string;
  options: Option[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  name?: string;
}) {
  const [internal, setInternal] = useState(defaultValue),
    [query, setQuery] = useState('');
  const id = useId(),
    selected = value ?? internal;
  const visible = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  function toggle(key: string, checked: boolean) {
    const next = checked ? [...selected, key] : selected.filter((item) => item !== key);
    setInternal(next);
    onChange?.(next);
  }
  return (
    <fieldset className="dependency-picker" aria-describedby={`${id}-hint`}>
      <legend>
        {label}
        <span className="count">{selected.length}</span>
      </legend>
      <p id={`${id}-hint`}>
        {t('Select the deliverables this work depends on. No keyboard modifiers needed.')}
      </p>
      {options.length > 6 && (
        <label className="dependency-search">
          <Search size={16} />
          <input
            aria-label={t('Search dependencies')}
            placeholder={t('Search deliverables…')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}
      <div className="dependency-options">
        {visible.map((option) => (
          <label key={option.value}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
        {!visible.length && (
          <span className="muted small">
            {options.length
              ? t('No matching deliverables')
              : t('No other deliverables available yet.')}
          </span>
        )}
      </div>
      {name && selected.map((item) => <input key={item} type="hidden" name={name} value={item} />)}
    </fieldset>
  );
}
