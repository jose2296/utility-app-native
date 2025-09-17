import AnimatedList from "@/components/animatedList";
import InformationModal from '@/components/InformationModal';
import Loader from '@/components/loader';
import PageLayout from '@/components/PageLayout';
import { useLazyApi } from "@/hooks/use-api";
import { Folder } from "@/models/folder";
import { Me } from '@/models/me';
import SaveWorkspaceModal, { DEFAULT_COLORS } from '@/modules/workspace/saveWorkspaceModal';
import WorkspaceItem from '@/modules/workspace/workspaceItem';
import { useUserStore } from '@/store';
import { useFocusEffect } from "expo-router";
import { Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const parseWorkspaces = (data: any) => {
    return data.map((folder: any) => {
        return {
            ...folder,
            href: `/(app)/${folder.id}`,
        };
    });
}

const Workspaces = () => {
    const { request: getWorkspaces, data: folders, loading } = useLazyApi<Folder[]>('folders', 'GET', null, parseWorkspaces);
    const [editWorkspaceModalOpen, setEditWorkspaceModalOpen] = useState(false);
    const [saveWorkspaceModalMode, setSaveWorkspaceModalMode] = useState<'edit' | 'create' | null>(null);
    const [deleteWorkspaceModalOpen, setDeleteWorkspaceModalOpen] = useState(false);
    const [workspaceItemSelected, setWorkspaceItemSelected] = useState<any>(null);
    const { request: saveWorkspace, loading: savingWorkspace } = useLazyApi<any>(`folders`, 'POST');
    const { request: deleteWorkspace, loading: deletingWorkspace } = useLazyApi<any>(`folders`, 'DELETE');
    const insets = useSafeAreaInsets();
    const { data, setData } = useUserStore();

    useFocusEffect(
        useCallback(() => {
            getWorkspaces();
        }, [])
    );

    useEffect(() => {
        setData({
            ...data as Me,
            workspaces: folders as Folder[]
        });
    }, [folders]);

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
            setWorkspaceItemSelected(null);
            setSaveWorkspaceModalMode(null);
            setEditWorkspaceModalOpen(false);

            getWorkspaces();
        } catch (error) {
            console.error('Error saving new workspace:', error);
        }
    };

    const handleSaveNewWorkspace = async (workspace: any) => {
        if (!workspace?.name.trim()) {
            return;
        }

        const newWorkspace = {
            name: workspace?.name,
            color: workspace?.customColor || workspace?.color || DEFAULT_COLORS[0],
        };

        try {
            await saveWorkspace(`folders`, newWorkspace);
            setWorkspaceItemSelected(null);
            setSaveWorkspaceModalMode(null);
            setEditWorkspaceModalOpen(false);

            getWorkspaces();
        } catch (error) {
            console.error('Error saving new workspace:', error);
        }
    };

    const handleOpenDeleteWorkspaceModal = async (workspace: any) => {
        setWorkspaceItemSelected(workspace);
        setDeleteWorkspaceModalOpen(true);
    };

    const handleOpenEditWorkspaceModal = async (workspace: any) => {
        setSaveWorkspaceModalMode('edit');
        setWorkspaceItemSelected({ ...workspace, customColor: DEFAULT_COLORS.find((color) => color === workspace.color) ? undefined : workspace.color });
        setEditWorkspaceModalOpen(true);
    };

    const handleDeleteWorkspace = async () => {
        await deleteWorkspace(`folders/${workspaceItemSelected.id}`, null);
        setDeleteWorkspaceModalOpen(false);
        setWorkspaceItemSelected(null);

        getWorkspaces();
    };

    if (!folders) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={50} />
            </View>
        );
    }

    return (
        <>
            <PageLayout onRefresh={getWorkspaces}>
                <ScrollView contentContainerClassName='gap-4' style={{ paddingBottom: insets.bottom + 10 }}>
                    <AnimatedList<any>
                        data={folders}
                        getKey={(item) => item.id.toString()}
                        renderItem={(item) => (
                            <WorkspaceItem
                                key={item.id}
                                item={item}
                                handleDeleteItem={handleOpenDeleteWorkspaceModal}
                                handleEditItem={handleOpenEditWorkspaceModal}
                            />
                        )}
                    />
                </ScrollView>
            </PageLayout>

            <SaveWorkspaceModal
                isOpen={editWorkspaceModalOpen}
                mode={saveWorkspaceModalMode!}
                isSaving={savingWorkspace}
                onClose={() => setEditWorkspaceModalOpen(false)}
                workspace={workspaceItemSelected}
                onSubmit={(workspace) => saveWorkspaceModalMode === 'create' ? handleSaveNewWorkspace(workspace) : handleSaveWorkspace(workspace)}
            />

            <InformationModal
                isOpen={deleteWorkspaceModalOpen}
                title="workspaces.remove"
                message="workspaces.remove_message"
                messageTranslateData={{ name: workspaceItemSelected?.name || '' }}
                onClose={() => { setDeleteWorkspaceModalOpen(false); setWorkspaceItemSelected(null); }}
                onSubmit={handleDeleteWorkspace}
                isLoading={deletingWorkspace}
            />

            <TouchableOpacity
                onPress={() => { setSaveWorkspaceModalMode('create'); setWorkspaceItemSelected({ name: '', color: DEFAULT_COLORS[0], customColor: undefined }); setEditWorkspaceModalOpen(true); }}
                className='absolute right-4 p-4 bg-primary rounded-full shadow-lg'
                style={{ bottom: insets.bottom + 10 }}
            >
                <Plus size={35} className='text-primary-content' />
            </TouchableOpacity>
        </>
    );
}

export default Workspaces;
