import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AuthLayout() {

    return (
        <View className='flex flex-1 bg-base-100'>
            <Stack
                screenOptions={{
                    headerShown: false
                }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Login'
                }}
            />
        </Stack>
        </View>
    );
}
