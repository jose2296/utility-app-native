// services/toastService.js
import Loader from '@/components/loader';
import { CircleAlert, ThumbsUp } from 'lucide-react-native';
import { View } from 'react-native';
import { toast as sonnerToast } from "sonner-native";
import Text from "../components/Text";
import { cn } from './utils';

type ToastProps = {
    title: string;
    avoidTranslation?: boolean;
    translateData?: Record<string, string>;
};

export const toast = {
    success: (props: ToastProps) => {
        return sonnerToast.custom(<CustomToast type='success' {...props} />);
    },
    error: (props: ToastProps) => {
        return sonnerToast.custom(<CustomToast type='error' {...props} />);
    },
    warning: (props: ToastProps) => {
        return sonnerToast.custom(<CustomToast type='warning' {...props} />);
    },
    loading: (props: ToastProps) => {
        return sonnerToast.custom(<CustomToast type='loading' {...props} />, { duration: Infinity });
    },
    promise: async <T,>(promise: Promise<T>, { loading, success, error }: { loading: ToastProps, success: ToastProps, error: ToastProps }) => {
        const id = sonnerToast.custom(<CustomToast {...loading} type="loading" />,
            { duration: Infinity }
        );

        return promise.then((result) => {
            sonnerToast.custom(<CustomToast {...success} type="success" />, { id });
            return result;
        })
        .catch((err) => {
            sonnerToast.custom(<CustomToast {...error} type="error" />, { id });
            throw new Error("Error");

        });
    }
};

const CustomToast = ({ type, title, avoidTranslation, translateData }: { type: 'success' | 'error' | 'warning' | 'loading', title: string, avoidTranslation?: boolean, translateData?: Record<string, string> }) => {
    return (
        <View
            className={cn(
                'p-4 flex flex-row w-full rounded-lg items-center gap-4',
                {
                    'bg-success': type === 'success',
                    'bg-error': type === 'error',
                    'bg-warning': type === 'warning',
                    'bg-info': type === 'loading',
                }
            )}>
            {type === 'loading' && <Loader size={40} className='text-info-content' />}
            {type === 'success' && <ThumbsUp size={40} className='text-success-content' />}
            {type === 'error' && <CircleAlert size={40} className='text-error-content ' />}

            <Text
                text={title}
                avoidTranslation={avoidTranslation}
                translateData={translateData}
                className={cn(
                    'text-xl flex-1',
                    {
                        'text-success-content': type === 'success',
                        'text-error-content': type === 'error',
                        'text-warning-content': type === 'warning',
                        'text-info-content': type === 'loading',
                    }
                )}
            />
        </View>
    );
};
