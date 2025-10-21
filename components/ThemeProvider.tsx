import { useUserStore } from '@/store';
import { useColorScheme, vars } from "nativewind";
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback } from 'react-native';

const draculaTheme = [
    {
        "name": "base-100",
        "key": "--color-base-100",
        "hex": "#282a36",
        "rgb": "rgb(40, 42, 54)"
    },
    {
        "name": "base-200",
        "key": "--color-base-200",
        "hex": "#232530",
        "rgb": "rgb(35, 37, 48)"
    },
    {
        "name": "base-300",
        "key": "--color-base-300",
        "hex": "#1f202a",
        "rgb": "rgb(31, 32, 42)"
    },
    {
        "name": "base-content",
        "key": "--color-base-content",
        "hex": "#f8f8f3",
        "rgb": "rgb(248, 248, 243)"
    },
    {
        "name": "primary",
        "key": "--color-primary",
        "hex": "#ff79c6",
        "rgb": "rgb(255, 121, 198)"
    },
    {
        "name": "primary-content",
        "key": "--color-primary-content",
        "hex": "#16050e",
        "rgb": "rgb(22, 5, 14)"
    },
    {
        "name": "secondary",
        "key": "--color-secondary",
        "hex": "#bd93f9",
        "rgb": "rgb(189, 147, 249)"
    },
    {
        "name": "secondary-content",
        "key": "--color-secondary-content",
        "hex": "#0d0815",
        "rgb": "rgb(13, 8, 21)"
    },
    {
        "name": "accent",
        "key": "--color-accent",
        "hex": "#ffb86c",
        "rgb": "rgb(255, 184, 108)"
    },
    {
        "name": "accent-content",
        "key": "--color-accent-content",
        "hex": "#160d04",
        "rgb": "rgb(22, 13, 4)"
    },
    {
        "name": "neutral",
        "key": "--color-neutral",
        "hex": "#414558",
        "rgb": "rgb(65, 69, 88)"
    },
    {
        "name": "neutral-content",
        "key": "--color-neutral-content",
        "hex": "#d6d7db",
        "rgb": "rgb(214, 215, 219)"
    },
    {
        "name": "info",
        "key": "--color-info",
        "hex": "#8be9fd",
        "rgb": "rgb(139, 233, 253)"
    },
    {
        "name": "info-content",
        "key": "--color-info-content",
        "hex": "#071316",
        "rgb": "rgb(7, 19, 22)"
    },
    {
        "name": "success",
        "key": "--color-success",
        "hex": "#51fa7b",
        "rgb": "rgb(81, 250, 123)"
    },
    {
        "name": "success-content",
        "key": "--color-success-content",
        "hex": "#021505",
        "rgb": "rgb(2, 21, 5)"
    },
    {
        "name": "warning",
        "key": "--color-warning",
        "hex": "#f1fa8c",
        "rgb": "rgb(241, 250, 140)"
    },
    {
        "name": "warning-content",
        "key": "--color-warning-content",
        "hex": "#141507",
        "rgb": "rgb(20, 21, 7)"
    },
    {
        "name": "error",
        "key": "--color-error",
        "hex": "#ff5555",
        "rgb": "rgb(255, 85, 85)"
    },
    {
        "name": "error-content",
        "key": "--color-error-content",
        "hex": "#160202",
        "rgb": "rgb(22, 2, 2)"
    }
] as const;

const pastelTheme = [
    {
        "name": "base-100",
        "key": "--color-base-100",
        "hex": "#ffffff",
        "rgb": "rgb(255, 255, 255)"
    },
    {
        "name": "base-200",
        "key": "--color-base-200",
        "hex": "#fcfcfd",
        "rgb": "rgb(252, 252, 253)"
    },
    {
        "name": "base-300",
        "key": "--color-base-300",
        "hex": "#eeeff0",
        "rgb": "rgb(238, 239, 240)"
    },
    {
        "name": "base-content",
        "key": "--color-base-content",
        "hex": "#161616",
        "rgb": "rgb(22, 22, 22)"
    },
    {
        "name": "primary",
        "key": "--color-primary",
        "hex": "#8bc2ff",
        "rgb": "rgb(139, 194, 255)"
    },
    {
        "name": "primary-content",
        "key": "--color-primary-content",
        "hex": "#1244e3",
        "rgb": "rgb(18, 68, 227)"
    },
    {
        "name": "secondary",
        "key": "--color-secondary",
        "hex": "#93d9a9",
        "rgb": "rgb(147, 217, 169)"
    },
    {
        "name": "secondary-content",
        "key": "--color-secondary-content",
        "hex": "#00776f",
        "rgb": "rgb(0, 119, 111)"
    },
    {
        "name": "accent",
        "key": "--color-accent",
        "hex": "#c4b3ff",
        "rgb": "rgb(196, 179, 255)"
    },
    {
        "name": "accent-content",
        "key": "--color-accent-content",
        "hex": "#7007e7",
        "rgb": "rgb(112, 7, 231)"
    },
    {
        "name": "neutral",
        "key": "--color-neutral",
        "hex": "#61738d",
        "rgb": "rgb(97, 115, 141)"
    },
    {
        "name": "neutral-content",
        "key": "--color-neutral-content",
        "hex": "#dfe5ed",
        "rgb": "rgb(223, 229, 237)"
    },
    {
        "name": "info",
        "key": "--color-info",
        "hex": "#95bcf6",
        "rgb": "rgb(149, 188, 246)"
    },
    {
        "name": "info-content",
        "key": "--color-info-content",
        "hex": "#007595",
        "rgb": "rgb(0, 117, 149)"
    },
    {
        "name": "success",
        "key": "--color-success",
        "hex": "#7af1a7",
        "rgb": "rgb(122, 241, 167)"
    },
    {
        "name": "success-content",
        "key": "--color-success-content",
        "hex": "#008033",
        "rgb": "rgb(0, 128, 51)"
    },
    {
        "name": "warning",
        "key": "--color-warning",
        "hex": "#ffb667",
        "rgb": "rgb(255, 182, 103)"
    },
    {
        "name": "warning-content",
        "key": "--color-warning-content",
        "hex": "#c93400",
        "rgb": "rgb(201, 52, 0)"
    },
    {
        "name": "error",
        "key": "--color-error",
        "hex": "#ff9fa0",
        "rgb": "rgb(255, 159, 160)"
    },
    {
        "name": "error-content",
        "key": "--color-error-content",
        "hex": "#bf0004",
        "rgb": "rgb(191, 0, 4)"
    }
] as const;

type DraculaThemeNames = typeof draculaTheme[number]["name"];
type PastelThemeNames = typeof pastelTheme[number]["name"];
type ThemeNames = DraculaThemeNames | PastelThemeNames;

// 🔑 Ahora generamos nuevas variantes con template literals:
export type ThemeColors = ThemeNames | `${ThemeNames}-hex` | `${ThemeNames}-rgb` | `${ThemeNames}-rgba/10` | `${ThemeNames}-rgba/20` | `${ThemeNames}-rgba/30` | `${ThemeNames}-rgba/40` | `${ThemeNames}-rgba/50` | `${ThemeNames}-rgba/60` | `${ThemeNames}-rgba/70` | `${ThemeNames}-rgba/80` | `${ThemeNames}-rgba/90` | `${ThemeNames}-rgba/100`;

const themes = {
    dark: draculaTheme,
    light: pastelTheme
}

export const themesInRgb = Object.entries(themes).reduce((acc, [key, value]) => {
    return {
        ...acc,
        [key]: vars(Object.entries(value).reduce((acc, [key, value]) => {

            return {
                ...acc,
                [value.key]: value.rgb.slice(4, -1).split(',').join(' ')
            };
        }, {} as Record<string, any>))
    };
}, {} as Record<string, any>);
// Este provider envuelve toda la app
export function ThemeProvider({ children }: any) {
    const { colorScheme = 'light' } = useColorScheme();
    const { setColors } = useUserStore();
    const [isLoading, setIsLoading] = useState(true);
    // console.log({ colorScheme });
    // console.log(themes);

    useEffect(() => {
        const colors = themes[colorScheme].reduce((acc, item) => {
            const rgba = item.rgb.replace('rgb', 'rgba');

            return {
                ...acc,
                [item.name]: item.rgb,
                [item.name + '-rgb']: item.rgb.slice(4, -1),
                [item.name + '-hex']: item.hex,
                [item.name + '-rgba/10']: rgba.replace(')', ', 0.1)'),
                [item.name + '-rgba/20']: rgba.replace(')', ', 0.2)'),
                [item.name + '-rgba/30']: rgba.replace(')', ', 0.3)'),
                [item.name + '-rgba/40']: rgba.replace(')', ', 0.4)'),
                [item.name + '-rgba/50']: rgba.replace(')', ', 0.5)'),
                [item.name + '-rgba/60']: rgba.replace(')', ', 0.6)'),
                [item.name + '-rgba/70']: rgba.replace(')', ', 0.7)'),
                [item.name + '-rgba/80']: rgba.replace(')', ', 0.8)'),
                [item.name + '-rgba/90']: rgba.replace(')', ', 0.9)'),
                [item.name + '-rgba/100']: rgba.replace(')', ', 1)'),
            };
        }, {} as Record<string, any>);

        setColors(colors);
        setIsLoading(false);
    }, [colorScheme]);

    if (isLoading) {
        return null;
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    // contentContainerStyle={{ flexGrow: 1 }}
                    // Esto ayuda a no interceptar el swipe
                    scrollEnabled={false}
                    style={themesInRgb[colorScheme]}
                    className='flex-1 bg-base-100'
                    contentContainerClassName='flex-1'
                >
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
