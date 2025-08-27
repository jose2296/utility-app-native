
// components/modals/ConfirmModal.tsx

import { View } from 'react-native';
import Button from '../button';
import Text from '../Text';
import { BaseModal } from './moda.base';
import { ModalProps } from './modal.model';

interface ConfirmModalProps extends ModalProps {
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title = 'Confirmar',
    message,
    onConfirm,
    onCancel,
    onClose,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    const handleConfirm = (): void => {
        onConfirm?.();
        onClose();
    };

    const handleCancel = (): void => {
        onCancel?.();
        onClose();
    };

    return (
        <BaseModal title={title} onClose={onClose} >
            <View className="gap-y-4">
                <Text text={message} className="text-base-content text-xl" />

                <View className="flex-row gap-x-3 pt-4 justify-end">
                    <Button name={cancelText} onPress={handleCancel} type="error" />
                    <Button name={confirmText} onPress={handleConfirm} />
                </View>
            </View>
        </BaseModal>
    );
};
