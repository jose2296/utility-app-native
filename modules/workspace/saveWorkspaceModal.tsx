import { GradientBall } from '@/app/(app)/_layout';
import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { getContrastColor } from '@/services/utils';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

export const DEFAULT_COLORS = [
    '#f44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#8BC34A',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#795548',
    '#607D8B',
];

interface SaveWorkspaceModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    onClose: () => void;
    workspace: any;
    onSubmit: (workspace: any) => void;
    isSaving: boolean;
}
const SaveWorkspaceModal = ({ isOpen, mode, onClose, workspace, onSubmit, isSaving }: SaveWorkspaceModalProps) => {
    const [workspaceItemSelected, setWorkspaceItemSelected] = useState<any>(workspace);
    const [showCustomColor, setShowCustomColor] = useState(false);

    useEffect(() => {
        if (workspace) {
            setWorkspaceItemSelected(workspace);
        }
    }, [workspace]);

    return (
        <>

            <BottomSheet
                isOpen={isOpen}
                onClose={() => { onClose(); }}
                sheetHeight={350}
            >
                <ScrollView className='flex flex-1 flex-col relative'>
                    <Text text={mode === 'create' ? 'workspaces.save_modal.create_title' : 'workspaces.save_modal.edit_title'} className='text-base-content text-2xl font-bold' />
                    <View className='h-0.5 bg-base-content/50 my-2' />
                    <View className='flex flex-col gap-y-6'>
                        <Input
                            label={'workspaces.save_modal.name'}
                            value={workspaceItemSelected?.name || ''}
                            onSubmitEditing={onSubmit}
                            onChangeText={(value) => {
                                setWorkspaceItemSelected({ ...workspaceItemSelected, name: value });
                            }}
                        />
                        {/* TODO: Scroll to selected element when edit workspace */}
                        <ScrollView horizontal contentContainerClassName='gap-8 flex py-4'>
                            <TouchableOpacity
                                onPress={() => setShowCustomColor(true)}
                                className={`w-12 h-12 items-center justify-center rounded-xl bg-transparent border-2 overflow-hidden ${(workspaceItemSelected?.customColor) ? 'border-info' : 'border-base-300'}`}
                                style={{ transform: [{ translateY: workspaceItemSelected?.customColor ? -2 : 0 }] }}
                            >
                                {/* <Plus size={30} className={`${workspaceItemSelected?.customColor ? getContrastColor(workspaceItemSelected?.customColor) === 'black' ? 'text-black' : 'text-white' : 'text-white'}`} /> */}
                                <GradientBall color={workspaceItemSelected?.customColor || DEFAULT_COLORS[0]} className='size-full rounded-none absolute' />
                                <Plus size={20} stroke={getContrastColor(workspaceItemSelected?.customColor || DEFAULT_COLORS[0]).color} className='absolute' />
                            </TouchableOpacity>
                            {DEFAULT_COLORS.map((color, index) => {
                                return (
                                    <TouchableOpacity
                                        key={color + index}
                                        onPress={() => setWorkspaceItemSelected({ ...workspaceItemSelected, color, customColor: undefined })}
                                        className={`w-12 h-12 rounded-xl border-2 overflow-hidden ${(!workspaceItemSelected?.customColor && (workspaceItemSelected?.color || DEFAULT_COLORS[0])) === color ? 'border-info' : 'border-base-300'}`}
                                        style={{ transform: [{ translateY: (!workspaceItemSelected?.customColor && (workspaceItemSelected?.color || DEFAULT_COLORS[0])) === color ? -2 : 0 }] }}
                                    >
                                        <GradientBall color={color} className='size-full rounded-none' />
                                    </TouchableOpacity>
                                )})}
                        </ScrollView>
                        <View className='items-end'>
                            <Button
                                disabled={!workspaceItemSelected?.name.trim() || (!workspaceItemSelected?.color && !workspaceItemSelected?.customColor)}
                                name={mode === 'create' ? 'create' : 'save'}
                                onPress={() => onSubmit(workspaceItemSelected)}
                                isLoading={isSaving}
                            />
                        </View>
                    </View>
                </ScrollView>
            </BottomSheet>

            <BottomSheet
                isOpen={showCustomColor}
                onClose={() => setShowCustomColor(false)}
                sheetHeight={450}
            >
                <View className='flex-1 justify-between gap-4'>
                    <Text
                        text={'workspaces.save_modal.pick_color'}
                        className='text-base-content text-2xl font-bold'
                    />
                    <ColorPicker
                        style={{ width: '80%', margin: 'auto', gap: 10 }}
                        value={workspaceItemSelected?.customColor}
                        onCompleteJS={({ hex }) => setWorkspaceItemSelected({ ...workspaceItemSelected, customColor: hex })}
                    >
                        {/* <Preview /> */}
                        <Panel1 />
                        <HueSlider />
                        {/* <OpacitySlider /> */}
                    </ColorPicker>

                    <View className='items-end'>
                        <Button
                            disabled={!workspaceItemSelected?.customColor}
                            name="save"
                            onPress={() => setShowCustomColor(false)}
                        />
                    </View>
                </View>
            </BottomSheet>
        </>
    );
};

export default SaveWorkspaceModal;
