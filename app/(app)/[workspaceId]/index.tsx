import AnimatedList from '@/components/animatedList';
import BottomSheet from '@/components/BottomSheet';
import FixedButton from '@/components/FixedButton';
import InformationModal from '@/components/InformationModal';
import Loader from '@/components/loader';
import PageLayout from '@/components/PageLayout';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { FolderDetailsData } from '@/models/folder';
import FolderItem from '@/modules/folder/folderItem';
import SaveFolderModal from '@/modules/folder/saveFolderModal';
import SaveListModal, { ListTypeValue } from '@/modules/lists/saveListModal';
import SaveNoteModal from '@/modules/notes/saveNoteModal';
import SaveWorkspaceModal, { DEFAULT_COLORS } from '@/modules/workspace/saveWorkspaceModal';
import { toast } from '@/services/toast';
import { ItemIcon, ITEMS_ICONS } from '@/utils/dashboard';
import { parseListType } from '@/utils/lists';
import { Href, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ellipsis, Pencil, Pin, Trash2, UsersRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Share, TouchableOpacity, View } from 'react-native';

const addOptions = [
    { text: 'folder_details.add_list', value: 'add_list' },
    { text: 'folder_details.add_note', value: 'add_note' },
    { text: 'folder_details.add_folder', value: 'add_folder' }
];

const workspaceOptions = [
    { icon: <Pencil className='text-warning' />, key: 'workspaces.edit', value: 'edit_workspace' },
    { icon: <Trash2 className='text-error' />, key: 'workspaces.remove', value: 'remove_workspace' },
];

const listOptions = [
    { icon: <Pencil className='text-warning' />, key: 'lists.edit', value: 'edit_list' },
    { icon: <Pin className='text-info' />, key: 'lists.add_to_dashboard', value: 'add_list_to_dashboard' },
    { icon: <UsersRound className='text-secondary' />, key: 'lists.share', value: 'share_list' },
    { icon: <Trash2 className='text-error' />, key: 'lists.remove', value: 'remove_list' },
];

const noteOptions = [
    { icon: <Pencil className='text-warning' />, key: 'notes.save_modal.edit_title', value: 'edit_note' },
    { icon: <Pin className='text-info' />, key: 'notes.add_to_dashboard', value: 'add_note_to_dashboard' },
    { icon: <UsersRound className='text-secondary' />, key: 'notes.share', value: 'share_note' },
    { icon: <Trash2 className='text-error' />, key: 'notes.delete', value: 'remove_note' },
];

const folderOptions = [
    { icon: <Pencil className='text-warning' />, key: 'folders.save_modal.edit_title', value: 'edit_folder' },
    { icon: <Trash2 className='text-error' />, key: 'folders.delete', value: 'remove_folder' },
];

const parseFolder = (workspaceId: string) => (data: FolderDetailsData): FolderDetailsData => {
    const lists = data.lists.map((item) => ({
        id: item.id,
        name: item.name,
        type: 'lists',
        listType: item.type,
        isOwner: item.isOwner,
        icon: item.type as keyof typeof ITEMS_ICONS,
        href: `/(app)/${workspaceId}/lists/${parseListType(item.type)}/${item.id}` as Href
    }));
    const notes = data.notes.map((item) => ({
        id: item.id,
        name: item.title,
        icon: 'notes' as keyof typeof ITEMS_ICONS,
        type: 'notes',
        isOwner: item.isOwner,
        href: `/(app)/${workspaceId}/notes/${item.id}` as Href,
    }));
    const children = data.children.map((item) => ({
        id: item.id,
        name: item.name,
        icon: 'folders' as keyof typeof ITEMS_ICONS,
        type: 'folders',
        isOwner: true,
        href: `/(app)/${workspaceId}/${item.id}` as Href,
    })) as any[];

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
    // const workspace = useUserStore((state) => state.data?.workspaces?.find((workspace) => workspace.id === Number(workspaceId)));
    const transform = useCallback(
        parseFolder(workspaceId as string),
        [workspaceId]
    );
    const { data: workspace, loading: loadingFolderData, request: getFolderData } = useLazyApi(`folders/${folderId || workspaceId}`, 'GET', null, transform);
    const { request: saveList } = useLazyApi(`lists`, 'POST');
    const { request: addItemToDashboard } = useLazyApi(`dashboard`, 'POST');
    const [showSaveListModal, setShowSaveListModal] = useState(false);
    const [showSaveNoteModal, setShowSaveNoteModal] = useState(false);
    const [showSaveFolderModal, setShowSaveFolderModal] = useState(false);
    const [showListOptionsModal, setShowListOptionsModal] = useState(false);
    const [showNoteOptionsModal, setShowNoteOptionsModal] = useState(false);
    const [showFolderOptionsModal, setShowFolderOptionsModal] = useState(false);
    const [deleteListModalOpen, setDeleteListModalOpen] = useState(false);
    const [deleteNoteModalOpen, setDeleteNoteModalOpen] = useState(false);

    const [listItemSelected, setListItemSelected] = useState<FolderDetailsData['items'][number] | null>(null);
    const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
    const [folderItemSelected, setFolderItemSelected] = useState<FolderDetailsData['items'][number] | null>(null);
    const [noteItemSelected, setNoteItemSelected] = useState<FolderDetailsData['items'][number] | null>(null);
    const { request: deleteList, loading: deletingList } = useLazyApi(`lists/:id`, 'DELETE');
    const { request: deleteFolder, loading: deletingFolder } = useLazyApi(`folders/:id`, 'DELETE');
    const { request: deleteNote, loading: deletingNote } = useLazyApi(`notes/:id`, 'DELETE');
    const { request: saveNote } = useLazyApi(`notes`, 'POST');
    const { request: saveFolder } = useLazyApi(`folders`, 'POST');
    const [workspaceOptionsOpen, setWorkspaceOptionsOpen] = useState(false);
    const [openSaveWorkspaceModal, setOpenSaveWorkspaceModal] = useState(false);
    const { request: saveWorkspace, loading: savingWorkspace } = useLazyApi<any>(`folders`, 'POST');

    useEffect(() => {
        getFolderData();
    }, [folderId, workspaceId]);

    useEffect(() => {
        if (workspace) {
            navigation.setOptions({
                title: workspace.name,
                headerTintColor: workspace.color,
                headerRight: () => (
                    <TouchableOpacity disabled={workspaceOptionsOpen} onPress={() => setWorkspaceOptionsOpen(true)} className={`p-4 ${workspaceOptionsOpen ? 'opacity-50' : ''}`} hitSlop={10}>
                        <Ellipsis size={20} className='text-base-content' />
                    </TouchableOpacity>
                )
            });
        }
    }, [workspace, workspaceOptionsOpen]);

    const handlePinItem = async (item: FolderDetailsData['items'][number]) => {
        toast.promise(
            addItemToDashboard(`dashboard`, { entity_id: item.id, entity_type: item.type, size: { width: 1, height: 1 } }),
            {
                loading: {
                    title: 'dashboard.adding_item_to_dashboard',
                    translateData: {
                        name: item.name
                    }
                },
                success: {
                    title: 'dashboard.item_added_to_dashboard',
                    translateData: {
                        name: item.name
                    }
                },
                error: {
                    title: 'dashboard.item_already_in_dashboard',
                    translateData: {
                        name: item.name
                    }
                }
            }
        )
    }

    const handleAddItem = (value: string) => {
        switch (value) {
            case 'add_list':
                setShowSaveListModal(true);
                break;
            case 'add_note':
                setShowSaveNoteModal(true);
                break;
            case 'add_folder':
                setShowSaveFolderModal(true);
                break;
        }
    }

    const handleOpenDeleteItemModal = (item: FolderDetailsData['items'][number]) => {
        switch (item.type) {
            case 'lists':
                setListItemSelected(item);
                setDeleteListModalOpen(true);
                break;
            case 'notes':
                setNoteItemSelected(item);
                setDeleteNoteModalOpen(true);
                break;
            case 'folders':
                setFolderItemSelected(item);
                setDeleteFolderModalOpen(true);
                break;
        }
    };

    const handleEditItem = (item: FolderDetailsData['items'][number]) => {
        switch (item.type) {
            case 'lists':
                setListItemSelected(item);
                setShowSaveListModal(true);
                break;
            case 'notes':
                setNoteItemSelected(item);
                setShowSaveNoteModal(true);
                break;
            case 'folders':
                setFolderItemSelected(item);
                setShowSaveFolderModal(true);
                break;
        }
    };

    const handleDeleteList = async () => {
        if (!listItemSelected) return;

        await deleteList(`lists/${listItemSelected.id}`, null);
        setDeleteListModalOpen(false);
        setListItemSelected(null);

        getFolderData();
    };

    const handleDeleteFolder = async () => {
        if (!folderItemSelected) return;

        // TODO: Check if folder has items before remove it
        await deleteFolder(`folders/${folderItemSelected.id}`, null);
        setDeleteFolderModalOpen(false);
        setFolderItemSelected(null);

        getFolderData();
    };

    const handleDeleteNote = async () => {
        if (!noteItemSelected) return;

        await deleteNote(`notes/${noteItemSelected.id}`, null);
        setDeleteNoteModalOpen(false);
        setNoteItemSelected(null);

        getFolderData();
    };

    const handleSaveList = async ({ name, type }: { name: string, type: ListTypeValue }) => {
        const data = {
            name,
            type,
            folder_id: Number(folderId || workspaceId),
            id: listItemSelected?.id ? Number(listItemSelected.id) : undefined
        };

        try {
            await saveList(`lists/${listItemSelected?.id || ''}`, data);
            getFolderData();

        } catch (error) {
            console.error(error);
        }
    }

    const handleSaveFolder = async (name: string) => {
        const data = folderItemSelected ? {
            name,
            id: folderItemSelected?.id
        } : {
            name,
            parent_id: Number(folderId || workspaceId)
        };

        try {
            await saveFolder(`folders/${folderItemSelected?.id || ''}`, data);
            getFolderData();

        } catch (error) {
            console.error(error);
        }
    }

    const handleSaveNote = async (title: string) => {
        const data = {
            title,
            folder_id: Number(folderId || workspaceId),
            id: noteItemSelected?.id ? Number(noteItemSelected.id) : undefined
        };

        try {
            await saveNote(`notes/${noteItemSelected?.id || ''}`, data);
            getFolderData();

        } catch (error) {
            console.error(error);
        }
    }

    const handleItemOptionSelected = (value: string) => {
        switch (value) {
            case 'edit_workspace':
                setOpenSaveWorkspaceModal(true);
                break;
            case 'remove_workspace':
                break;
        }
    };


    const handleSaveWorkspace = async (workspace: any) => {
        if (!workspace?.name.trim()) {
            return;
        }

        const newWorkspace = {
            name: workspace?.name,
            color: workspace?.customColor || workspace?.color || DEFAULT_COLORS[0]
        };

        try {
            await saveWorkspace(`folders/${workspace?.id}`, newWorkspace);
            setOpenSaveWorkspaceModal(false);
            getFolderData();
        } catch (error) {
            console.error('Error saving new workspace:', error);
        }
    };

    const handleItemLongPress = (item: FolderDetailsData['items'][number]) => {
        switch (item.type) {
            case 'lists':
                setListItemSelected(item);
                setShowListOptionsModal(true);
                break;
            case 'notes':
                setNoteItemSelected(item);
                setShowNoteOptionsModal(true);
                break;
            case 'folders':
                setFolderItemSelected(item);
                setShowFolderOptionsModal(true);
                break;
        }
    }

    const handleListOptionSelected = async (value: string) => {
        switch (value) {
            case 'edit_list':
                setShowListOptionsModal(false);
                await handleEditItem(listItemSelected!);
                break;
            case 'add_list_to_dashboard':
                await handlePinItem(listItemSelected!);
                setListItemSelected(null);
                setShowListOptionsModal(false);
                break;
            case 'share_list':
                setShowListOptionsModal(false);
                await Share.share({
                    title: listItemSelected?.name || '',
                    message: `jose-jerez-utility-app://${workspaceId}/lists/collaborate/${listItemSelected?.id}?canEdit=true&title=${listItemSelected?.name}`,
                });
                break;
            case 'remove_list':
                setShowListOptionsModal(false);
                await handleOpenDeleteItemModal(listItemSelected!);
                break;
        }
    }

    const handleNoteOptionSelected = async (value: string) => {
        switch (value) {
            case 'edit_note':
                setShowNoteOptionsModal(false);
                await handleEditItem(noteItemSelected!);
                break;
            case 'add_note_to_dashboard':
                await handlePinItem(noteItemSelected!);
                setNoteItemSelected(null);
                setShowNoteOptionsModal(false);
                break;
            case 'share_note':
                setShowNoteOptionsModal(false);
                await Share.share({
                    title: noteItemSelected?.name || '',
                    message: `jose-jerez-utility-app://${workspaceId}/notes/${noteItemSelected?.id}?canEdit=true&title=${noteItemSelected?.name}`,
                });
                break;
            case 'remove_note':
                setShowNoteOptionsModal(false);
                await handleOpenDeleteItemModal(noteItemSelected!);
                break;
        }
    }

    const handleFolderOptionSelected = async (value: string) => {
        switch (value) {
            case 'edit_folder':
                setShowFolderOptionsModal(false);
                await handleEditItem(folderItemSelected!);
                break;
            case 'remove_folder':
                setShowFolderOptionsModal(false);
                await handleOpenDeleteItemModal(folderItemSelected!);
                break;
        }
    }
    if (loadingFolderData || !workspace) {
        return (
            <View className='flex flex-1 flex-col items-center gap-2 justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <PageLayout onRefresh={getFolderData} breadcrumbData={workspace?.breadcrumb}>
                <AnimatedList<FolderDetailsData['items'][number]>
                    data={workspace?.items}
                    getKey={(item) => `${item.id}-${item.type}`}
                    renderItem={(item) => (
                        <FolderItem
                            item={item}
                            onLongPress={() => handleItemLongPress(item)}
                            handleDeleteItem={() => handleOpenDeleteItemModal(item)}
                            handleEditItem={() => handleEditItem(item)}
                            handlePinItem={() => handlePinItem(item)}
                        />
                    )}
                />
            </PageLayout>
            {/* <View className='px-4 py-4 gap-4 flex-1'>
                <Breadcrumb breadcrumb={data?.breadcrumb} />

                <View className='flex flex-1 flex-col gap-y-6'>
                    <CustomPullToRefreshOnRelease onRefresh={getFolderData}>
                        <AnimatedList<FolderDetailsData['items'][number]>
                            data={data?.items}
                            getKey={(item) => `${item.id}-${item.type}`}
                            renderItem={(item) => (
                                <FolderItem
                                    item={item}
                                    onLongPress={() => { }}
                                    handleDeleteItem={() => handleOpenDeleteItemModal(item)}
                                    handleEditItem={() => handleEditItem(item)}
                                    handlePinItem={() => handlePinItem(item)}
                                />
                            )}
                        />
                    </CustomPullToRefreshOnRelease>
                </View>
            </View> */}

            <FixedButton
                options={addOptions}
                onPress={(value) => handleAddItem(value!)}
            />

            {/* Save list modal */}
            <SaveListModal
                isOpen={showSaveListModal}
                mode={listItemSelected ? 'edit' : 'create'}
                data={listItemSelected ? { name: listItemSelected.name, type: listItemSelected.listType! } : undefined}
                onClose={() => { setShowSaveListModal(false); setListItemSelected(null); }}
                onSubmit={(data) => {
                    setShowSaveListModal(false);
                    handleSaveList(data);
                    // Alert.alert(data.name, data.type);
                }}
            />

            {/* Save note modal */}
            <SaveNoteModal
                isOpen={showSaveNoteModal}
                mode={noteItemSelected ? 'edit' : 'create'}
                name={noteItemSelected?.name || ''}
                onClose={() => { setShowSaveNoteModal(false); setNoteItemSelected(null); }}
                onSubmit={(name) => {
                    setShowSaveNoteModal(false);
                    handleSaveNote(name);
                }}
            />

            {/* Save folder modal */}
            <SaveFolderModal
                isOpen={showSaveFolderModal}
                mode={folderItemSelected ? 'edit' : 'create'}
                name={folderItemSelected?.name || ''}
                onClose={() => { setShowSaveFolderModal(false); setFolderItemSelected(null); }}
                onSubmit={(name) => {
                    setShowSaveFolderModal(false);
                    handleSaveFolder(name);
                }}
            />

            {/* workspace Item Options */}
            <BottomSheet isOpen={!!workspaceOptionsOpen} onClose={() => { setWorkspaceOptionsOpen(false); setListItemSelected(null); }} sheetHeight={300}>
                <View className='flex flex-1 px-4'>
                    <Text avoidTranslation text={workspace?.name || ''} className='text-xl font-bold text-base-content' />

                    <View className='flex gap-4 pt-4'>
                        {workspaceOptions?.map((_itemOption) => (
                            <TouchableOpacity
                                key={_itemOption.value}
                                className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                                onPress={() => handleItemOptionSelected(_itemOption.value)}
                            >
                                {_itemOption.icon}
                                <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Save workspace modal */}
            <SaveWorkspaceModal
                isOpen={openSaveWorkspaceModal}
                mode={'edit'}
                workspace={workspace}
                onClose={() => { setOpenSaveWorkspaceModal(false); }}
                isSaving={false}
                onSubmit={(workspace) => {
                    setWorkspaceOptionsOpen(false);
                    handleSaveWorkspace(workspace);
                }}
            />

            {/* List options */}
            <BottomSheet isOpen={!!showListOptionsModal} onClose={() => setShowListOptionsModal(false)} sheetHeight={440}>
                <View className='flex flex-1 px-4 gap-2'>
                    <View className='flex flex-row items-center gap-4'>
                        {listItemSelected?.icon && <ItemIcon icon={listItemSelected?.icon!} />}
                        <Text avoidTranslation text={listItemSelected?.name || ''} className='text-xl font-bold text-base-content' />
                    </View>

                    <View className='flex gap-4 pt-4'>
                        {listOptions?.map((_itemOption) => (
                            <TouchableOpacity
                                key={_itemOption.value}
                                className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                                onPress={() => handleListOptionSelected(_itemOption.value)}
                            >
                                {_itemOption.icon}
                                <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Note options */}
            <BottomSheet isOpen={!!showNoteOptionsModal} onClose={() => setShowNoteOptionsModal(false)} sheetHeight={440}>
                <View className='flex flex-1 px-4 gap-2'>
                    <View className='flex flex-row items-center gap-4'>
                        {noteItemSelected?.icon && <ItemIcon icon={noteItemSelected?.icon!} />}
                        <Text avoidTranslation text={noteItemSelected?.name || ''} className='text-xl font-bold text-base-content' />
                    </View>

                    <View className='flex gap-4 pt-4'>
                        {noteOptions?.map((_itemOption) => (
                            <TouchableOpacity
                                key={_itemOption.value}
                                className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                                onPress={() => handleNoteOptionSelected(_itemOption.value)}
                            >
                                {_itemOption.icon}
                                <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Folder options */}
            <BottomSheet isOpen={!!showFolderOptionsModal} onClose={() => setShowFolderOptionsModal(false)} sheetHeight={300}>
                <View className='flex flex-1 px-4 gap-2'>
                    <View className='flex flex-row items-center gap-4'>
                        {folderItemSelected?.icon && <ItemIcon icon={folderItemSelected?.icon!} />}
                        <Text avoidTranslation text={folderItemSelected?.name || ''} className='text-xl font-bold text-base-content' />
                    </View>

                    <View className='flex gap-4 pt-4'>
                        {folderOptions?.map((_itemOption) => (
                            <TouchableOpacity
                                key={_itemOption.value}
                                className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                                onPress={() => handleFolderOptionSelected(_itemOption.value)}
                            >
                                {_itemOption.icon}
                                <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Delete list modal */}
            <InformationModal
                isOpen={deleteListModalOpen}
                title="list.delete_list"
                message="list.delete_list_confirmation"
                messageTranslateData={{ name: listItemSelected?.name || '' }}
                onClose={() => { setDeleteListModalOpen(false); setListItemSelected(null); }}
                onSubmit={handleDeleteList}
                isLoading={deletingList}
            />
            {/* TODO: Delete workspace modal */}

            {/* Delete folder modal */}
            <InformationModal
                isOpen={deleteFolderModalOpen}
                title="folders.delete"
                message="folders.delete_confirmation"
                messageTranslateData={{ name: folderItemSelected?.name || '' }}
                onClose={() => { setDeleteFolderModalOpen(false); setFolderItemSelected(null); }}
                onSubmit={handleDeleteFolder}
                isLoading={deletingFolder}
            />

            {/* Delete note modal */}
            <InformationModal
                isOpen={deleteNoteModalOpen}
                title="notes.delete"
                message="notes.delete_confirmation"
                messageTranslateData={{ name: noteItemSelected?.name || '' }}
                onClose={() => { setDeleteNoteModalOpen(false); setNoteItemSelected(null); }}
                onSubmit={handleDeleteNote}
                isLoading={deletingNote}
            />
        </>
    );
}
