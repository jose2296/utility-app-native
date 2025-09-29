import Button from '@/components/button';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { toast } from '@/services/toast';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardEvent, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading } = useSession();
    const { isLoaded, signUp, setActive } = useSignUp();
    const [showVerificationCode, setShowVerificationCode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const { request: registerRequest, loading: isRegistering, error } = useLazyApi('auth/register', 'POST');
    const translateY = useSharedValue(0);
    const [spaceFromViewToBottomScreen, setSpaceFromViewToBottomScreen] = useState(0);
    const router = useRouter();

    const handleSignUp = async () => {
        const data = {
            name,
            email,
            password
        };

        if (!name || !email || !password) {
            toast.error({
                title: 'validations.fill_all_fields'
            });
            return;
        }

        try {
            const response = await registerRequest('auth/register', data);
            signIn(response.session.access_token);
            // TODO: Control errors
            // try {
            //     await signUp?.create({
            //         emailAddress: email,
            //         password: password,
            //         username: name
            //     });

            //     await signUp?.prepareEmailAddressVerification({
            //         strategy: 'email_code'
            //     });
            //     setShowVerificationCode(true);
            // } catch (error) {
            //     Alert.alert('Error', error?.message);
            // }
        } catch (error) {
            console.error(error);
        }
    }

    const handleConfirmVerificationCode = async () => {
        try {
            const attempt = await signUp?.attemptEmailAddressVerification({
                code: verificationCode
            });
            // setShowVerificationCode(false);

            if (attempt?.status === 'complete') {
                await setActive?.({ session: attempt.createdSessionId });
            }
        } catch (error) {
            Alert.alert('Error', error?.message);
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
        <SafeAreaView className={`flex flex-1 justify-center items-center gap-4 bg-base-100`}>
            <Animated.View style={[paddingStyle]}>
                <View className='flex p-8 flex-col gap-10 max-w-[85%] w-[350px] items-center border border-neutral-content rounded-2xl'>
                    <View
                        className='px-4 gap-2 w-full justify-center items-center '
                        onLayout={(e) => {
                            const bottomViewPosition = (Dimensions.get('screen').height / 2) + (e.nativeEvent.layout.height / 2);
                            const _spaceFromViewToBottomScreen = Dimensions.get('screen').height - bottomViewPosition;
                            setSpaceFromViewToBottomScreen(_spaceFromViewToBottomScreen - 40);
                        }}
                    >
                        {!showVerificationCode && (
                            <>
                                <Text text='register.title' className='text-3xl font-bold text-base-content' />
                                <Input
                                    label='name'
                                    autoComplete="name"
                                    autoCapitalize="none"
                                    textContentType="name"
                                    keyboardType="default"
                                    value={name}
                                    onChangeText={(text) => setName(text)}
                                    submitBehavior='submit'
                                    returnKeyType='next'
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                                <Input
                                    ref={emailRef}
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
                                    onSubmitEditing={handleSignUp}
                                    returnKeyType='done'
                                />

                                {error && (
                                    <Text
                                        text={error?.status === 400 ? 'register.error' : 'register.error'}
                                        className='text-red-500'
                                    />
                                )}

                                <View className='mt-4'>
                                    <Button
                                        disabled={!isLoading || isRegistering}
                                        isLoading={isRegistering}
                                        size='lg'
                                        name='register.register'
                                        onPress={handleSignUp}
                                    />
                                </View>
                            </>
                        )}
                        {showVerificationCode && (
                            <>
                                <Text text='register.verification_code' className='text-3xl font-bold text-base-content' />
                                <Input
                                    label='verification_code'
                                    autoCapitalize="none"
                                    textContentType="name"
                                    keyboardType="default"
                                    value={verificationCode}
                                    onChangeText={(text) => setVerificationCode(text)}
                                    submitBehavior='submit'
                                    returnKeyType='done'
                                />

                                <View className='mt-4'>
                                    <Button
                                        disabled={!isLoaded || isRegistering}
                                        isLoading={isRegistering}
                                        size='lg'
                                        name='register.confirm_code'
                                        onPress={handleConfirmVerificationCode}
                                    />
                                </View>
                            </>
                        )}
                    </View>



                    <View className='bg-red-0 gap-2 w-full'>
                        <View className='h-0.5 bg-neutral-content/40' />
                        <Button name='register.go_to_login' size='lg' type='link' onPress={() => router.push('/(auth)')} />
                    </View>
                </View>

            </Animated.View>
        </SafeAreaView>
    );
}
