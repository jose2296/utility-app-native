import { Stack } from 'expo-router';
import { Header } from '../_layout';

export default function WorkspaceLayout() {
    return (
        <Stack
            screenOptions={{
                header: (props) => <Header {...props} />,
                animation: 'none'
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[folderId]" />
        </Stack>
    );
}
