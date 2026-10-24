import React from 'react';
import { Layers } from 'lucide-react';

export const MODERN_COLOR_PRESETS = [
  { id: 'cyan', label: 'Cyber Cyan', hex: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)', glow: '0 0 12px rgba(6, 182, 212, 0.25)' },
  { id: 'emerald', label: 'Emerald Mint', hex: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', glow: '0 0 12px rgba(16, 185, 129, 0.25)' },
  { id: 'rose', label: 'Neon Rose', hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.14)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.35)', glow: '0 0 12px rgba(244, 63, 94, 0.25)' },
  { id: 'amber', label: 'Warm Amber', hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)', glow: '0 0 12px rgba(245, 158, 11, 0.25)' },
  { id: 'purple', label: 'Royal Purple', hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.35)', glow: '0 0 12px rgba(168, 85, 247, 0.25)' },
  { id: 'indigo', label: 'Electric Indigo', hex: '#6366f1', bg: 'rgba(99, 102, 241, 0.14)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.35)', glow: '0 0 12px rgba(99, 102, 241, 0.25)' },
  { id: 'blue', label: 'Sky Blue', hex: '#0284c7', bg: 'rgba(2, 132, 199, 0.14)', text: '#38bdf8', border: 'rgba(2, 132, 199, 0.35)', glow: '0 0 12px rgba(2, 132, 199, 0.25)' },
  { id: 'orange', label: 'Sunset Orange', hex: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.35)', glow: '0 0 12px rgba(249, 115, 22, 0.25)' },
  { id: 'teal', label: 'Teal Sage', hex: '#14b8a6', bg: 'rgba(20, 184, 166, 0.14)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.35)', glow: '0 0 12px rgba(20, 184, 166, 0.25)' },
  { id: 'fuchsia', label: 'Violet Fuchsia', hex: '#d946ef', bg: 'rgba(217, 70, 239, 0.14)', text: '#e879f9', border: 'rgba(217, 70, 239, 0.35)', glow: '0 0 12px rgba(217, 70, 239, 0.25)' },
  { id: 'ruby', label: 'Crimson Ruby', hex: '#e11d48', bg: 'rgba(225, 29, 72, 0.14)', text: '#fb7185', border: 'rgba(225, 29, 72, 0.35)', glow: '0 0 12px rgba(225, 29, 72, 0.25)' },
  { id: 'slate', label: 'Slate Steel', hex: '#64748b', bg: 'rgba(100, 116, 139, 0.14)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.35)', glow: '0 0 12px rgba(100, 116, 139, 0.25)' },
];

/**
 * Convert any 3 or 6 hex character string to rgba()
 */
export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(6, 182, 212, ${alpha})`;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return `rgba(6, 182, 212, ${alpha})`;

  const num = parseInt(clean, 16);
  if (isNaN(num)) return `rgba(6, 182, 212, ${alpha})`;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Resolve sector color styling with high-fidelity glassmorphism & glow
 */
export function resolveSectorColor(colorOrSectorName, sectorsList = []) {
  if (!colorOrSectorName) {
    return MODERN_COLOR_PRESETS[0];
  }

  // 1. Direct match with preset id
  const presetMatch = MODERN_COLOR_PRESETS.find(
    (p) => p.id.toLowerCase() === String(colorOrSectorName).toLowerCase()
  );
  if (presetMatch) return presetMatch;

  // 2. Direct Hex match (#10b981 or 10b981)
  const isHex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(colorOrSectorName).trim());
  if (isHex) {
    const formattedHex = colorOrSectorName.startsWith('#')
      ? colorOrSectorName
      : `#${colorOrSectorName}`;
    return {
      id: 'custom',
      label: 'Custom Theme',
      hex: formattedHex,
      bg: hexToRgba(formattedHex, 0.15),
      text: formattedHex,
      border: hexToRgba(formattedHex, 0.38),
      glow: `0 0 12px ${hexToRgba(formattedHex, 0.25)}`,
    };
  }

  // 3. Match from active sectors list
  if (Array.isArray(sectorsList) && sectorsList.length > 0) {
    const matchedSector = sectorsList.find(
      (s) => s.name?.toLowerCase() === String(colorOrSectorName).toLowerCase()
    );
    if (matchedSector && matchedSector.color) {
      return resolveSectorColor(matchedSector.color);
    }
  }

  // 4. Keyword heuristic matching for common sector names
  const lower = String(colorOrSectorName).toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('it') || lower.includes('ai')) {
    return MODERN_COLOR_PRESETS[0]; // cyan
  }
  if (lower.includes('finan') || lower.includes('bfsi') || lower.includes('bank') || lower.includes('invest')) {
    return MODERN_COLOR_PRESETS[1]; // emerald
  }
  if (lower.includes('health') || lower.includes('pharma') || lower.includes('clinic') || lower.includes('bio')) {
    return MODERN_COLOR_PRESETS[2]; // rose
  }
  if (lower.includes('logis') || lower.includes('supply') || lower.includes('fleet') || lower.includes('warehous')) {
    return MODERN_COLOR_PRESETS[3]; // amber
  }
  if (lower.includes('hr') || lower.includes('human') || lower.includes('talent') || lower.includes('people')) {
    return MODERN_COLOR_PRESETS[4]; // purple
  }
  if (lower.includes('sales') || lower.includes('growth') || lower.includes('market') || lower.includes('revenue')) {
    return MODERN_COLOR_PRESETS[5]; // indigo
  }
  if (lower.includes('operat') || lower.includes('admin') || lower.includes('support')) {
    return MODERN_COLOR_PRESETS[6]; // blue
  }
  if (lower.includes('manufactur') || lower.includes('plant') || lower.includes('produce')) {
    return MODERN_COLOR_PRESETS[7]; // orange
  }
  if (lower.includes('legal') || lower.includes('audit') || lower.includes('complian')) {
    return MODERN_COLOR_PRESETS[10]; // ruby
  }

  // 5. Deterministic fallback based on string char code sum
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash + lower.charCodeAt(i)) % MODERN_COLOR_PRESETS.length;
  }
  return MODERN_COLOR_PRESETS[hash];
}

/**
 * Modern Sector Badge Component
 */
export default function SectorBadge({
  sector,
  color,
  sectorsList = [],
  size = 'sm', // 'xs', 'sm', 'md'
  variant = 'glow', // 'glow', 'pill', 'gradient', 'subtle'
  showIcon = false,
  showDot = true,
  className = '',
  style = {},
  onClick,
}) {
  const sectorName = typeof sector === 'object' && sector ? sector.name : (sector || 'General');
  const targetColor = color || (typeof sector === 'object' && sector ? sector.color : null) || sectorName;
  const config = resolveSectorColor(targetColor, sectorsList);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
  }[size] || 'px-2.5 py-0.5 text-[11px] gap-1.5';

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
  }[size] || 'w-2 h-2';

  // Base dynamic styles
  let badgeStyle = {
    backgroundColor: config.bg,
    color: config.text,
    borderColor: config.border,
    boxShadow: variant === 'glow' ? config.glow : 'none',
    ...style,
  };

  if (variant === 'gradient') {
    badgeStyle.background = `linear-gradient(135deg, ${config.bg} 0%, rgba(15, 23, 42, 0.4) 100%)`;
  }

  return (
    <span
      onClick={onClick}
      style={badgeStyle}
      className={`inline-flex items-center font-semibold rounded-full border backdrop-blur-sm transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''
      } ${sizeClasses} ${className}`}
      title={`Sector: ${sectorName}`}
    >
      {showDot && (
        <span
          className={`rounded-full shrink-0 ${dotSizes}`}
          style={{
            backgroundColor: config.text,
            boxShadow: `0 0 6px ${config.text}`,
          }}
        />
      )}

      {showIcon && <Layers size={size === 'xs' ? 10 : 12} className="shrink-0 opacity-80" />}

      <span className="truncate max-w-[200px] tracking-wide">
        {sectorName.split('&')[0].trim()}
      </span>
    </span>
  );
}
