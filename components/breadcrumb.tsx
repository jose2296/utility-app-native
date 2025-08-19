import { Breadcrumb as BreadcrumbType } from '@/models/utils';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

const Breadcrumb = ({ breadcrumb }: { breadcrumb: BreadcrumbType[] }) => {
    const router = useRouter();

    return (
        <View className='flex flex-row items-center py-2 gap-2'>
            {breadcrumb.map((item, index) => (
                <View key={`breadcrumb-item-${item.id || index}-${item.name}`}>
                    {index !== breadcrumb.length - 1 ? (
                        <View className='flex flex-row items-center gap-2'>
                            <Pressable
                                onPress={() => router.replace(item.href)}
                                className='transition-all text-base-content flex flex-row items-center gap-1'
                            >
                                {item.color && <View className='size-4 rounded-full' style={{ backgroundColor: item.color }} />}
                                <Text className='text-base-content/50'>{item.avoidTranslation ? item.name : item.name}</Text>
                            </Pressable>
                            <Text className='text-base-content/50'> / </Text>
                        </View>
                    ) : (
                        <Text className='text-base-content/80'>{item.avoidTranslation ? item.name : item.name}</Text>
                    )}
                </View>
            ))}
        </View>
    );
}

export default Breadcrumb;
