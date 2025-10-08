import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import type { FolderDetailsData } from '@/models/folder';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import { parseListType } from '@/utils/lists';
import * as Linking from 'expo-linking';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorkspaceSelector, { Selection } from '../../../components/dropdown/a';

const CollaborateListScreen = () => {
    const { listId } = useLocalSearchParams();
    const url = Linking.useLinkingURL();
    const router = useRouter();
    const { request: addCollaboratorToList } = useLazyApi(`lists/add-collaborator`, 'POST');
    const [canEdit, setCanEdit] = useState(false);
    const [listTitle, setListTitle] = useState('');
    const [type, setType] = useState('');
    const { data } = useUserStore();
    const [workspaceSelected, setWorkspaceSelected] = useState<FolderDetailsData>(data?.workspaces?.[0]!);
    const [destinationFolder, setDestinationFolder] = useState<FolderDetailsData>();
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            if (url) {
                const { hostname, path, queryParams } = Linking.parse(url);
                const _canEdit = typeof queryParams?.canEdit === 'string' ? queryParams.canEdit === 'true' : false;
                const _listTitle = queryParams?.title as string || '';
                const _type = queryParams?.type as string || 'lists';

                setCanEdit(_canEdit);
                setListTitle(_listTitle);
                setType(_type);
            }
        }, [url])
    );

    const handleCollaborateList = async () => {
        try {
            const listCollaborated = await addCollaboratorToList(`lists/add-collaborator`, { list_id: Number(listId), can_edit: canEdit, folder_id: destinationFolder?.id });
            console.log({ listCollaborated });

            toast.success({
                title: 'List Collaborated'
            });

            if (type === 'lists') {
                router.push(`/(app)/${workspaceSelected.id}/lists/${parseListType(listCollaborated.list.type)}/${listCollaborated.list.id}`);
            } else if (type === 'notes') {
                router.push(`/(app)/${workspaceSelected.id}/notes/${listCollaborated.list.id}`);
            } else if (type === 'folders') {
                router.push(`/(app)/${workspaceSelected.id}/${listCollaborated.list.id}`);
            }
        } catch (error) {
            router.push(`/`);
        }
    }

    const onSelectOption = (option: Selection[]) => {
        setWorkspaceSelected(option[0].workspace as FolderDetailsData);
        setDestinationFolder(option[option.length - 1].workspace as FolderDetailsData);
    }

    return (
        <WorkspaceSelector
            workspaces={data?.workspaces || []}
            title={listTitle || ''}
            onSelectOption={onSelectOption}
            handleCollaborateList={handleCollaborateList}
        />
    );

    return (
        <>
            <View className='flex flex-1 px-10' style={{ paddingBottom: insets.bottom }}>
                <ScrollView contentContainerClassName='flex flex-1 items-center justify-center gap-4 '>
                    <Text
                        className='text-4xl text-center text-base-content'
                        text='list.collaborate.message'
                        translateData={{ title: listTitle }}
                    />
                    <Text
                        className='text-2xl text-center text-base-content'
                        text='list.collaborate.select_location'
                    />

                    <View className='gap-4'>
                        <Dropdown
                            label='select_workspace'
                            text={workspaceSelected?.name || 'Select workspace'}
                            onPress={() => {
                                // Implement workspace selection logic here
                            }}
                        />
                    </View>
                </ScrollView>

                <View className='flex flex-row gap-4 items-center justify-center'>

                    <Button
                        type='error'
                        name='list.collaborate.decline_invitation'
                        onPress={() => router.push(`/`)}
                    />
                    <Button
                        type='success'
                        name='list.collaborate.accept_invitation'
                        onPress={handleCollaborateList}
                    />
                </View>
            </View>
        </>
    );
};

export default CollaborateListScreen;
