import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import { Input } from '@/components/input';
import Text from '@/components/Text';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const SaveNoteModal = ({ mode, name, isOpen, onClose, onSubmit }: { mode: 'create' | 'edit', name: string, isOpen: boolean, onClose: () => void, onSubmit: (name: string) => void }) => {
    const [noteName, setNoteName] = useState(name || '');

    useEffect(() => {
        setNoteName(name);
    }, [name, isOpen]);

    const handleSaveNote = () => {
        if (!noteName) return;

        onClose();
        onSubmit(noteName);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >

            <Text
                text={mode === 'create' ? 'notes.save_modal.create_title' : 'notes.save_modal.edit_title'}
                className='text-2xl font-bold text-base-content border-b border-base-content pb-2 mb-1'
            />

            <View className='justify-between gap-6'>
                <Input
                    label={mode === 'create' ? 'notes.save_modal.create_title' : 'notes.save_modal.edit_title'}
                    value={noteName}
                    onChangeText={setNoteName}
                />
                <View className='items-end'>
                    <Button
                        name={mode === 'create' ? 'create' : 'save'}
                        disabled={!noteName}
                        onPress={handleSaveNote}
                    />
                </View>
            </View>

        </BottomSheet>
    );
}

export default SaveNoteModal;
