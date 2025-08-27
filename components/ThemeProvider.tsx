import { useUserStore } from '@/store';
import { useColorScheme, vars } from "nativewind";
import React, { useEffect } from 'react';
import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback } from 'react-native';
const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `${r} ${g} ${b}`;
};

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
];

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
        "hex": "#f9fafb",
        "rgb": "rgb(249, 250, 251)"
    },
    {
        "name": "base-300",
        "key": "--color-base-300",
        "hex": "#e5e6e7",
        "rgb": "rgb(229, 230, 231)"
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
        "hex": "#e9d4ff",
        "rgb": "rgb(233, 212, 255)"
    },
    {
        "name": "primary-content",
        "key": "--color-primary-content",
        "hex": "#8000d9",
        "rgb": "rgb(128, 0, 217)"
    },
    {
        "name": "secondary",
        "key": "--color-secondary",
        "hex": "#feccd2",
        "rgb": "rgb(254, 204, 210)"
    },
    {
        "name": "secondary-content",
        "key": "--color-secondary-content",
        "hex": "#c50035",
        "rgb": "rgb(197, 0, 53)"
    },
    {
        "name": "accent",
        "key": "--color-accent",
        "hex": "#a3f2ce",
        "rgb": "rgb(163, 242, 206)"
    },
    {
        "name": "accent-content",
        "key": "--color-accent-content",
        "hex": "#007853",
        "rgb": "rgb(0, 120, 83)"
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
        "hex": "#51e8fb",
        "rgb": "rgb(81, 232, 251)"
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
];

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
    // console.log({ colorScheme });
    // console.log(themes);

    useEffect(() => {
        const colors = themes[colorScheme].reduce((acc, item) => {
            return {
                ...acc,
                [item.name]: item.rgb,
                [item.name + '-rgb']: item.rgb.slice(4, -1)
            };
        }, {} as Record<string, any>);
        setColors(colors);
    }, [colorScheme]);

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
