import type { TokenLogo } from '@coinlist-co/react/universal';

/**
 * `<img>` attributes for a registry logo. Every raster variant goes into
 * `srcSet` so the browser picks the one that fits the rendered size and the
 * screen's pixel density; `src` is the original, for the SDK cards that take a
 * single URL.
 */
export type LogoImage = {
  src: string;
  srcSet?: string;
};

export function logoImage(logo: TokenLogo): LogoImage {
  if (logo.kind === 'VECTOR') return { src: logo.url };
  // The original is usually also one of the variants.
  const images = new Map(
    [...logo.variants, logo.original].map((image) => [image.url, image])
  );
  return {
    src: logo.original.url,
    srcSet: [...images.values()]
      .map((image) => `${image.url} ${image.width}w`)
      .join(', '),
  };
}
