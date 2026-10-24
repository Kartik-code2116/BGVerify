import React, { useState } from 'react';
import { MODERN_COLOR_PRESETS, resolveSectorColor, hexToRgba } from './SectorBadge';
import SectorBadge from './SectorBadge';
import { Check, Sparkles, Pipette, Palette, Eye } from 'lucide-react';

const QUICK_NEON_SWATCHES = [
  { hex: '#00F0FF', name: 'Cyber Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#8B5CF6', name: 'Hyper Violet' },
  { hex: '#F43F5E', name: 'Neon Coral' },
  { hex: '#F59E0B', name: 'Amber Glow' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#EC4899', name: 'Hot Pink' },
  { hex: '#84CC16', name: 'Lime Pulse' },
];

export default function SectorColorPicker({
  value = 'cyan',
  onChange,
  sectorName = 'Custom Sector',
}) {
  const [mode, setMode] = useState(
    value?.startsWith('#') ? 'custom' : 'presets'
  );
  const [customHex, setCustomHex] = useState(
    value?.startsWith('#') ? value : '#06B6D4'
  );
  const [previewVariant, setPreviewVariant] = useState('glow'); // 'glow' | 'gradient' | 'subtle'

  const activeColorConfig = resolveSectorColor(value);

  const handlePresetSelect = (presetId) => {
    onChange(presetId);
  };

  const handleCustomHexChange = (newHex) => {
    let formatted = newHex;
    if (!formatted.startsWith('#') && /^[0-9a-fA-F]{1,6}$/.test(formatted)) {
      formatted = `#${formatted}`;
    }
    setCustomHex(formatted);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(formatted)) {
      onChange(formatted);
    }
  };

  const handleNativePickerChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCustomHex(val);
    onChange(val);
  };

  return (
    <div className="space-y-3.5 p-3.5 rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-md">
      {/* Top Header & Mode Toggle Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Palette size={14} className="text-primary-400" />
          <span>Sector Badge Color Theme</span>
        </div>

        <div className="inline-flex p-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'presets'
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Curated Themes
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('custom');
              if (!value?.startsWith('#')) {
                onChange(customHex);
              }
            }}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              mode === 'custom'
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pipette size={11} />
            Custom HEX
          </button>
        </div>
      </div>

      {/* Mode 1: Curated Modern Color Themes Swatches */}
      {mode === 'presets' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODERN_COLOR_PRESETS.map((preset) => {
            const isSelected = value?.toLowerCase() === preset.id.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`relative flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'border-white/50 bg-slate-800/90 shadow-md ring-2 ring-primary-500/50 scale-[1.02]'
                    : 'border-slate-800/80 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
                title={preset.label}
              >
                {/* Glowing Color Orb */}
                <span
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: preset.hex,
                    boxShadow: isSelected ? preset.glow : 'none',
                  }}
                >
                  {isSelected && <Check size={10} className="text-white drop-shadow" />}
                </span>

                <span className="text-[11px] font-medium text-slate-300 truncate">
                  {preset.label.split('/')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 2: Modern Custom Eye-Dropper & Hex Code */}
      {mode === 'custom' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            {/* Color Dropper Button */}
            <div className="relative group shrink-0">
              <input
                type="color"
                value={customHex.length === 7 ? customHex : '#06B6D4'}
                onChange={handleNativePickerChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                title="Click to open color palette"
              />
              <div
                className="w-10 h-10 rounded-xl border-2 border-white/40 shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: customHex,
                  boxShadow: `0 0 16px ${hexToRgba(customHex, 0.4)}`,
                }}
              >
                <Pipette size={16} className="text-white drop-shadow-md" />
              </div>
            </div>

            {/* HEX Input */}
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">
                Hex Color Code (e.g. #8B5CF6)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={7}
                  value={customHex}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  placeholder="#06B6D4"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Modern Neon Accent Suggestions */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
              Popular Neon Accents:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NEON_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => {
                    setCustomHex(swatch.hex);
                    onChange(swatch.hex);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 transition-all ${
                    value?.toUpperCase() === swatch.hex
                      ? 'border-white text-white font-bold ring-1 ring-white/60'
                      : 'border-slate-700/80 text-slate-300 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: hexToRgba(swatch.hex, 0.12) }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Dynamic Badge Preview Card */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Eye size={12} className="text-slate-400" />
          <span>Real-time Badge Preview:</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Variant Selector */}
          <div className="inline-flex rounded-md bg-slate-950/60 p-0.5 border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setPreviewVariant('glow')}
              className={`px-2 py-0.5 rounded ${
                previewVariant === 'glow' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Glow
            </button>
            <button
              type="button"
              onClick={() => setPreviewVariant('gradient')}
              className={`px-2 py-0.5 rounded ${
                previewVariant === 'gradient' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Gradient
            </button>
          </div>

          {/* Actual Rendered Badge */}
          <SectorBadge
            sector={sectorName || 'Preview Sector'}
            color={value}
            variant={previewVariant}
            size="sm"
            showDot={true}
          />
        </div>
      </div>
    </div>
  );
}
