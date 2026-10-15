import { brandSchema, type BrandProfile } from '../../shared/types/brand';
import { uid } from '../../shared/lib/utils';

export const templateNames = {
  minimal: 'Minimal Corporate',
  executive: 'Executive',
  technology: 'Modern Technology',
  editorial: 'Editorial',
  data: 'Data Focused',
};
export function newBrand(): BrandProfile {
  return {
    id: uid(),
    name: 'Corporate',
    company: '',
    primary: '#4338ca',
    secondary: '#334155',
    accent: '#0f766e',
    titleColor: '#182445',
    textColor: '#263247',
    background: '#ffffff',
    headingFont: 'Arial',
    subtitleFont: 'Arial',
    bodyFont: 'Arial',
    template: 'minimal',
    header: '',
    footer: '',
    logo: '',
    logoPosition: 'left',
  };
}
export function duplicateBrand(profile: BrandProfile) {
  return brandSchema.parse({ ...profile, id: uid(), name: `${profile.name.slice(0, 90)} (copy)` });
}
export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const channels = hex
      .slice(1)
      .match(/../g)!
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const readableOn = (background: string) =>
  contrast('#ffffff', background) >= contrast('#111111', background) ? '#ffffff' : '#111111';
export function brandProblems(b: BrandProfile) {
  return [
    contrast(b.textColor, b.background) < 4.5 ? 'Body text contrast is below 4.5:1.' : '',
    contrast(b.titleColor, b.background) < 4.5 ? 'Heading contrast is below 4.5:1.' : '',
  ].filter(Boolean);
}

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export function rasterType(bytes: Uint8Array) {
  if (
    bytes[0] === 137 &&
    String.fromCharCode(...bytes.slice(1, 4)) === 'PNG' &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10
  )
    return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
    return 'image/webp';
  throw new Error('Choose a real PNG, JPEG or WebP image. SVG is not supported.');
}
export async function importLogo(file: File): Promise<string> {
  if (!file.size || file.size > MAX_LOGO_BYTES)
    throw new Error('The logo must be smaller than 2 MiB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = rasterType(bytes);
  const dimensions = rasterDimensions(bytes, type);
  if (
    dimensions.width < 1 ||
    dimensions.height < 1 ||
    dimensions.width > 4096 ||
    dimensions.height > 4096
  )
    throw new Error('Logo dimensions must not exceed 4096 pixels.');
  const bitmap = await createImageBitmap(new Blob([bytes], { type }));
  try {
    if (bitmap.width > 4096 || bitmap.height > 4096)
      throw new Error('Logo dimensions must not exceed 4096 pixels.');
    const ratio = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image conversion is unavailable.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/png');
    if (result.length > 600_000)
      throw new Error('The normalized logo is too large. Use a simpler or smaller image.');
    return result;
  } finally {
    bitmap.close();
  }
}

export function rasterDimensions(bytes: Uint8Array, type = rasterType(bytes)) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (type === 'image/png' && bytes.length >= 24)
    return { width: view.getUint32(16), height: view.getUint32(20) };
  if (type === 'image/jpeg') {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) break;
      const marker = bytes[offset + 1]!;
      if (marker === 255) {
        offset++;
        continue;
      }
      if (marker === 217 || marker === 218) break;
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length) break;
      if (
        [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) &&
        length >= 7
      )
        return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) };
      offset += length + 2;
    }
  }
  if (type === 'image/webp' && bytes.length >= 30) {
    const tag = String.fromCharCode(...bytes.slice(12, 16));
    if (tag === 'VP8X')
      return {
        width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16),
        height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16),
      };
    if (tag === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42)
      return { width: view.getUint16(26, true) & 16383, height: view.getUint16(28, true) & 16383 };
    if (tag === 'VP8L' && bytes[20] === 47)
      return {
        width: 1 + ((bytes[22]! & 63) << 8) + bytes[21]!,
        height: 1 + ((bytes[24]! & 15) << 10) + (bytes[23]! << 2) + (bytes[22]! >> 6),
      };
  }
  throw new Error('The image dimensions could not be read. Choose another PNG, JPEG or WebP file.');
}
