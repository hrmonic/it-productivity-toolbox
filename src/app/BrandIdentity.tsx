import { brand } from './brand';

export function BrandIdentity() {
  return (
    <>
      <img className="brand-mark" src={brand.mark} alt="" width="40" height="40" />
      <span className="brand-wordmark">
        <strong>{brand.shortName}</strong>
        <span>{brand.wordmark}</span>
      </span>
    </>
  );
}
