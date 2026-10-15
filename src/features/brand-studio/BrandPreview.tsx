import type { CSSProperties, ReactNode } from 'react';
import type { BrandProfile } from '../../shared/types/brand';
import { t } from '../../shared/i18n';
import { readableOn } from './domain';

function brandStyle(b: BrandProfile): CSSProperties {
  return {
    '--doc-bg': b.background,
    '--doc-text': b.textColor,
    '--doc-title': b.titleColor,
    '--doc-primary': b.primary,
    '--doc-accent': b.accent,
    '--doc-cover-text': readableOn(b.primary),
    '--doc-heading-font': b.headingFont,
    fontFamily: b.bodyFont,
  } as CSSProperties;
}
export function BrandedDocument({ brand, children }: { brand: BrandProfile; children: ReactNode }) {
  return (
    <div className={`template-${brand.template}`} style={brandStyle(brand)}>
      {children}
    </div>
  );
}
export function BrandLogo({ brand }: { brand: BrandProfile }) {
  return brand.logo ? (
    <img
      className={`document-logo ${brand.logoPosition}`}
      src={brand.logo}
      alt={brand.company || t('Company logo')}
    />
  ) : null;
}
export default function BrandPreview({ brand }: { brand: BrandProfile }) {
  return (
    <BrandedDocument brand={brand}>
      <article className="document-page document-cover">
        <BrandLogo brand={brand} />
        <p className="eyebrow">{brand.company || t('Your company')}</p>
        <h2>{t('Project Executive Brief')}</h2>
        <p style={{ fontFamily: brand.subtitleFont }}>
          {t('Decisions, scope and requirements in one document.')}
        </p>
        <footer>{t('Illustrative preview · fictional values')}</footer>
      </article>
      <div className="brand-samples">
        <article className="document-page">
          <h3>{t('Chart preview')}</h3>
          <p>{t('Illustrative values: 16 / 20 / 24')}</p>
          <div
            className="sample-bars"
            role="img"
            aria-label={t('Illustrative values: 16 / 20 / 24')}
          >
            <span style={{ width: '67%' }} />
            <span style={{ width: '83%', background: brand.secondary }} />
            <span style={{ width: '100%', background: brand.accent }} />
          </div>
        </article>
        <article className="document-page">
          <h3>{t('Table preview')}</h3>
          <table className="sample-table">
            <thead>
              <tr>
                <th>{t('Status')}</th>
                <th>{t('Owner')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('Proposed')}</td>
                <td>{t('Not recorded')}</td>
              </tr>
              <tr>
                <td>{t('Accepted')}</td>
                <td>{t('Not recorded')}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
      <article className="document-page">
        <small>{brand.header}</small>
        <h3>{t('Report page preview')}</h3>
        <p>
          {t(
            'Recorded facts, estimates and open questions remain distinct. Review the selected data before sharing.',
          )}
        </p>
        <footer>{brand.footer || t('Internal project review')} · 1</footer>
      </article>
    </BrandedDocument>
  );
}
