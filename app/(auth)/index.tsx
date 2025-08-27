import Button from '@/components/button';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabOneScreen() {
    const [email, setEmail] = useState('josejerez9622@gmail.com');
    const [password, setPassword] = useState('secret');
    const { signIn, isLoading } = useSession();
    const passwordRef = useRef<TextInput>(null);
    const { request: signInRequest, loading: isSigningIn, error } = useLazyApi('auth/login', 'POST');
    const translateY = useSharedValue(0);
    const [spaceFromViewToBottomScreen, setSpaceFromViewToBottomScreen] = useState(0);

    const handleSignIn = async () => {
        const data = {
            email,
            password
        };

        try {
            const response = await signInRequest('auth/login', data);
            // TODO: Control errors
            signIn(response.token);
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
        const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [spaceFromViewToBottomScreen]);

    const paddingStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -translateY.value }]
    }));

    const handleKeyboardShow = (event: KeyboardEvent) => {
        const value = event.endCoordinates.height - spaceFromViewToBottomScreen;

        translateY.value = withTiming(value > 0 ? value : 0, { duration: 250 });
    };

    const handleKeyboardHide = (event: KeyboardEvent) => {
        translateY.value = withTiming(0, { duration: 250 });
    };

    return (
        <SafeAreaView className={`flex flex-1 justify-center items-center gap-4`}>
            <Animated.View style={[paddingStyle]}>
                <View
                    className='flex flex-col gap-4 max-w-[85%] w-[350px] items-center border border-neutral-content p-8 px-12 rounded-2xl'
                    onLayout={(e) => {
                        const bottomViewPosition = (Dimensions.get('screen').height / 2) + (e.nativeEvent.layout.height / 2);
                        const _spaceFromViewToBottomScreen = Dimensions.get('screen').height - bottomViewPosition;
                        setSpaceFromViewToBottomScreen(_spaceFromViewToBottomScreen - 40);
                    }}
                >
                    <Text text='login.title' className='text-3xl font-bold text-base-content' />
                    <Input
                        label='Email'
                        autoComplete="email"
                        autoCapitalize="none"
                        textContentType="username"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        submitBehavior='submit'
                        returnKeyType='next'
                        onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                    <Input
                        ref={passwordRef}
                        label='Password'
                        autoCapitalize="none"
                        secureTextEntry
                        autoComplete="password"
                        importantForAutofill='yes'
                        textContentType='password'
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        onSubmitEditing={handleSignIn}
                        returnKeyType='done'
                    />

                    {error && <Text text={error?.status === 401 ? 'validations.wrong_credentials' : error?.message || ''} className='text-red-500' />}

                    <View className='mt-8'>
                        <Button disabled={isLoading || isSigningIn} isLoading={isSigningIn} name='Login' onPress={handleSignIn} />
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
