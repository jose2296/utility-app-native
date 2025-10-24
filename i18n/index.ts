
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import Backend, { HttpBackendOptions } from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import es from "./es.json";

const resources = {
    "en": { translation: en },
    "es": { translation: es },
};

// Accent translations API (without parse function)
// const TRANSLATION_API_URL = `${process.env.EXPO_PUBLIC_TRANSLATION_API_URL}/export?project_id=${process.env.EXPO_PUBLIC_TRANSLATION_PROJECT_ID}&language={lng}&document_format=json&document_path={lng}`

// Tolgee translations API (with parse function)
// const TRANSLATION_API_URL = `${process.env.EXPO_PUBLIC_TRANSLATION_API_URL}/v2/projects/translations/{lng}`

const TRANSLATION_API_URL = `${process.env.EXPO_PUBLIC_API_URL}/i18n/{lng}.json`;

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem("language");

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()?.[0]?.languageCode ?? "en";
    }


    i18n
        // .use(ICU)
        .use(Backend)
        .use(initReactI18next).init({
            // resources,
            lng: savedLanguage,
            backend: {
                loadPath: TRANSLATION_API_URL,
                // customHeaders: {
                //     'X-API-Key': process.env.EXPO_PUBLIC_TRANSLATION_API_KEY!
                // },
                // parse: (data, lng: string) => JSON.parse(data)[lng]
            } as HttpBackendOptions,
            fallbackLng: "en",
            interpolation: {
                escapeValue: false,
                prefix: '{',
                suffix: '}'
            },
        });
};

initI18n();

export default i18n;
