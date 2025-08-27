import { cn } from '@/services/utils';
import { TouchableOpacity } from 'react-native';
import Loader from './loader';
import Text from './Text';

interface ButtonProps {
    name: string;
    onPress: () => void;
    disabled?: boolean;
    type?: 'primary' | 'secondary' | 'error' | 'info' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    isLoading?: boolean;
}
const Button = ({ name, onPress, disabled, type = 'primary', size = 'md', isLoading }: ButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled || isLoading}
            className={cn(
                'disabled:opacity-50 flex flex-row items-center justify-center gap-6 px-10 py-3 border-2 border-black/20 rounded-md',
                {
                    'bg-primary text-primary-content': type === 'primary',
                    'bg-secondary text-secondary-content': type === 'secondary',
                    'bg-error text-error-content': type === 'error',
                    'bg-info text-info-content': type === 'info',
                    'bg-success text-success-content': type === 'success',
                }
            )}
            onPress={onPress}
        >
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
                    }
                )}
            />
            {isLoading && <Loader className='fill-primary-content' size={25}/>}
        </TouchableOpacity>
    );
}

export default Button;
