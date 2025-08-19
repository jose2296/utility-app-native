import { ChevronDown } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import Text from './Text';

const Dropdown = ({ label, text, onPress }: { label: string, text: string, onPress: () => void }) => {
    return (
        <>
            <Text
                text={label}
                className='text-base-content text-xl'
            />
            <TouchableOpacity
                onPress={onPress}
                className='border border-base-content rounded-xl px-6 py-4 flex flex-row items-center gap-2'
            >
                <Text
                    text={text}
                    className='text-base-content text-xl flex-1'
                />
                <ChevronDown size={24} className='text-base-content' />
            </TouchableOpacity>
        </>
    );
}

export default Dropdown;
