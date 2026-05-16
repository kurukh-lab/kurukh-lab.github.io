import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  weight?: number;
  fill?: string;
  color?: string;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const make =
  (paths: ReactNode, defaultSize = 18) =>
  ({ size = defaultSize, weight, fill, color, ...rest }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      fill={fill || 'none'}
      stroke={color || 'currentColor'}
      strokeWidth={weight || base.strokeWidth}
      aria-hidden="true"
      {...rest}
    >
      {paths}
    </svg>
  );

export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);
export const IconSpeaker = make(
  <>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M16 8c2 1.5 2 6.5 0 8" />
    <path d="M19 5c3 3 3 11 0 14" />
  </>,
);
export const IconBookmark = make(<path d="M6 4h12v17l-6-4-6 4z" />);
export const IconHeart = make(
  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
);
export const IconShare = make(
  <>
    <path d="M12 3v13" />
    <path d="m7 8 5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </>,
);
export const IconArrow = make(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
);
export const IconBack = make(
  <>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </>,
);
export const IconSun = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>,
);
export const IconMoon = make(
  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h10" />, 22);
export const IconGlobe = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </>,
);
export const IconClose = make(<path d="M18 6 6 18M6 6l12 12" />);

interface IconPlayProps {
  size?: number;
  color?: string;
}
export const IconPlay = ({ size = 16, color }: IconPlayProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color || 'currentColor'}
    aria-hidden="true"
  >
    <path d="M6 4l14 8-14 8z" />
  </svg>
);
