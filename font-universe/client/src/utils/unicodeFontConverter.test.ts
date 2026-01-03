
import { describe, it, expect } from 'vitest';
import { convertToUnicode } from './unicodeFontConverter';

describe('unicodeFontConverter', () => {
  it('converts Serif category to Fraktur (Blackletter)', () => {
    const input = 'ABCabc';
    // 'serif' -> fraktur
    const output = convertToUnicode(input, 'serif');
    expect(output).toBeDefined();
    
    // Fraktur A (U+1D504), B (U+1D505), C (U+212D - Exception)
    // a (U+1D51E), b (U+1D51F), c (U+1D520)
    expect(output).toBe('𝔄𝔅ℭ𝔞𝔟𝔠');
  });

  it('converts Script/Cursive category to Bold Script', () => {
    const input = 'ABCabc';
    // 'script' -> bold_script
    const output = convertToUnicode(input, 'script');
    expect(output).toBe('𝓐𝓑𝓒𝓪𝓫𝓬');
    
    // 'cursive' -> bold_script
    expect(convertToUnicode(input, 'cursive')).toBe('𝓐𝓑𝓒𝓪𝓫𝓬');
  });

  it('converts Sans-Serif category to Double-Struck', () => {
    const input = 'ABCabc';
    // 'sans-serif' -> double_struck
    const output = convertToUnicode(input, 'sans-serif');
    // Double-Struck C (U+2102) is an exception
    expect(output).toBe('𝔸𝔹ℂ𝕒𝕓𝕔');
  });

  it('converts Monospace category to Typewriter', () => {
    const input = 'ABCabc123';
    // 'monospace' -> monospace
    const output = convertToUnicode(input, 'monospace');
    expect(output).toBe('𝙰𝙱𝙲𝚊𝚋𝚌123'); 
  });

  it('detects Monospace via font family metadata', () => {
    const input = 'ABC';
    // category is sans-serif, but family has 'Mono'
    const font = { category: 'sans-serif', family: 'Roboto Mono' };
    const output = convertToUnicode(input, font);
    expect(output).toBe('𝙰𝙱𝙲');
  });

  it('falls back to Bold Sans-Serif for unknown categories', () => {
    const input = 'ABCabc';
    // 'display' or 'unknown' -> bold_sans_serif
    const output = convertToUnicode(input, 'unknown_category');
    // A -> 𝗔 (0x1D5D4), a -> 𝗮 (0x1D5EE)
    expect(output).toBe('𝗔𝗕𝗖𝗮𝗯𝗰');
  });

  it('preserves special characters', () => {
    const input = 'Hello, World!';
    const output = convertToUnicode(input, 'monospace');
    expect(output).toBe('𝙷𝚎𝚕𝚕𝚘, 𝚆𝚘𝚛𝚕𝚍!');
  });
});
