import i18n from '@/i18n';
import messaging from '@react-native-firebase/messaging';
import dayjs from 'dayjs';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
(globalThis as any).RNFB_MODULAR_DEPRECATION_STRICT_MODE = true;

// Para mostrar notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Solicitar permisos y obtener el token FCM
export async function registerForPushNotificationsAsync() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    const permissions = await Notifications.requestPermissionsAsync();

    if (!enabled || !permissions.granted) {
        console.log('Permiso denegado');
        return null;
    }

    const token = await messaging().getToken();
    // console.log('FCM Token:', token);
    return token;
}

// Manejar notificaciones con deep links
export function setupNotificationListeners() {
    // Cuando se recibe una notificación con la app abierta
    messaging().onMessage(async remoteMessage => {
        // console.log('Mensaje foreground:', remoteMessage);
        const translationData = remoteMessage.data?.translation_data ? JSON.parse(remoteMessage.data?.translation_data as string) : {};
        if (translationData.date) {
            translationData.date = dayjs(translationData.date).format(translationData.date_format || 'DD/MM/YYYY HH:mm');
        }

        const title = i18n.t(remoteMessage.notification?.title!, translationData) as string;
        const body = i18n.t(remoteMessage.notification?.body!, translationData) as string;

        Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: remoteMessage.data,
            },
            trigger: null,
        });
    });

    // Cuando el usuario toca la notificación (deep link)
    Notifications.addNotificationResponseReceivedListener(response => {
        const url = response.notification.request.content.data?.link as string;
        if (url) {
            Linking.openURL(url);
        }
    });
}
