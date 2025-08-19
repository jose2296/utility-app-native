import AnimatedList from '@/components/animatedList';
import Breadcrumb from '@/components/breadcrumb';
import FolderItem from '@/components/folder/folderItem';
import Loader from '@/components/loader';
import CustomPullToRefreshOnRelease from '@/components/pullToRefresh';
import { useLazyApi } from '@/hooks/use-api';
import { FolderDetailsData } from '@/models/folder';
import { useUserStore } from '@/store';
import { ITEMS_ICONS } from '@/utils/dashboard';
import { parseListType } from '@/utils/lists';
import { Href, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

const parseFolder = (workspaceId: string) => (data: FolderDetailsData): FolderDetailsData => {
    const lists = data.lists.map((item) => ({
        id: item.id,
        name: item.name,
        type: 'lists',
        icon: item.type as keyof typeof ITEMS_ICONS,
        href: `/(app)/${workspaceId}/lists/${parseListType(item.type)}/${item.id}` as Href
    }));
    const notes = data.notes.map((item) => ({
        id: item.id,
        name: item.title,
        icon: 'notes' as keyof typeof ITEMS_ICONS,
        type: 'notes',
        href: `/(app)/${workspaceId}/notes/${item.id}` as Href,
    }));
    const children = data.children.map((item) => ({
        id: item.id,
        name: item.name,
        icon: 'folders' as keyof typeof ITEMS_ICONS,
        type: 'folders',
        href: `/(app)/${workspaceId}/${item.id}` as Href,
    }));

    return {
        ...data,
        items: [...lists, ...notes, ...children],
        breadcrumb: data.breadcrumb.map((item, index) => ({
            id: item.id,
            name: item.name,
            color: item.color || undefined,
            href: index === 0 ? `/(app)/${item.id}` : `/(app)/${workspaceId}/${item.id}` as Href,
            avoidTranslation: true
        }))
    };
}

export default function WorkspaceScreen() {
    const { workspaceId, folderId } = useLocalSearchParams();
    const navigation = useNavigation();
    const workspace = useUserStore((state) => state.data?.workspaces.find((workspace) => workspace.id === Number(workspaceId)));
    const transform = useCallback(
        parseFolder(workspaceId as string),
        [workspaceId]
    );
    const { data, loading: loadingFolderData, request: getFolderData } = useLazyApi(`folders/${folderId || workspaceId}`, 'GET', null, transform);
    const { request: addItemToDashboard } = useLazyApi(`dashboard`, 'POST');

    useEffect(() => {
        getFolderData();
    }, [folderId, workspaceId]);

    useEffect(() => {
        if (workspace) {
            navigation.setOptions({ title: workspace.name, headerTintColor: workspace.color });
        }
    }, [workspace]);

    const handlePinItem = async (item: FolderDetailsData['items'][number]) => {
        await addItemToDashboard(`dashboard`, { entity_id: item.id, entity_type: item.type });
    }

    if (loadingFolderData || !data) {
        return (
            <View className='flex flex-1 flex-col items-center gap-2 justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <View className='px-4 py-4 gap-4 flex-1'>
            <Breadcrumb breadcrumb={data?.breadcrumb} />

            <View className='flex flex-1 flex-col gap-y-6'>
                <CustomPullToRefreshOnRelease onRefresh={getFolderData}>
                    <AnimatedList<FolderDetailsData['items'][number]>
                        data={data?.items}
                        getKey={(item) => item.id.toString()}
                        renderItem={(item) => (
                            <FolderItem
                                item={item}
                                onLongPress={() => { }}
                                handleDeleteItem={() => { }}
                                handlePinItem={() => handlePinItem(item)}
                            />
                        )}
                    />
                </CustomPullToRefreshOnRelease>
            </View>
        </View>
    );
}
