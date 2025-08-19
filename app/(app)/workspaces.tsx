import AnimatedList from "@/components/animatedList";
import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import InformationModal from '@/components/InformationModal';
import { Input } from '@/components/input';
import Loader from '@/components/loader';
import CustomPullToRefreshOnRelease from '@/components/pullToRefresh';
import Text from '@/components/Text';
import WorkspaceItem from '@/components/workspace/workspaceItem';
import { useLazyApi } from "@/hooks/use-api";
import { Folder } from "@/models/folder";
import { useFocusEffect } from "expo-router";
import { Plus } from 'lucide-react-native';
import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';


const DEFAULT_COLORS = [
    '#f44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
];

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

    useFocusEffect(
        useCallback(() => {
            getWorkspaces();
        }, [])
    );

    const handleSaveWorkspace = async () => {
        if (!workspaceItemSelected?.name.trim()) {
            return;
        }

        const newWorkspace = {
            name: workspaceItemSelected?.name,
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

    const handleSaveNewWorkspace = async () => {
        if (!workspaceItemSelected?.name.trim()) {
            return;
        }

        const newWorkspace = {
            name: workspaceItemSelected?.name,
            color: workspaceItemSelected?.color || DEFAULT_COLORS[0],
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
            <View className='px-4 py-4 gap-4 flex-1'>
                <CustomPullToRefreshOnRelease onRefresh={getWorkspaces}>
                    <AnimatedList<any>
                        data={folders}
                        getKey={(item) => item.id.toString()}
                        renderItem={(item) => (
                            <WorkspaceItem
                                key={item.id}
                                item={item}
                                handleDeleteItem={handleOpenDeleteWorkspaceModal}
                                handlePinItem={() => { }}
                            />
                        )}
                    />
                </CustomPullToRefreshOnRelease>

            </View>

            <BottomSheet
                isOpen={editWorkspaceModalOpen}
                onClose={() => { setEditWorkspaceModalOpen(false); setWorkspaceItemSelected(null); }}
                sheetHeight={350}
            >
                <ScrollView className='flex flex-1 flex-col relative'>
                    <Text text={saveWorkspaceModalMode === 'create' ? 'workspaces.save_modal.create_title' : 'workspaces.save_modal.edit_title'} className='text-base-content text-2xl font-bold' />
                    <View className='h-0.5 bg-base-content/50 my-2' />
                    <View className='flex flex-col gap-y-6'>
                        <Input
                            label={'workspaces.save_modal.name'}
                            value={workspaceItemSelected?.name || ''}
                            onSubmitEditing={saveWorkspaceModalMode === 'create' ? handleSaveNewWorkspace : handleSaveWorkspace}
                            onChangeText={(value) => {
                                setWorkspaceItemSelected({ ...workspaceItemSelected, name: value });
                            }}
                        />
                        <ScrollView horizontal contentContainerClassName='gap-8 flex pb-4'>
                            <TouchableOpacity
                                onPress={() => setWorkspaceItemSelected({ ...workspaceItemSelected, customColor: true })}
                                className={`w-12 h-12 items-center justify-center rounded-xl bg-transparent ${(workspaceItemSelected?.customColor) ? 'border-2 border-info' : ''}`}
                            >
                                <Plus size={30} className='text-base-content' />
                            </TouchableOpacity>
                            {DEFAULT_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setWorkspaceItemSelected({ ...workspaceItemSelected, color, customColor: false })}
                                    className={`w-12 h-12 rounded-xl ${(workspaceItemSelected?.color || DEFAULT_COLORS[0]) === color ? 'border-2 border-info' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </ScrollView>
                        <Button
                            name={saveWorkspaceModalMode === 'create' ? 'create' : 'save'}
                            onPress={saveWorkspaceModalMode === 'create' ? handleSaveNewWorkspace : handleSaveWorkspace}
                            isLoading={savingWorkspace}
                        />
                    </View>
                </ScrollView>

                {workspaceItemSelected?.customColor &&
                    <View className='absolute top-0 left-0 right-0 z-50 bg-base-100 h-full'>
                        <Text text={'workspaces.save_modal.pick_color'} className='text-base-content text-2xl font-bold text-center' />
                        <ColorPicker style={{ width: '80%', margin: 'auto', gap: 10, height: 'auto' }} value={workspaceItemSelected?.color || DEFAULT_COLORS[0]} onCompleteJS={({ hex }) => setWorkspaceItemSelected({ ...workspaceItemSelected, color: hex })}>
                            {/* <Preview /> */}
                            <Panel1 />
                            <HueSlider />
                            {/* <OpacitySlider /> */}
                        </ColorPicker>
                        <Button
                            name="save"
                            onPress={() => setWorkspaceItemSelected({ ...workspaceItemSelected, customColor: false })}
                        />
                    </View>
                }
            </BottomSheet>

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
                onPress={() => { setSaveWorkspaceModalMode('create'); setWorkspaceItemSelected(null); setEditWorkspaceModalOpen(true); }}
                className='absolute right-4 p-4 bg-primary rounded-full shadow-lg'
                style={{ bottom: insets.bottom + 10 }}
            >
                <Plus size={35} className='text-primary-content' />
            </TouchableOpacity>
        </>
    );
}

export default Workspaces;
