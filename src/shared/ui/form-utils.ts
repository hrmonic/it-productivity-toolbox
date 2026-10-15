import { label } from '../lib/format';

export const options = (values: string[], context?: string) =>
  values.map((value) => ({ value, label: label(value, context) }));
export const val = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
