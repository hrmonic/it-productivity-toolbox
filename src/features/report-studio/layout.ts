import type { BrandProfile } from '../../shared/types/brand';
import { readableOn } from '../brand-studio/domain';
import type { ReportModel } from './model';
import { translate } from '../../shared/i18n';

export type TextItem = {
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
  color: string;
  font: string;
  text: string;
};
export type RectItem = { x: number; y: number; width: number; height: number; color: string };
export type DocumentPage = {
  width: number;
  height: number;
  title: string;
  texts: TextItem[];
  rects: RectItem[];
  logo?: { x: number; y: number; width: number; height: number };
  cover: boolean;
};
export type MeasureText = (text: string, size: number, font: string) => number;
// Conservative fallback is also usable without a browser (unit tests and structural validation).
const fallback: MeasureText = (text, size) => [...text].length * size * 0.9;
export function wrapText(
  text: string,
  width: number,
  size: number,
  font: string,
  measure: MeasureText = fallback,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const token of paragraph.split(/(\s+)/).filter(Boolean)) {
      if (line && measure(line + token, size, font) > width) {
        lines.push(line.trimEnd());
        line = '';
      }
      for (const char of token) {
        if (line && measure(line + char, size, font) > width) {
          lines.push(line.trimEnd());
          line = '';
        }
        if (line || char.trim()) line += char;
      }
    }
    if (line) lines.push(line.trimEnd());
  }
  return lines;
}
export function layoutReport(
  model: ReportModel,
  brand: BrandProfile,
  format: 'pdf' | 'pptx',
  measure: MeasureText = fallback,
): DocumentPage[] {
  const tr = (s: string) => translate(s, model.options.language);
  const width = format === 'pdf' ? 794 : 1120,
    height = format === 'pdf' ? 1123 : 630;
  const margin = format === 'pdf' ? 54 : 64,
    usable = width - margin * 2;
  const bodySize = format === 'pdf' ? 15 : 20;
  const pages: DocumentPage[] = [];
  const addLine = (
    p: DocumentPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: string,
    color: string,
    w = usable,
  ) => p.texts.push({ text, x, y, size, font, color, width: w, height: size * 1.4 });
  function create(title: string, cover = false): DocumentPage {
    if (pages.length >= 500)
      throw new Error(
        'The report exceeds 500 pages. Reduce the selection or choose a structured export.',
      );
    const p: DocumentPage = {
      width,
      height,
      title,
      texts: [],
      rects: [{ x: 0, y: 0, width, height, color: brand.background }],
      cover,
    };
    const footer = `${brand.footer || model.projectName} · ${pages.length + 1}`;
    const footerLines = wrapText(footer, usable, 10, brand.bodyFont, measure);
    if (footerLines.length > 2)
      throw new Error('The header or footer is too long. Shorten it in Brand Studio.');
    footerLines.forEach((line, i) =>
      addLine(p, line, margin, height - 44 + i * 13, 10, brand.bodyFont, brand.textColor),
    );
    if (!cover) {
      p.rects.push({ x: margin, y: 42, width: 44, height: 4, color: brand.accent });
      wrapText(title, usable, 25, brand.headingFont, measure).forEach((line, i) =>
        addLine(p, line, margin, 58 + i * 35, 25, brand.headingFont, brand.titleColor),
      );
      if (brand.header) {
        const headerLines = wrapText(brand.header, usable, 10, brand.subtitleFont, measure);
        if (headerLines.length > 2)
          throw new Error('The header or footer is too long. Shorten it in Brand Studio.');
        headerLines.forEach((line, i) =>
          addLine(p, line, margin, 16 + i * 13, 10, brand.subtitleFont, brand.textColor),
        );
      }
    }
    pages.push(p);
    return p;
  }
  const cover = create(model.options.title, true);
  let coverText = brand.textColor,
    coverTitle = brand.titleColor;
  if (brand.template === 'technology') {
    cover.rects[0]!.color = brand.primary;
    coverText = coverTitle = readableOn(brand.primary);
    cover.texts.forEach((t) => {
      t.color = coverText;
    });
  } else if (brand.template === 'executive')
    cover.rects.push({ x: 0, y: 0, width: 24, height, color: brand.primary });
  else if (brand.template === 'editorial')
    cover.rects.push({ x: margin, y: height - 100, width: usable, height: 3, color: brand.accent });
  else
    cover.rects.push({
      x: 0,
      y: 0,
      width,
      height: brand.template === 'data' ? 5 : 14,
      color: brand.primary,
    });
  if (brand.logo)
    cover.logo = {
      x: brand.logoPosition === 'right' ? width - margin - 160 : margin,
      y: 56,
      width: 160,
      height: 64,
    };
  let coverY = format === 'pdf' ? 230 : 165;
  const titleSize = brand.template === 'editorial' ? 36 : 32;
  for (const line of wrapText(model.options.title, usable, titleSize, brand.headingFont, measure)) {
    addLine(cover, line, margin, coverY, titleSize, brand.headingFont, coverTitle);
    coverY += titleSize * 1.4;
  }
  for (const value of [
    brand.company,
    model.projectName,
    tr(model.options.audience),
    new Date(model.generatedAt).toLocaleDateString(model.options.language),
    model.fictional ? tr('Fictional example data') : '',
  ]) {
    if (!value) continue;
    coverY += 14;
    for (const line of wrapText(value, usable, 16, brand.subtitleFont, measure)) {
      addLine(cover, line, margin, coverY, 16, brand.subtitleFont, coverText);
      coverY += 23;
    }
  }
  if (coverY > height - 74)
    throw new Error('The cover is too long. Shorten the report title or company name.');
  for (const section of model.sections) {
    const snapshot = model.scopeSnapshot;
    if (
      section.key === 'scope' &&
      snapshot &&
      snapshot.initial !== null &&
      snapshot.current !== null
    ) {
      const chart = create(tr('Scope effort comparison'));
      const maximum = Math.max(snapshot.initial, snapshot.current, 1);
      const values = [snapshot.initial, snapshot.current];
      const number = new Intl.NumberFormat(model.options.language, { maximumFractionDigits: 2 });
      for (let i = 0; i < values.length; i++) {
        const y = 180 + i * 115;
        addLine(
          chart,
          `${tr(i === 0 ? 'Baseline' : 'Current')}: ${number.format(values[i]!)} ${snapshot.unit}`,
          margin,
          y,
          bodySize,
          brand.bodyFont,
          brand.textColor,
        );
        chart.rects.push({
          x: margin,
          y: y + 36,
          width: (usable * values[i]!) / maximum,
          height: 32,
          color: i === 0 ? brand.primary : brand.accent,
        });
      }
      addLine(
        chart,
        tr('Recorded estimates, not delivery commitments.'),
        margin,
        442,
        12,
        brand.bodyFont,
        brand.textColor,
      );
      wrapText(
        `${tr('Baseline')}: ${snapshot.sourceIds[0]}. ${tr('Recorded source records')}: ${snapshot.sourceIds.length}.`,
        usable,
        10,
        brand.bodyFont,
        measure,
      ).forEach((line, i) =>
        addLine(chart, line, margin, 474 + i * 14, 10, brand.bodyFont, brand.textColor),
      );
    }
    let page = create(section.title),
      y = 58 + wrapText(section.title, usable, 25, brand.headingFont, measure).length * 35 + 24;
    const next = () => {
      page = create(`${section.title} (${tr('continued')})`);
      y = 58 + wrapText(page.title, usable, 25, brand.headingFont, measure).length * 35 + 24;
    };
    const write = (
      text: string,
      size = bodySize,
      font = brand.bodyFont,
      color = brand.textColor,
    ) => {
      for (const line of wrapText(text, usable, size, font, measure)) {
        if (y + size * 1.5 > height - 76) next();
        addLine(page, line, margin, y, size, font, color);
        y += size * 1.45;
      }
    };
    for (const entry of section.entries) {
      if (y > height - 260) next();
      write(entry.title, bodySize + 3, brand.headingFont, brand.titleColor);
      y += 9;
      write(`${tr('Sources')}: ${entry.sourceIds.join(', ')}`, 10);
      y += 10;
      for (const field of entry.fields) {
        if (y > height - 150) next();
        write(field.label, bodySize, brand.subtitleFont, brand.titleColor);
        write(field.text);
        y += 10;
      }
      y += 22;
    }
  }
  return pages;
}
