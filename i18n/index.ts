
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import es from "./es.json";

const resources = {
    "en": { translation: en },
    "es": { translation: es },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem("language");

    if (!savedLanguage) {
        savedLanguage = Localization.getLocales()?.[0]?.languageCode ?? "en";
    }

    i18n
        // .use(ICU)
        .use(initReactI18next).init({
            resources,
            lng: savedLanguage,
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
