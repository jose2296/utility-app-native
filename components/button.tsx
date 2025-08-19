import { Pressable } from 'react-native';
import Loader from './loader';
import Text from './Text';

const Button = ({ name, onPress, disabled, isLoading }: { name: string, onPress: () => void, disabled?: boolean, isLoading?: boolean }) => {
    return (
        <Pressable
            android_ripple={{ color: '#00000022' }}
            disabled={disabled || isLoading}
            className='disabled:opacity-50 flex flex-row items-center justify-center gap-6 px-10 py-3 border-2 border-black/20 rounded-md bg-primary text-primary-content'
            onPress={onPress}
        >
            <Text text={name} className='text-2xl font-bold' />
            {isLoading && <Loader className='fill-primary-content' size={25}/>}
        </Pressable>
    );
}

export default Button;
