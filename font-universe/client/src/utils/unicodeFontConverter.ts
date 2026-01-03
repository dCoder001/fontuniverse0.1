
// The Universal "Fancy Font" Converter
export type UnicodeStyle = 'fraktur' | 'bold_script' | 'double_struck' | 'monospace';

export const convertToUnicode = (text: string, style: UnicodeStyle | string): string => {
    const maps: Record<string, { upper: number; lower: number }> = {
        fraktur: { upper: 0x1D504, lower: 0x1D51E }, // 𝕯𝖊𝖊𝖕𝕾𝖊𝖊𝖐
        bold_script: { upper: 0x1D4D0, lower: 0x1D4EA }, // 𝓓𝓮𝓮𝓹𝓢𝓮𝓮𝓴
        double_struck: { upper: 0x1D538, lower: 0x1D552 }, // 𝔻𝕖𝕖𝕡𝕊𝕖𝕖𝕜
        monospace: { upper: 0x1D670, lower: 0x1D68A } // 𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔
    };

    const map = maps[style];
    if (!map) return text;

    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        // Uppercase A-Z (65-90)
        if (code >= 65 && code <= 90) {
            return String.fromCodePoint(map.upper + (code - 65));
        }
        // Lowercase a-z (97-122)
        if (code >= 97 && code <= 122) {
            return String.fromCodePoint(map.lower + (code - 97));
        }
        return char; // Keep numbers/spaces as they are
    }).join('');
};
