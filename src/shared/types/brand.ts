import { z } from 'zod';

export const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);
export const fonts = ['Arial', 'Georgia', 'Courier New'] as const;
export const templates = ['minimal', 'executive', 'technology', 'editorial', 'data'] as const;
export const brandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  company: z.string().max(180),
  primary: colorSchema,
  secondary: colorSchema,
  accent: colorSchema,
  titleColor: colorSchema,
  textColor: colorSchema,
  background: colorSchema,
  headingFont: z.enum(fonts),
  subtitleFont: z.enum(fonts),
  bodyFont: z.enum(fonts),
  template: z.enum(templates),
  header: z.string().max(180),
  footer: z.string().max(180),
  logo: z
    .string()
    .max(600_000)
    .regex(/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/)
    .or(z.literal(''))
    .refine((value) => {
      if (!value) return true;
      try {
        const bytes = Uint8Array.from(atob(value.split(',')[1]!), (c) => c.charCodeAt(0));
        if (bytes.length < 24 || ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
          return false;
        const view = new DataView(bytes.buffer);
        const width = view.getUint32(16),
          height = view.getUint32(20);
        return width > 0 && height > 0 && width <= 640 && height <= 640;
      } catch {
        return false;
      }
    }, 'The saved logo must be a normalized PNG of at most 640 pixels.'),
  logoPosition: z.enum(['left', 'right']),
});
export type BrandProfile = z.infer<typeof brandSchema>;
