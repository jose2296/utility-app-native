import Button from '@/components/button';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabOneScreen() {
    const [email, setEmail] = useState('josejerez9622@gmail.com');
    const [password, setPassword] = useState('secret');
    const { signIn, isLoading } = useSession();
    const { request: signInRequest, loading: isSigningIn, error } = useLazyApi('auth/login', 'POST');


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

    return (
        <SafeAreaView className={`flex flex-1 justify-center items-center gap-4`}>

            <View className='flex flex-col gap-4 max-w-[85%] w-[350px] items-center border border-neutral-content p-8 px-12 rounded-2xl'>
                <Text text='login.title' className='text-3xl font-bold text-base-content' />
                <Input
                    label='Email'
                    autoComplete="email"
                    autoCapitalize="none"
                    textContentType="username"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <Input
                    label='Password'
                    autoCapitalize="none"
                    secureTextEntry
                    autoComplete="password"
                    importantForAutofill='yes'
                    textContentType='password'
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />

                {error && <Text text={error?.status ===  401 ? 'validations.wrong_credentials' : error?.message || ''} className='text-red-500' />}

                <View className='mt-8'>
                    <Button disabled={isLoading || isSigningIn} isLoading={isSigningIn} name='Login' onPress={handleSignIn} />
                </View>
            </View>
        </SafeAreaView>
    );
}
