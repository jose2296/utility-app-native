import { TouchableOpacity, View } from 'react-native';
import BottomSheet from '../BottomSheet';
import Text from '../Text';

export interface BottomSheetOption {
    value: string;
    key: string;
    icon?: React.ReactNode;
}

interface BottomSheetOptionsProps {
    isOpen: boolean;
    options: BottomSheetOption[];
    title?: string;
    sheetHeight?: number;
    onClose: () => void;
    handleItemOptionSelected: (value: string) => void;
}
const BottomSheetOptions = ({ isOpen, options, title, sheetHeight, onClose, handleItemOptionSelected }: BottomSheetOptionsProps) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            // sheetHeight={sheetHeight || (options.length * 75) + 100}
        >
            <View className='flex px-4'>
                <Text avoidTranslation text={title || ''} className='text-xl font-bold text-base-content' />

                <View className='flex gap-4 pt-4'>
                    {options?.map((_itemOption, index) => (
                        <TouchableOpacity
                            key={title + '-' + _itemOption.value + '-' + _itemOption.key}
                            className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                            onPress={() => handleItemOptionSelected(_itemOption.value)}
                        >
                            {!!_itemOption.icon && _itemOption.icon}
                            <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </BottomSheet>
    );
};

export default BottomSheetOptions;
