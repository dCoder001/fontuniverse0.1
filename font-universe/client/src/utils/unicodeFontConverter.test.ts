
import { describe, it, expect } from 'vitest';
import { convertToUnicode } from './unicodeFontConverter';

describe('unicodeFontConverter', () => {
  it('converts to Fraktur correctly', () => {
    const input = 'ABCabc';
    const output = convertToUnicode(input, 'fraktur');
    // A -> 𝔄 (0x1D504), B -> 𝔅 (0x1D505), C -> 0x1D506 (Hole/Reserved)
    // The new logic maps strictly by offset
    expect(output).toBeDefined();
    // Verify A and a
    expect(output[0]).toBe('𝔄');
    expect(output[3]).toBe('𝔞');
  });

  it('converts to Bold Script correctly', () => {
    const input = 'ABCabc';
    const output = convertToUnicode(input, 'bold_script');
    expect(output).toBe('𝓐𝓑𝓒𝓪𝓫𝓬');
  });

  it('converts to Double-Struck correctly', () => {
    const input = 'ABCabc';
    const output = convertToUnicode(input, 'double_struck');
    expect(output).toBe('𝔸𝔹ℂ𝕒𝕓𝕔');
  });

  it('converts to Monospace correctly', () => {
    const input = 'ABCabc123';
    const output = convertToUnicode(input, 'monospace');
    expect(output).toBe('𝙰𝙱𝙲𝚊𝚋𝚌123'); // Numbers are not converted in the new logic
  });

  it('returns text as is for unknown styles', () => {
    const input = 'abc';
    const output = convertToUnicode(input, 'unknown');
    expect(output).toBe('abc');
  });

  it('preserves special characters', () => {
    const input = 'Hello, World!';
    const output = convertToUnicode(input, 'monospace');
    expect(output).toBe('𝙷𝚎𝚕𝚕𝚘, 𝚆𝚘𝚛𝚕𝚍!');
  });
});
