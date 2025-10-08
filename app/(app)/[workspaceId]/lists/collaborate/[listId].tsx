import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import DropDownModal from '@/components/dropdown/DropdownModal';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { Folder } from '@/models/folder';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import { parseListType } from '@/utils/lists';
import * as Linking from 'expo-linking';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CollaborateListScreen = () => {
    const { listId } = useLocalSearchParams();
    const url = Linking.useLinkingURL();
    const router = useRouter();
    const { request: addCollaboratorToList } = useLazyApi(`lists/add-collaborator`, 'POST');
    const [canEdit, setCanEdit] = useState(false);
    const navigation = useNavigation();
    const [dropWorkspaceModalOpen, setDropWorkspaceModalOpen] = useState(false);
    const [listTitle, setListTitle] = useState('');
    const { data } = useUserStore();
    const [workspaceSelected, setWorkspaceSelected] = useState<Folder>(data?.workspaces?.[0]!);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            if (url) {
                navigation.setOptions({
                    title: 'list.collaborate.title'
                });

                const { hostname, path, queryParams } = Linking.parse(url);
                const canEdit = typeof queryParams?.canEdit === 'string' ? queryParams.canEdit === 'true' : false;
                const listTitle = queryParams?.title as string || '';

                setCanEdit(canEdit);
                setListTitle(listTitle);
            }
        }, [url])
    );

    const handleCollaborateList = async () => {
        try {
            const listCollaborated = await addCollaboratorToList(`lists/add-collaborator`, { list_id: Number(listId), can_edit: canEdit, folder_id: workspaceSelected.id });
            console.log({ listCollaborated });

            toast.success({
                title: 'List Collaborated'
            });
            router.push(`/(app)/${workspaceSelected.id}/lists/${parseListType(listCollaborated.list.type)}/${listCollaborated.list.id}`);
        } catch (error) {
            router.push(`/`);
        }
    }

    return (
        <>
            <View className='flex flex-1 px-10' style={{ paddingBottom: insets.bottom }}>
                <View className='flex flex-1 items-center justify-center gap-4 '>
                    <Text className='text-4xl text-center text-base-content' text='list.collaborate.message' translateData={{ title: listTitle }} />
                    <Text className='text-2xl text-center text-base-content' text='list.collaborate.select_location' />

                    <Dropdown
                        label='select_workspace'
                        text={workspaceSelected?.name!}
                        onPress={() => setDropWorkspaceModalOpen(true)}
                    />
                </View>

                <View className='flex flex-row gap-4 items-center justify-center'>
                    <Button
                        type='error'
                        name='list.collaborate.decline_invitation'
                        onPress={() => router.push(`/`)}
                    />
                    <Button
                        name='list.collaborate.accept_invitation'
                        onPress={handleCollaborateList}
                    />
                </View>
            </View>

            <DropDownModal
                text='list.fixed.select_list_type'
                options={data?.workspaces!.map((workspace) => ({ key: workspace.name, value: workspace.id.toString() }))!}
                isOpen={dropWorkspaceModalOpen}
                value={workspaceSelected.id.toString()}
                onPress={(option) => setWorkspaceSelected(data?.workspaces?.find((workspace) => workspace.id.toString() === option.value)!)}
                onClose={() => setDropWorkspaceModalOpen(false)}
            />

            {/* TODO: Add recursive component to select folder from workspace | getWorkspace include 2 folders deep */}


        </>
    );
};

export default CollaborateListScreen;
