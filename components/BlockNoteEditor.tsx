import BlockNoteEditorDomComponent from '@/components/BlockNoteEditorDomComponent';
import useDebouncedText from '@/hooks/use-debounce-text';
import { useUserStore } from '@/store';
import { Block } from '@blocknote/core';
import { Platform, View } from 'react-native';

interface BlockNoteEditorProps {
    onChange?: (text: string) => void;
    initialValue?: Block<any, any, any>[];
}
const BlockNoteEditor = ({ onChange, initialValue }: BlockNoteEditorProps) => {
    const { colors } = useUserStore();

    const { setText: setDebouncedText } = useDebouncedText(JSON.stringify(initialValue), (text) => onChange?.(text), 2000);

    return (
        <View className='flex-1 w-full h-full'>
            <BlockNoteEditorDomComponent
                colors={colors}
                platform={Platform.OS}
                initialContent={initialValue}
                onChange={setDebouncedText}
                dom={{
                    containerStyle: {
                        flex: 1,
                    },
                    style: {
                        flex: 1,
                    }
                }}
            />
        </View>
    );
};

export default BlockNoteEditor;
