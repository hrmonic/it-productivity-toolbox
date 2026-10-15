import type { BrandProfile } from '../../shared/types/brand';
import type { ReportModel } from './model';
import { layoutReport, type DocumentPage } from './layout';
import { csv } from '../../shared/lib/utils';
import { translate } from '../../shared/i18n';

export type ExportFormat = 'pdf' | 'pptx' | 'xlsx' | 'json' | 'markdown' | 'csv';
export type ExportProgress = {
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
};
async function checkpoint(progress: ExportProgress, done: number, total: number) {
  progress.signal?.throwIfAborted();
  progress.onProgress?.(done, total);
  await new Promise((resolve) => setTimeout(resolve, 0));
  progress.signal?.throwIfAborted();
}
export const fontFile = (family: string) =>
  ({ Georgia: 'NotoSerif', 'Courier New': 'NotoSansMono' })[family] ?? 'NotoSans';
export function reportMarkdown(m: ReportModel) {
  const tr = (s: string) => translate(s, m.options.language);
  return `# ${m.options.title}\n\n${m.projectName}\n${new Date(m.generatedAt).toLocaleDateString(m.options.language)}\n${m.fictional ? tr('Fictional example data') : ''}\n\n${m.sections.map((s) => `## ${s.title}\n\n${s.entries.map((e) => `### ${e.title}\n\n${e.fields.map((f) => `**${f.label}**\n\n${f.text}`).join('\n\n')}\n\n${tr('Sources')}: ${e.sourceIds.join(', ')}`).join('\n\n')}`).join('\n\n')}`;
}
export function reportRows(m: ReportModel): (string | number | null)[][] {
  const tr = (s: string) => translate(s, m.options.language);
  return [
    [tr('Project'), tr('Section'), tr('Record'), tr('Field'), tr('Content'), tr('Sources')],
    ...m.sections.flatMap((s) =>
      s.entries.flatMap((e) =>
        e.fields.flatMap((f) =>
          textChunks(f.text).map((text, index) => [
            m.projectName,
            s.title,
            e.title,
            index ? `${f.label} (${tr('continued')} ${index + 1})` : f.label,
            text,
            e.sourceIds.join('; '),
          ]),
        ),
      ),
    ),
  ];
}
export function textChunks(text: string, limit = 30_000) {
  const chunks: string[] = [];
  for (let offset = 0; offset < text.length;) {
    let end = Math.min(text.length, offset + limit);
    if (end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1]!)) end--;
    chunks.push(text.slice(offset, end));
    offset = end;
  }
  return chunks.length ? chunks : [''];
}
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function makePdf(m: ReportModel, b: BrandProfile, progress: ExportProgress) {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
    import('pdf-lib'),
    import('@pdf-lib/fontkit'),
  ]);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(m.options.title);
  pdf.setAuthor(b.company || 'IT Productivity Toolbox');
  pdf.setSubject(m.projectName);
  pdf.setCreationDate(new Date(m.generatedAt));
  const families = [...new Set([b.bodyFont, b.headingFont, b.subtitleFont, 'Courier New'])];
  const embedded = new Map<string, Awaited<ReturnType<typeof pdf.embedFont>>>();
  for (const family of families) {
    const response = await fetch(
      `${import.meta.env.BASE_URL}fonts/${fontFile(family)}-Regular.ttf`,
      { signal: progress.signal },
    );
    if (!response.ok) throw new Error('The local document font could not be loaded.');
    embedded.set(family, await pdf.embedFont(await response.arrayBuffer(), { subset: true }));
  }
  const characterSets = new Map(
    [...embedded].map(([family, font]) => [family, new Set(font.getCharacterSet())]),
  );
  const fontFor = (text: string, family: string) => {
    const supports = (name: string) =>
      [...text].every((c) => characterSets.get(name)!.has(c.codePointAt(0)!));
    if (supports(family)) return embedded.get(family)!;
    if (supports('Courier New')) return embedded.get('Courier New')!;
    throw new Error(
      'The document contains characters unavailable in the embedded fonts. Choose a structured export to preserve them.',
    );
  };
  const measure = (text: string, size: number, family: string) =>
    fontFor(text, family).widthOfTextAtSize(text, size);
  const pages = layoutReport(m, b, 'pdf', measure);
  const color = (hex: string) =>
    rgb(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    );
  const logo = b.logo ? await pdf.embedPng(b.logo) : null;
  for (const [i, p] of pages.entries()) {
    await checkpoint(progress, i, pages.length);
    const page = pdf.addPage([p.width, p.height]);
    for (const r of p.rects)
      page.drawRectangle({
        x: r.x,
        y: p.height - r.y - r.height,
        width: r.width,
        height: r.height,
        color: color(r.color),
      });
    for (const text of p.texts) {
      const font = fontFor(text.text, text.font);
      page.drawText(text.text, {
        x: text.x,
        y: p.height - text.y - text.size,
        size: text.size,
        font,
        color: color(text.color),
      });
    }
    if (logo && p.logo) {
      const r = p.logo,
        scale = Math.min(r.width / logo.width, r.height / logo.height);
      page.drawImage(logo, {
        x: r.x,
        y: p.height - r.y - logo.height * scale,
        width: logo.width * scale,
        height: logo.height * scale,
      });
    }
  }
  await checkpoint(progress, pages.length, pages.length);
  return new Blob([new Uint8Array(await pdf.save())], { type: 'application/pdf' });
}
async function makePptx(m: ReportModel, b: BrandProfile, progress: ExportProgress) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = b.company || 'IT Productivity Toolbox';
  pptx.title = m.options.title;
  pptx.subject = m.projectName;
  const lang = m.options.language === 'fr' ? 'fr-FR' : 'en-US';
  const pages = layoutReport(m, b, 'pptx');
  const scale = 13.333333 / 1120;
  for (const [i, p] of pages.entries()) {
    await checkpoint(progress, i, pages.length);
    const slide = pptx.addSlide();
    for (const r of p.rects)
      slide.addShape(pptx.ShapeType.rect, {
        x: r.x * scale,
        y: r.y * scale,
        w: r.width * scale,
        h: r.height * scale,
        line: { transparency: 100 },
        fill: { color: r.color.slice(1) },
      });
    for (const text of p.texts)
      slide.addText(text.text, {
        x: text.x * scale,
        y: text.y * scale,
        w: text.width * scale,
        h: text.height * scale,
        fontFace: text.font,
        fontSize: text.size * scale * 72,
        color: text.color.slice(1),
        margin: 0,
        breakLine: false,
        valign: 'top',
        lang,
      });
    if (b.logo && p.logo)
      slide.addImage({ data: b.logo, ...pptxgenjsSizing(b.logo, p.logo, scale) });
    slide.addNotes(`${m.projectName}\n${m.projectId}\n${m.generatedAt}\n${p.title}`);
  }
  const data = await pptx.write({ outputType: 'blob', compression: true });
  await checkpoint(progress, pages.length, pages.length);
  return data as Blob;
}
function pptxgenjsSizing(
  data: string,
  r: { x: number; y: number; width: number; height: number },
  scale: number,
) {
  // Normalized PNG headers contain the intrinsic dimensions (big endian IHDR).
  const bytes = Uint8Array.from(atob(data.split(',')[1]!), (c) => c.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  const w = view.getUint32(16),
    h = view.getUint32(20);
  const factor = Math.min(r.width / w, r.height / h) * scale;
  return { x: r.x * scale, y: r.y * scale, w: w * factor, h: h * factor };
}
async function makeXlsx(m: ReportModel, b: BrandProfile, progress: ExportProgress) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = b.company || 'IT Productivity Toolbox';
  workbook.created = new Date(m.generatedAt);
  const sheet = workbook.addWorksheet('Report', { views: [{ state: 'frozen', ySplit: 4 }] });
  sheet.addRow([m.options.title]);
  sheet.addRow([
    m.projectName,
    m.generatedAt,
    m.fictional ? translate('Fictional example data', m.options.language) : '',
  ]);
  sheet.addRow([]);
  const rows = reportRows(m);
  for (let i = 0; i < rows.length; i++) {
    if (i % 100 === 0) await checkpoint(progress, i, rows.length);
    sheet.addRow(rows[i]!);
  }
  sheet.columns.forEach((column, index) => {
    column.width = [24, 24, 40, 30, 80, 45][index];
    column.alignment = { vertical: 'top', wrapText: true };
    column.font = { name: b.bodyFont, size: 11, color: { argb: `FF${b.textColor.slice(1)}` } };
  });
  sheet.getRow(1).font = { name: b.headingFont, size: 20, bold: true };
  sheet.getRow(4).font = {
    name: b.subtitleFont,
    bold: true,
    color: { argb: `FF${readableColor(b.primary)}` },
  };
  sheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: `FF${b.primary.slice(1)}` },
  };
  sheet.autoFilter = { from: 'A4', to: 'F4' };
  const buffer = await workbook.xlsx.writeBuffer();
  await checkpoint(progress, rows.length, rows.length);
  return new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
function readableColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160 ? '111111' : 'FFFFFF';
}
export async function renderReport(
  m: ReportModel,
  b: BrandProfile,
  format: ExportFormat,
  progress: ExportProgress = {},
): Promise<Blob> {
  await checkpoint(progress, 0, 1);
  if (!m.sections.length) throw new Error('Select content before generating a report.');
  if (format === 'pdf') return makePdf(m, b, progress);
  if (format === 'pptx') return makePptx(m, b, progress);
  if (format === 'xlsx') return makeXlsx(m, b, progress);
  if (format === 'json')
    return new Blob([JSON.stringify(m, null, 2)], { type: 'application/json' });
  if (format === 'markdown')
    return new Blob([reportMarkdown(m)], { type: 'text/markdown;charset=utf-8' });
  return new Blob([csv(reportRows(m))], { type: 'text/csv;charset=utf-8' });
}
export function pageSvg(p: DocumentPage, brand: BrandProfile) {
  const escape = (s: string) =>
    s.replace(
      /[<>&"']/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
    );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}">${p.rects.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.color}"/>`).join('')}${p.texts.map((t) => `<text x="${t.x}" y="${t.y + t.size}" font-family="${escape(t.font)}" font-size="${t.size}" fill="${t.color}">${escape(t.text)}</text>`).join('')}${p.logo && brand.logo ? `<image href="${brand.logo}" x="${p.logo.x}" y="${p.logo.y}" width="${p.logo.width}" height="${p.logo.height}" preserveAspectRatio="xMinYMin meet"/>` : ''}</svg>`;
}
