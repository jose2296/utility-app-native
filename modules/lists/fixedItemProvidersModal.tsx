import { ThemoviedbProvider } from '@/models/themovieddb';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from '../../components/BottomSheet';
import Image from '../../components/Image';
import Text from '../../components/Text';
import Loader from '../../components/loader';

const FixedItemProvidersModal = ({ itemSelectedProviders, isLoading, isOpen, onClose }: { itemSelectedProviders: ThemoviedbProvider[] | null, isLoading: boolean, isOpen: boolean, onClose: () => void }) => {
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <View className='flex flex-1 px-4'>
                <Text text='list.fixed.providers' className='text-xl font-bold text-base-content' />

                {isLoading &&
                    <View className='flex-1 items-center justify-center'>
                        <Loader />
                    </View>
                }
                {!isLoading &&
                    <ScrollView className='flex-1' contentContainerClassName='gap-x-8 gap-y-8 pt-4 items-stretch justify-center flex-wrap flex-row'>
                        {itemSelectedProviders?.map(provider => (
                            <View key={provider.name} className='flex flex-col w-[100px]'>
                                <Image
                                    className='rounded-lg size-[100px] min-w-[100px] min-h-[100px]'
                                    source={{ uri: provider.logo }}
                                    transition={400}
                                />
                                <Text text={provider.name} avoidTranslation className='text-center text-xl pt-2 truncate w-full text-base-content' />
                            </View>
                        ))}

                        {!itemSelectedProviders?.length &&
                            <View className='flex-1 items-center justify-center'>
                                <Text text='list.fixed.no_providers' className='pb-2 text-2xl text-base-content' />
                            </View>
                        }
                    </ScrollView>
                }
            </View>
        </BottomSheet>
    );
}

export default FixedItemProvidersModal;
