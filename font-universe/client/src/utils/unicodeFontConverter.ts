
// The Universal "Fancy Font" Converter
export interface FontMetadata {
    category: string;
    family?: string;
}

export const convertToUnicode = (text: string, fontData: FontMetadata | string): string => {
    let category = '';
    let family = '';

    if (typeof fontData === 'string') {
        category = fontData.toLowerCase();
    } else {
        category = fontData.category.toLowerCase();
        family = fontData.family ? fontData.family.toLowerCase() : '';
    }

    // Automatic Category Mapping Rules
    let targetStyle = 'bold_sans_serif'; // Default (Fallback)

    // 1. Monospace: Check category OR metadata (family name)
    if (category === 'monospace' || family.includes('mono') || family.includes('code')) {
        targetStyle = 'monospace';
    }
    // 2. Cursive / Script: Always map to Bold Script
    else if (category === 'cursive' || category === 'script' || category === 'handwriting') {
        targetStyle = 'bold_script';
    }
    // 3. Serif: Always map to Fraktur/Blackletter
    else if (category === 'serif') {
        targetStyle = 'fraktur';
    }
    // 4. Sans-Serif: Always map to Double-Struck/Hollow
    else if (category === 'sans-serif') {
        targetStyle = 'double_struck';
    }
    // 5. Display or Unknown: Fallback to Bold Sans-Serif (already set as default)

    const maps: Record<string, { upper: number; lower: number }> = {
        fraktur: { upper: 0x1D504, lower: 0x1D51E }, // 𝕯𝖊𝖊𝖕𝕾𝖊𝖊𝖐
        bold_script: { upper: 0x1D4D0, lower: 0x1D4EA }, // 𝓓𝓮𝓮𝓹𝓢𝓮𝓮𝓴
        double_struck: { upper: 0x1D538, lower: 0x1D552 }, // 𝔻𝕖𝕖𝕡𝕊𝕖𝕖𝕜
        monospace: { upper: 0x1D670, lower: 0x1D68A }, // 𝙳𝚎𝚎𝚙𝚂𝚎𝚎𝚔
        bold_sans_serif: { upper: 0x1D5D4, lower: 0x1D5EE }, // 𝗦𝗮𝗻𝘀 𝗦𝗲𝗿𝗶𝗳 𝗕𝗼𝗹𝗱
        bold_serif: { upper: 0x1D400, lower: 0x1D41A } // 𝐁𝐨𝐥𝐝 𝐒𝐞𝐫𝐢𝐟
    };

    const map = maps[targetStyle] || maps['bold_sans_serif'];

    // Exceptions for styles with holes in the Mathematical Alphanumeric Symbols block
    // (Double-Struck and Fraktur have some characters in the BMP)
    const exceptions: Record<string, Record<string, number>> = {
        double_struck: {
            'C': 0x2102, 'H': 0x210D, 'N': 0x2115, 'P': 0x2119, 
            'Q': 0x211A, 'R': 0x211D, 'Z': 0x2124
        },
        fraktur: {
            'C': 0x212D, 'H': 0x210C, 'I': 0x2111, 'R': 0x211C, 'Z': 0x2128
        }
    };

    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        
        // Handle Exceptions
        if (exceptions[targetStyle] && exceptions[targetStyle][char]) {
            return String.fromCodePoint(exceptions[targetStyle][char]);
        }

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
