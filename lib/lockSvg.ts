import { LockColor, LockShape, COLOR_HEX } from './types';

/**
 * Flat sticker-style lock SVG (Y2K vibe):
 * - Solid color body
 * - Thick black outline (sticker)
 * - Hard black offset shadow (no blur)
 * - White inner highlight strip
 * - Chrome shackle with dotted highlight
 */

function shapePath(shape: LockShape): string {
  switch (shape) {
    case 'heart':
      return 'M50 132 C20 112 4 90 4 70 C4 56 16 48 28 52 C38 55 45 61 50 70 C55 61 62 55 72 52 C84 48 96 56 96 70 C96 90 80 112 50 132 Z';
    case 'circle':
      return 'M50 54 A38 38 0 1 0 50 130 A38 38 0 1 0 50 54 Z';
    case 'square':
    default:
      return 'M16 56 H84 Q92 56 92 64 V120 Q92 128 84 128 H16 Q8 128 8 120 V64 Q8 56 16 56 Z';
  }
}

// Approximate vertical center of body shape for keyhole placement
function keyholeY(shape: LockShape): number {
  switch (shape) {
    case 'heart':
      return 88;
    case 'circle':
      return 92;
    default:
      return 90;
  }
}

export function buildLockSvg(color: LockColor, shape: LockShape, size = 48): string {
  const hex = COLOR_HEX[color];
  const path = shapePath(shape);
  const ky = keyholeY(shape);

  // Only show sparkles at larger sizes (preview/modal) — keep markers crisp
  const sparkles =
    size >= 96
      ? `
    <g stroke="#000" stroke-width="2.5" stroke-linejoin="round">
      <path d="M88 14 L92 24 L102 28 L92 32 L88 42 L84 32 L74 28 L84 24 Z" fill="#fff"/>
      <path d="M10 92 L13 100 L21 103 L13 106 L10 114 L7 106 L-1 103 L7 100 Z" fill="#FFE600"/>
    </g>
    <circle cx="95" cy="58" r="3.5" fill="#fff" stroke="#000" stroke-width="2"/>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 108 146" width="${size}" height="${Math.round(
    size * 1.4
  )}">
    <!-- offset hard shadow -->
    <g transform="translate(5,5)">
      <path d="M30 58 Q30 24 50 24 Q70 24 70 58" stroke="#000" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="${path}" fill="#000"/>
    </g>
    <!-- shackle outline + chrome fill -->
    <path d="M30 58 Q30 24 50 24 Q70 24 70 58" stroke="#000" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M30 58 Q30 30 50 30 Q70 30 70 58" stroke="#C8C8DC" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- body -->
    <path d="${path}" fill="${hex}" stroke="#000" stroke-width="5" stroke-linejoin="round"/>
    <!-- inner white highlight -->
    <path d="M22 ${ky - 18} Q22 ${ky - 24} 28 ${ky - 24} Q31 ${ky - 24} 31 ${
    ky - 16
  } L31 ${ky + 10} Q31 ${ky + 16} 25 ${ky + 16} Q22 ${ky + 16} 22 ${ky + 10} Z" fill="#fff" opacity="0.5"/>
    <!-- keyhole -->
    <circle cx="50" cy="${ky}" r="6" fill="#000"/>
    <rect x="47" y="${ky}" width="6" height="14" fill="#000" rx="1"/>
    ${sparkles}
  </svg>`;
}

export function lockSvgDataUrl(color: LockColor, shape: LockShape, size = 48): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildLockSvg(color, shape, size))}`;
}

/** Picker marker — dashed-outline pink sticker shown while choosing a location. */
export function pickerSvg(size = 56): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 108 146" width="${size}" height="${Math.round(
    size * 1.4
  )}">
    <g transform="translate(5,5)">
      <path d="M30 58 Q30 24 50 24 Q70 24 70 58" stroke="#000" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M16 56 H84 Q92 56 92 64 V120 Q92 128 84 128 H16 Q8 128 8 120 V64 Q8 56 16 56 Z" fill="#000"/>
    </g>
    <path d="M30 58 Q30 24 50 24 Q70 24 70 58" stroke="#000" stroke-width="11" fill="none" stroke-linecap="round" stroke-dasharray="7 5"/>
    <path d="M30 58 Q30 30 50 30 Q70 30 70 58" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6 4"/>
    <path d="M16 56 H84 Q92 56 92 64 V120 Q92 128 84 128 H16 Q8 128 8 120 V64 Q8 56 16 56 Z"
          fill="#FF2E93" stroke="#000" stroke-width="5" stroke-linejoin="round" stroke-dasharray="9 5"/>
    <circle cx="50" cy="90" r="6" fill="#000"/>
    <rect x="47" y="90" width="6" height="14" fill="#000" rx="1"/>
  </svg>`;
}

export function pickerSvgDataUrl(size = 56): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(pickerSvg(size))}`;
}
