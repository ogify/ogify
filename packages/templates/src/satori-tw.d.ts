/** Satori experimental `tw` prop on intrinsic elements. */
export {};

declare module 'react' {
  interface HTMLAttributes<T> {
    tw?: string;
  }

  interface SVGAttributes<T> {
    tw?: string;
  }
}
