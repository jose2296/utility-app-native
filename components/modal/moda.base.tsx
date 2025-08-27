
// components/modals/BaseModal.tsx
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import X from '../svgs/X';
import { ModalSize } from './modal.model';

interface BaseModalProps {
    children: ReactNode;
    title?: string;
    onClose: () => void;
    showCloseButton?: boolean;
    size?: ModalSize;
}

export const BaseModal: React.FC<BaseModalProps> = ({
    children,
    title,
    onClose,
    showCloseButton = true,
    size = 'medium'
}) => {
    const getSizeClasses = (): string => {
        switch (size) {
            case 'small':
                return 'w-80 max-h-60';
            case 'medium':
                return 'w-96 max-h-96';
            case 'large':
                return 'w-full mx-4 max-h-[80%]';
            case 'fullscreen':
                return 'w-full h-full m-0';
            default:
                return 'w-96 max-h-96';
        }
    };

    return (
        <Animated.View
            className="bg-neutral rounded-xl p-2 gap-4 z-50 max-w-[90%] w-full"
            entering={FadeIn}
            exiting={FadeOut}
        >
            {/* Header */}
            {(title || showCloseButton) && (
                <View className="flex-row justify-between items-center p-2 py-4 border-b border-base-content">
                    <Text className="text-lg font-semibold text-base-content flex-1">
                        {title || ''}
                    </Text>
                    {showCloseButton && (
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={10}
                            className=""
                        >
                            <X size={24} className='text-base-content' />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Content */}
            <View className="p-2">
                {children}
            </View>
        </Animated.View>
    );
};
