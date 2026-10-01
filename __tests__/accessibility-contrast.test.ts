import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

function token(name: string, block: string): string {
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`Missing CSS color token ${name}`);
  return match[1];
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const values = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
    const linear = values.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('accessible color contrast', () => {
  const root = css.match(/:root\s*\{([\s\S]*?)\n  \}/)?.[1] ?? '';
  const highContrast = css.match(/\.high-contrast\s*\{([\s\S]*?)\n  \}/)?.[1] ?? '';
  const muted = token('--hello-muted', root);
  const canvas = token('--hello-canvas', root);
  const body = token('--hello-body', root);
  const surface = token('--hello-surface', root);
  const primary = token('--hello-primary', root);
  const primarySoft = token('--hello-primary-soft', root);
  const clay = token('--hello-clay', root);
  const highContrastMuted = token('--hello-muted', highContrast);
  const indigoText = css.match(/\[class~="text-indigo-200"\]\s*\{\s*color:\s*(#[0-9a-f]{6})/i)?.[1];

  it('keeps common body, muted, action, and voice-label text at WCAG AA contrast', () => {
    expect(contrastRatio(muted, canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(body, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#ffffff', primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#ffffff', clay)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#625276', '#eeeaf3')).toBeGreaterThanOrEqual(4.5);
    expect(indigoText).toBe('#625276');
  });

  it('keeps the selected navigation accent and high-contrast helper text readable', () => {
    expect(contrastRatio(primary, primarySoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(highContrastMuted, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});
