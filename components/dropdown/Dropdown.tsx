import { ChevronDown } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import Text from '../Text';

const Dropdown = ({ label, text, onPress, disabled }: { label: string, text: string, onPress: () => void, disabled?: boolean }) => {
    return (
        <View className='flex flex-col gap-y-1'>
            <Text
                text={label}
                className={`${disabled ? 'text-base-content/40' : 'text-base-content'} text-xl`}
            />
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`border ${disabled ? 'border-base-content/40' : 'border-base-content'} rounded-xl px-6 py-4 flex flex-row items-center gap-2`}
            >
                <Text
                    text={text}
                    className={`text-xl flex-1 ${disabled ? 'text-base-content/40' : 'text-base-content'}`}
                />
                <ChevronDown size={24} className={`${disabled ? 'text-base-content/40' : 'text-base-content'}`} />
            </TouchableOpacity>
        </View>
    );
}

export default Dropdown;
