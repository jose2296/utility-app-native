import { KeyValue } from '@/models/utils';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../BottomSheet';
import Text from '../Text';

export const DropDownModal = <T extends KeyValue,>({ options, isOpen, value, onPress, onClose }: { options: T[], isOpen: boolean, value: string, onPress: (option: T) => void, onClose: () => void }) => {
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <ScrollView className='flex-1' contentContainerClassName='flex px-4'>
                <Text text='list.fixed.select_list_type' className='text-xl font-bold text-base-content' />

                <View className='flex gap-4 pt-4'>
                    {options.length && options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`px-6 py-4 rounded-xl border-2  ${value === option.value ? 'border-primary/80' : 'border-base-content/20'}`}
                            onPress={() => {
                                onPress(option);
                                onClose();
                            }}
                        >
                            <Text text={option.key} className={`text-2xl text-base-content`} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </BottomSheet>
    );
}

export default DropDownModal;
