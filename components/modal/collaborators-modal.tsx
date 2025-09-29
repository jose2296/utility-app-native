import { User } from '@/models/me';
import { View } from 'react-native';
import BottomSheet from '../BottomSheet';
import Text from '../Text';

const CollaboratorsModal = ({ isOpen, onClose, collaborators }: { isOpen: boolean; onClose: () => void; collaborators: User[] }) => {
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} sheetHeight={(collaborators.length * 75) + 100}>
            <View className='flex flex-1 px-4'>
                <Text text='list.collaborators' className='text-xl font-bold text-base-content' />

                <View className='flex gap-4 pt-4'>
                    {collaborators?.map((collaborator) => (
                        <View
                            key={collaborator.id}
                            className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                        >
                            <Text text={collaborator.name} className={`text-2xl text-base-content`} />
                        </View>
                    ))}
                </View>
            </View>
        </BottomSheet>
    );
};

export default CollaboratorsModal;
