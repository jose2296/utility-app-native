import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import DropDownModal from '../../components/dropdown/DropdownModal';

const LIST_TYPES: { key: string, value: 'tasks' | 'movies' | 'series' | 'movies_and_series' | 'books' }[] = [
    { key: 'list_types.tasks', value: 'tasks' },
    { key: 'list_types.movies', value: 'movies' },
    { key: 'list_types.series', value: 'series' },
    { key: 'list_types.movies_and_series', value: 'movies_and_series' },
    { key: 'list_types.books', value: 'books' }
];
export type ListTypeValue = typeof LIST_TYPES[number]['value'];

const SaveListModal = ({ mode, data, isOpen, onClose, onSubmit }: { mode: 'create' | 'edit', data?: { name: string, type: ListTypeValue }, isOpen: boolean, onClose: () => void, onSubmit: (data: { name: string, type: ListTypeValue }) => void }) => {
    const [saveListType, setSaveListType] = useState<typeof LIST_TYPES[number]>(data?.type ? LIST_TYPES.find((item) => item.value === data.type) || LIST_TYPES[0] : LIST_TYPES[0]);
    const [saveListName, setSaveListName] = useState(data?.name || '');
    const [showListTypeModal, setShowListTypeModal] = useState(false);

    useEffect(() => {
        setSaveListType(LIST_TYPES.find((item) => item.value === data?.type) || LIST_TYPES[0]);
        setSaveListName(data?.name || '');
    }, [data, isOpen]);

    const handleSaveList = () => {
        if (!saveListName || !saveListType.value) return;

        onClose();
        onSubmit({ name: saveListName, type: saveListType.value });
    };

    return (
        <>
            <BottomSheet
                isOpen={isOpen}
                onClose={onClose}
            >
                <Text
                    text={mode === 'create' ? 'lists.save_list.create_title' : 'lists.save_list.edit_title'}
                    className='text-2xl font-bold text-base-content border-b border-base-content pb-2 mb-1'
                />

                <View className='justify-between gap-6'>
                    <View className='flex flex-col gap-y-4'>
                        <Input
                            label='lists.save_list.name'
                            value={saveListName}
                            onChangeText={setSaveListName}
                        // onSubmitEditing={handleSaveList}
                        />
                        <Dropdown
                            label='lists.save_list.type'
                            onPress={() => setShowListTypeModal(true)}
                            text={saveListType.key}
                            disabled={mode === 'edit'}
                        />
                    </View>
                    <View className='items-end'>
                        <Button
                            name={mode === 'create' ? 'create' : 'save'}
                            disabled={!saveListName || !saveListType.value}
                            onPress={handleSaveList}
                        />
                    </View>
                </View>
            </BottomSheet>

            {/* List type */}
            {mode === 'create' && (
                <DropDownModal
                    text='list.fixed.select_list_type'
                    isOpen={showListTypeModal}
                    onClose={() => setShowListTypeModal(false)}
                    options={LIST_TYPES}
                    value={saveListType.value}
                    onPress={(value) => {
                        setSaveListType(value);
                        setShowListTypeModal(false);
                    }}
                />
            )}
        </>
    );
}

export default SaveListModal;
