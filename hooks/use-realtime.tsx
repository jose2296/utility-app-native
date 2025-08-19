import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from "react";

const useRealtimeGetData = <T,>(
    getData: () => Promise<T>,
    channelName: string,
    eventName: string
) => {
    const ws = useRef<WebSocket | null>(null);
    const mounted = useRef(true);

    useFocusEffect(
        useCallback(() => {
            let subscribed = false;

            const connect = async () => {
                const key = process.env.EXPO_PUBLIC_PUSHER_APP_KEY!;
                const cluster = "eu";
                const socketUrl = `wss://ws-${cluster}.pusher.com/app/${key}?protocol=7&client=js&version=7.2.2`;

                ws.current = new WebSocket(socketUrl);

                ws.current.onopen = async () => {
                    // Primera llamada a la API
                    const data = await getData();
                    if (!mounted.current) return;

                    // Suscribirse al canal
                    const subscribeMessage = {
                        event: "pusher:subscribe",
                        data: {
                            channel: channelName,
                        },
                    };
                    ws.current?.send(JSON.stringify(subscribeMessage));
                    subscribed = true;
                };

                ws.current.onmessage = async (message) => {
                    try {
                        const parsed = JSON.parse(message.data);

                        if (
                            parsed.event === eventName &&
                            parsed.channel === channelName &&
                            mounted.current
                        ) {
                            await getData();
                        }
                    } catch (err) {
                        console.error("Error parsing WebSocket message", err);
                    }
                };

                ws.current.onerror = (err) => {
                    console.error("WebSocket error", err);
                };

                ws.current.onclose = () => {
                    console.log("WebSocket closed");
                };
            };

            connect();

            return () => {
                mounted.current = false;

                if (subscribed) {
                    const unsubscribeMessage = {
                        event: "pusher:unsubscribe",
                        data: {
                            channel: channelName,
                        },
                    };
                    ws.current?.send(JSON.stringify(unsubscribeMessage));
                }

                ws.current?.close();
            };
        }, [getData, channelName, eventName])
    );
    // useEffect(() => {
    //     let subscribed = false;

    //     const connect = async () => {
    //         const key = process.env.EXPO_PUBLIC_PUSHER_APP_KEY!;
    //         const cluster = "eu";
    //         const socketUrl = `wss://ws-${cluster}.pusher.com/app/${key}?protocol=7&client=js&version=7.2.2`;

    //         ws.current = new WebSocket(socketUrl);

    //         ws.current.onopen = async () => {
    //             // Primera llamada a la API
    //             const data = await getData();
    //             if (!mounted.current) return;

    //             // Suscribirse al canal
    //             const subscribeMessage = {
    //                 event: "pusher:subscribe",
    //                 data: {
    //                     channel: channelName,
    //                 },
    //             };
    //             ws.current?.send(JSON.stringify(subscribeMessage));
    //             subscribed = true;
    //         };

    //         ws.current.onmessage = async (message) => {
    //             try {
    //                 const parsed = JSON.parse(message.data);

    //                 if (
    //                     parsed.event === eventName &&
    //                     parsed.channel === channelName &&
    //                     mounted.current
    //                 ) {
    //                     await getData();
    //                 }
    //             } catch (err) {
    //                 console.error("Error parsing WebSocket message", err);
    //             }
    //         };

    //         ws.current.onerror = (err) => {
    //             console.error("WebSocket error", err);
    //         };

    //         ws.current.onclose = () => {
    //             console.log("WebSocket closed");
    //         };
    //     };

    //     connect();

    //     return () => {
    //         mounted.current = false;

    //         if (subscribed) {
    //             const unsubscribeMessage = {
    //                 event: "pusher:unsubscribe",
    //                 data: {
    //                     channel: channelName,
    //                 },
    //             };
    //             ws.current?.send(JSON.stringify(unsubscribeMessage));
    //         }

    //         ws.current?.close();
    //     };
    // }, [getData, channelName, eventName]);
};

export default useRealtimeGetData;
