import Button from '@/components/button';
import { Input } from '@/components/input';
import Eye from '@/components/svgs/Eye';
import EyeOff from '@/components/svgs/EyeOff';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { toast } from '@/services/toast';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { signIn, isLoading } = useSession();
    const passwordRef = useRef<TextInput>(null);
    const { request: signInRequest, loading: isSigningIn, error } = useLazyApi('auth/login', 'POST');
    const translateY = useSharedValue(0);
    const [spaceFromViewToBottomScreen, setSpaceFromViewToBottomScreen] = useState(0);
    const router = useRouter();

    const handleSignIn = async () => {
        const data = {
            email,
            password
        };

        if (!email || !password) {
            toast.error({
                title: 'validations.fill_all_fields'
            });
            return;
        }

        try {
            const response = await signInRequest('auth/login', data);
            // TODO: Control errors
            signIn({
                access_token: response.access_token,
                refresh_token: response.refresh_token
            });
        } catch (error) {
            if ((error as any).status === 401) {
                toast.error({
                    title: 'validations.wrong_credentials'
                });
            }
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
        <SafeAreaView className={`flex flex-1 justify-center items-center gap-4 bg-base-100`}>
            <Animated.View style={[paddingStyle]}>
                <View className='flex py-8 px-6 flex-col gap-8 max-w-[85%] w-[350px] items-center border border-neutral-content rounded-2xl'>
                    <View
                        className='px-4 gap-2 w-full justify-center items-center '
                        onLayout={(e) => {
                            const bottomViewPosition = (Dimensions.get('screen').height / 2) + (e.nativeEvent.layout.height / 2);
                            const _spaceFromViewToBottomScreen = Dimensions.get('screen').height - bottomViewPosition;
                            setSpaceFromViewToBottomScreen(_spaceFromViewToBottomScreen - 40);
                        }}
                    >
                        <Text text='login.title' className='text-3xl font-bold text-base-content' />
                        <Input
                            label='Email'
                            autoComplete="password"
                            autoCapitalize="none"
                            textContentType="username"
                            importantForAutofill='yes'
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
                            secureTextEntry={!isPasswordVisible}
                            autoComplete="password"
                            importantForAutofill='yes'
                            textContentType='password'
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            suffixIcon={
                                <TouchableOpacity hitSlop={15} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    {isPasswordVisible ? <Eye className='text-base-content' /> : <EyeOff className='text-base-content' />}
                                </TouchableOpacity>
                            }
                            onSubmitEditing={handleSignIn}
                            returnKeyType='done'
                        />

                        {error && <Text text={error?.status === 401 ? 'validations.wrong_credentials' : 'register.error'} className='text-red-500' />}

                        <View className='mt-4'>
                            <Button
                                disabled={isLoading || isSigningIn}
                                isLoading={isSigningIn}
                                size='lg'
                                name='login.login'
                                onPress={handleSignIn}
                            />
                        </View>

                    </View>

                    <View className='gap-2 w-full'>
                        <View className='h-0.5 bg-neutral-content/40' />
                        <Button
                            name='login.go_to_register'
                            size='lg'
                            type='link'
                            onPress={() => router.push('/(auth)/register')}
                        />
                    </View>
                </View>

            </Animated.View>
        </SafeAreaView>
    );
}
