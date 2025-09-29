import { cn, getAnalogous } from '@/services/utils';
import { useUserStore } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Loader from './loader';
import Text from './Text';
import { ThemeColors } from './ThemeProvider';

interface ButtonProps {
    name: string;
    onPress: () => void;
    disabled?: boolean;
    type?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'link' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    isLoading?: boolean;
}
const Button = ({ name, onPress, disabled, type = 'primary', size = 'md', isLoading }: ButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled || isLoading}
            className={cn(
                'disabled:opacity-50 flex relative overflow-hidden flex-row items-center justify-center gap-6 px-10 py-3 rounded-md'
            )}
            onPress={onPress}
        >
            <CustomLineGradient type={type} />
            <Text
                text={name}
                className={cn(
                    'text-lg font-bold',
                    {
                        'text-sm': size === 'sm',
                        'text-md': size === 'md',
                        'text-lg': size === 'lg',
                        'text-xl': size === 'xl',
                        'text-2xl': size === '2xl',
                    },
                    {
                        'text-primary-content': type === 'primary',
                        'text-secondary-content': type === 'secondary',
                        'text-error-content': type === 'error',
                        'text-info-content': type === 'info',
                        'text-success-content': type === 'success',
                        'text-secondary': type === 'link',
                    }
                )}
            />
            {isLoading && <Loader className='fill-primary-content' size={25} />}
        </TouchableOpacity>
    );
}

export default Button;

const CustomLineGradient = ({ type }: { type: ButtonProps['type'] }) => {
    const storeColors = useUserStore(state => state.colors);

    if (type === 'primary' || type === 'secondary' || type === 'error' || type === 'info' || type === 'success') {
        const key = type + '-hex' as ThemeColors;
        const color = storeColors![key];

        return (
            <LinearGradient
                colors={[...getAnalogous(color)] as any}
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
        );
    }

    return <></>
}
