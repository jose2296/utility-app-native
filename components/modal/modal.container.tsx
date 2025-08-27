
// components/ModalContainer.tsx
import { FC } from 'react';
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import BottomSheet from '../BottomSheet';
import { useModal } from './modal.context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ModalContainer: FC = () => {
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    return (
        <>
            {modals.map(modal => (
                modal.type === 'modal' ? (
                    <View
                        key={modal.id}
                        className='absolute left-0 right-0 bottom-0 top-0 w-full h-full flex flex-1 items-center justify-center'
                    >
                        {/* Backdrop */}
                        <Animated.View
                            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
                            entering={FadeIn}
                            exiting={FadeOut}
                        >
                            <Pressable onPress={() => closeModal(modal.id)} className="flex-1" />
                        </Animated.View>

                        {/* Sheet */}

                        {modal.component({
                            onClose: () => closeModal(modal.id),
                            modalId: modal.id,
                            ...modal.props
                        })}
                        {/* <View className='flex flex-row gap-6 items-center justify-between'>
                                <Text text={modal.props.title} className='text-base-content text-2xl font-bold' />
                                <TouchableOpacity onPress={() => closeModal(modal.id)}>
                                    <X size={24} className='text-base-content' />
                                </TouchableOpacity>
                            </View>
                            <View className='h-0.5 bg-base-content/50 my-2' />
                            <View>
                                <Text text={modal.props.message} avoidTranslation={modal.props.avoidTranslation} translateData={modal.props.translateData} className='text-base-content text-xl text-center px-4 text' />
                            </View>
                            <View className='flex flex-row justify-end w-fit gap-2 mt-4'>
                                <Button name="delete" onPress={modal.props.onSubmit} isLoading={modal.props.isLoading} />
                            </View> */}

                    </View>
                )
                    : modal.type === 'bottomSheet' ? (
                        <Animated.View
                            className="absolute top-0 left-0 right-0 bottom-0"
                            entering={FadeIn}
                            exiting={FadeOut}
                            key={modal.id}
                        >
                            <BottomSheet
                                isOpen={true}
                                sheetHeight={modal.props.sheetHeight}
                                onClose={() => closeModal(modal.id)}
                            >
                                {modal.component({
                                    onClose: () => closeModal(modal.id),
                                    modalId: modal.id,
                                    ...modal.props
                                })}
                            </BottomSheet>
                        </Animated.View>
                    )
                        : null
            ))}
        </>
    )

    return (
        <>
            {modals.map((modal) => (
                <Modal
                    key={modal.id}
                    visible
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => closeModal(modal.id)}
                >
                    <View
                        className="flex-1 bg-black/50 z-30 justify-center items-center absolute left-0 top-0"
                        style={{
                            width: screenWidth,
                            height: screenHeight,
                        }}
                    >
                        {/* Backdrop - cerrar al tocar fuera */}
                        <TouchableOpacity
                            className="absolute inset-0 z-40 bg-red-50"
                            activeOpacity={1}
                            onPress={() => closeModal(modal.id)}
                        />

                        {/* Contenido del modal */}
                        <View className="absolute z-50" pointerEvents='box-none'>
                            <modal.component
                                {...modal.props}
                                onClose={() => closeModal(modal.id)}
                                modalId={modal.id}
                            />
                        </View>
                    </View>
                </Modal>
            ))}
        </>
    );
};
