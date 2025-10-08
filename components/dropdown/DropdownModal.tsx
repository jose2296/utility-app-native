import { IdOrValue, KeyValue } from '@/models/utils';
import { getAnalogous } from '@/services/utils';
import { useUserStore } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../BottomSheet';
import Text from '../Text';

interface DropDownModalProps<T extends KeyValue> {
    text: string;
    options: T[];
    isOpen: boolean;
    value: IdOrValue;
    onPress: (option: T) => void;
    onClose: () => void;
    avoidTranslation?: boolean;
}

export const DropDownModal = <T extends KeyValue,>({ text, avoidTranslation, options, isOpen, value, onPress, onClose }: DropDownModalProps<T>) => {
    const storeColors = useUserStore(state => state.colors);
    const colors = [...getAnalogous(storeColors!['primary-hex']!)] as any;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <ScrollView contentContainerClassName='flex px-4'>
                <Text text={text} className='text-xl font-bold text-base-content' avoidTranslation={avoidTranslation} />

                <View className='flex gap-4 pt-4'>
                    {options.length && options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`px-6 py-4 rounded-xl overflow-hidden border-2 'border-base-content/20`}
                            onPress={() => {
                                onPress(option);
                                onClose();
                            }}
                        >
                            {value === option.value &&
                                <LinearGradient
                                    colors={colors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0
                                    }}
                                />
                            }
                            <Text text={option.key} className={`text-2xl text-base-content`} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </BottomSheet>
    );
}

export default DropDownModal;
