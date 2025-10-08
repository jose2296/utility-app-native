import AnimatedList from '@/components/animatedList';
import FixedButton from '@/components/FixedButton';
import InformationModal from '@/components/InformationModal';
import Loader from '@/components/loader';
import BottomSheetOptions, { BottomSheetOption } from '@/components/modal/bottom-sheet-options';
import CollaboratorsModal from '@/components/modal/collaborators-modal';
import PageLayout from '@/components/PageLayout';
import { useLazyApi } from '@/hooks/use-api';
import { FolderDetailsData } from '@/models/folder';
import FolderItem from '@/modules/folder/folderItem';
import SaveFolderModal from '@/modules/folder/saveFolderModal';
import SaveListModal, { ListTypeValue } from '@/modules/lists/saveListModal';
import SaveNoteModal from '@/modules/notes/saveNoteModal';
import SaveWorkspaceModal, { DEFAULT_COLORS } from '@/modules/workspace/saveWorkspaceModal';
import { toast } from '@/services/toast';
import { ITEMS_ICONS } from '@/utils/dashboard';
import { parseListType } from '@/utils/lists';
import { Href, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ellipsis, Pencil, Pin, Share2, Trash2, UsersRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Share, TouchableOpacity, View } from 'react-native';

const addOptions = [
    { text: 'folder_details.add_list', value: 'add_list' },
    { text: 'folder_details.add_note', value: 'add_note' },
    { text: 'folder_details.add_folder', value: 'add_folder' }
];

export const workspaceOptions: BottomSheetOption[] = [
    { icon: <Pencil className='text-warning' />, key: 'workspaces.edit', value: 'edit_workspace' },
    { icon: <Trash2 className='text-error' />, key: 'workspaces.remove', value: 'remove_workspace' },
];

export const listOptions: BottomSheetOption[] = [
    { icon: <Pencil className='text-warning' />, key: 'lists.edit', value: 'edit_list' },
    { icon: <Pin className='text-info' />, key: 'lists.add_to_dashboard', value: 'add_list_to_dashboard' },
    { icon: <Share2 className='text-secondary' />, key: 'lists.share', value: 'share_list' },
    { icon: <UsersRound className='text-secondary' />, key: 'lists.see_collaborators', value: 'see_collaborators' },
    { icon: <Trash2 className='text-error' />, key: 'lists.remove', value: 'remove_list' },
];

export const noteOptions: BottomSheetOption[] = [
    { icon: <Pencil className='text-warning' />, key: 'notes.save_modal.edit_title', value: 'edit_note' },
    { icon: <Pin className='text-info' />, key: 'notes.add_to_dashboard', value: 'add_note_to_dashboard' },
    // { icon: <Share2 className='text-secondary' />, key: 'notes.share', value: 'share_note' },
    // { icon: <UsersRound className='text-secondary' />, key: 'notes.see_collaborators', value: 'see_collaborators' },
    { icon: <Trash2 className='text-error' />, key: 'notes.delete', value: 'remove_note' },
];

export const folderOptions: BottomSheetOption[] = [
    { icon: <Pencil className='text-warning' />, key: 'folders.save_modal.edit_title', value: 'edit_folder' },
    { icon: <Pin className='text-info' />, key: 'folders.add_to_dashboard', value: 'add_folder_to_dashboard' },
    { icon: <Trash2 className='text-error' />, key: 'folders.delete', value: 'remove_folder' },
];

const parseFolder = (workspaceId: string) => (data: FolderDetailsData): FolderDetailsData => {
    const lists = data.lists.map((item) => ({
        id: item.id,
        name: item.name,
        type: 'lists',
        listType: item.type,
        isOwner: item.isOwner,
        collaborators: item.collaborators,
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
    const [seeCollaboratorsModalOpen, setSeeCollaboratorsModalOpen] = useState(false);
    const [_listOptions, setListOptions] = useState(listOptions);
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
        const hideHeader = (loadingFolderData && !workspace) || !workspace;

        navigation.setOptions({
            title: workspace?.name,
            headerShown: !hideHeader,
            headerTintColor: workspace?.color || (workspace as any)?.root?.color,
            headerRight: () => (
                <TouchableOpacity disabled={workspaceOptionsOpen} onPress={() => setWorkspaceOptionsOpen(true)} className={`p-4 ${workspaceOptionsOpen ? 'opacity-50' : ''}`} hitSlop={10}>
                    <Ellipsis size={20} className='text-base-content' />
                </TouchableOpacity>
            )
        });
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
        setWorkspaceOptionsOpen(false);
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
                setListOptions(item.collaborators?.length ? listOptions : listOptions.filter((option) => option.value !== 'see_collaborators'));
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
                    message: `${process.env.EXPO_PUBLIC_API_URL}/collaborate/${listItemSelected?.id}?canEdit=true&title=${encodeURIComponent(listItemSelected?.name!)}&type=lists`,
                    // message: `jose-jerez-utility-app://${workspaceId}/lists/collaborate/${listItemSelected?.id}?canEdit=true&title=${listItemSelected?.name}`,
                });
                break;
            case 'see_collaborators':
                handleSeeCollaborators(listItemSelected!);
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
                    message: `${process.env.EXPO_PUBLIC_API_URL}/collaborate/${noteItemSelected?.id}?canEdit=true&title=${encodeURIComponent(noteItemSelected?.name!)}&type=notes`,
                    // message: `jose-jerez-utility-app://${workspaceId}/notes/${noteItemSelected?.id}?canEdit=true&title=${noteItemSelected?.name}`,
                });
                break;
            case 'see_collaborators':
                handleSeeCollaborators(noteItemSelected!);
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
            case 'add_folder_to_dashboard':
                await handlePinItem(folderItemSelected!);
                setShowFolderOptionsModal(false);
                setFolderItemSelected(null);
                break;
            case 'remove_folder':
                setShowFolderOptionsModal(false);
                await handleOpenDeleteItemModal(folderItemSelected!);
                break;
        }
    }

    const handleSeeCollaborators = (item: FolderDetailsData['items'][number]) => {
        switch (item.type) {
            case 'lists':
                setShowListOptionsModal(false);
                setListItemSelected(item);
                break;
            // case 'notes':
            //     setNoteItemSelected(item);
            //     break;
        }
        setSeeCollaboratorsModalOpen(true);
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
                            handleSeeCollaborators={() => handleSeeCollaborators(item)}
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

            {/* workspace Item Options */}
            <BottomSheetOptions
                isOpen={workspaceOptionsOpen}
                onClose={() => { setWorkspaceOptionsOpen(false); setListItemSelected(null); }}
                options={workspaceOptions}
                title={workspace?.name || ''}
                handleItemOptionSelected={(value) => handleItemOptionSelected(value)}
            />

            {/* List options */}
            <BottomSheetOptions
                isOpen={showListOptionsModal}
                onClose={() => setShowListOptionsModal(false)}
                options={_listOptions}
                title={listItemSelected?.name || ''}
                handleItemOptionSelected={(value) => handleListOptionSelected(value)}
            />

            {/* Note options */}
            <BottomSheetOptions
                isOpen={showNoteOptionsModal}
                onClose={() => setShowNoteOptionsModal(false)}
                options={noteOptions}
                title={noteItemSelected?.name || ''}
                handleItemOptionSelected={(value) => handleNoteOptionSelected(value)}
            />

            {/* Folder options */}
            <BottomSheetOptions
                isOpen={showFolderOptionsModal}
                onClose={() => setShowFolderOptionsModal(false)}
                options={folderOptions}
                title={folderItemSelected?.name || ''}
                handleItemOptionSelected={(value) => handleFolderOptionSelected(value)}
            />

            {/* collaborators modal */}
            <CollaboratorsModal
                isOpen={seeCollaboratorsModalOpen}
                onClose={() => { setSeeCollaboratorsModalOpen(false); setListItemSelected(null); }}
                collaborators={listItemSelected?.collaborators || []}
            />

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
