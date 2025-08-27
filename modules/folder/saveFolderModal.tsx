import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import { Input } from '@/components/input';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const SaveFolderModal = ({ mode, name, isOpen, onClose, onSubmit }: { mode: 'create' | 'edit', name: string, isOpen: boolean, onClose: () => void, onSubmit: (name: string) => void }) => {
    const [folderName, setFolderName] = useState(name || '');

    useEffect(() => {
        setFolderName(name);
    }, [name, isOpen]);

    const handleSaveFolder = () => {
        if (!folderName) return;

        onClose();
        onSubmit(folderName);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            sheetHeight={220}
        >
            <View className='flex-1 justify-between'>
                <Input
                    label={mode === 'create' ? 'folders.save_modal.create_title' : 'folders.save_modal.edit_title'}
                    value={folderName}
                    onChangeText={setFolderName}
                />
                <View className='items-end'>
                    <Button
                        name={mode === 'create' ? 'create' : 'save'}
                        disabled={!folderName}
                        onPress={handleSaveFolder}
                    />
                </View>
            </View>

        </BottomSheet>
    );
}

export default SaveFolderModal;
