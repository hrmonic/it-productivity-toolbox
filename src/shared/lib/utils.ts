export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const today = () => new Date().toLocaleDateString('en-CA');
export const lines = (value: string) =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
export const tags = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
export const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));

export function download(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function csv(rows: (string | number | null)[][]) {
  // Neutralize spreadsheet formulas, including leading whitespace/control characters.
  return rows
    .map((row) =>
      row
        .map((value) => {
          let cell = String(value ?? '');
          const firstCharacter = [...cell.trimStart()].find(
            (character) => character.charCodeAt(0) > 31,
          );
          if (typeof value === 'string' && firstCharacter && '=+-@'.includes(firstCharacter))
            cell = `'${cell}`;
          return `"${cell.replaceAll('"', '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Your changes were not saved.';
}
