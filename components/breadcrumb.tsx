import { Breadcrumb as BreadcrumbType } from '@/models/utils';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const Breadcrumb = ({ breadcrumb }: { breadcrumb: BreadcrumbType[] }) => {
    const router = useRouter();

    return (
        <View className='flex flex-row items-center px-4 gap-2'>
            {breadcrumb.map((item, index) => (
                <View key={`breadcrumb-item-${item.id || index}-${item.name}`}>
                    <View className='flex flex-row items-center gap-2'>
                        <TouchableOpacity
                            disabled={index === breadcrumb.length - 1}
                            onPress={() => router.replace(item.href)}
                            className='transition-all text-base-content flex flex-row items-center gap-2'
                        >
                            {item.color && <View className='size-4 rounded-full' style={{ backgroundColor: item.color }} />}
                            <Text className='text-base-content/50'>{item.avoidTranslation ? item.name : item.name}</Text>
                        </TouchableOpacity>
                        {index !== breadcrumb.length - 1 && <Text className='text-base-content/50'> / </Text>}
                    </View>
                </View>
            ))}
        </View>
    );
}

export default Breadcrumb;
