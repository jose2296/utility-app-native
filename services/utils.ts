export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    let cleaned = hex.replace(/^#/, "");

    if (cleaned.length === 3) {
        // Forma corta (#abc → #aabbcc)
        cleaned = cleaned.split("").map(c => c + c).join("");
    }

    if (cleaned.length !== 6) {
        throw new Error(`Color HEX inválido: ${hex}`);
    }

    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);

    return { r, g, b };
};

const calculateLuminance = (color: { r: number; g: number; b: number }): number => {
    let r = color.r / 255;
    let g = color.g / 255;
    let b = color.b / 255;

    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastColor = (hexBackground: string): { className: string, color: string } => {
    const rgb = hexToRgb(hexBackground);
    const bgLuminance = calculateLuminance(rgb);

    return bgLuminance > 0.4
        ? {
            className: "text-base-300",
            color: "black"
        }
        :
        {
            className: "text-base-content",
            color: "white"
        };
};







// Convierte HEX a HSL
const hexToHsl = (hex: string): [number, number, number] => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gris
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Convierte HSL a HEX
const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];

    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else[r, g, b] = [c, 0, x];

    const toHex = (v: number) =>
        Math.round((v + m) * 255).toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Complementario
export const getComplementary = (hex: string) => {
    const [h, s, l] = hexToHsl(hex);

    return hslToHex((h + 180) % 360, s, l);
};

// Análogo
export const getAnalogous = (hex: string) => {
    const [h, s, l] = hexToHsl(hex);

    return [
        hslToHex((h + 30) % 360, s, l),
        hex,
        hslToHex((h - 30 + 360) % 360, s, l)
    ];
};

// Triádico
export const getTriadic = (hex: string) => {
    const [h, s, l] = hexToHsl(hex);

    return [
        hslToHex((h + 120) % 360, s, l),
        hex,
        hslToHex((h + 240) % 360, s, l),
    ];
};









import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: any[]) => {
  return twMerge(clsx(inputs));
};
