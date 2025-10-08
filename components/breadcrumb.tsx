import { GradientBall } from '@/app/(app)/_layout';
import { Breadcrumb as BreadcrumbType } from '@/models/utils';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import Text from './Text';

const Breadcrumb = ({ breadcrumb }: { breadcrumb: BreadcrumbType[] }) => {
    const router = useRouter();

    return (
        <View className='flex flex-row items-center px-4 gap-2'>
            {breadcrumb.map((item, index) => (
                <View key={`breadcrumb-item-${item.id}-${item.name}-${index}`}>
                    <View className='flex flex-row items-center gap-2'>
                        <TouchableOpacity
                            disabled={index === breadcrumb.length - 1}
                            onPress={() => router.replace(item.href)}
                            className='transition-all text-base-content flex flex-row items-center gap-2'
                        >
                            {item.color && <GradientBall color={item.color} className='size-4' />}
                            <Text
                                className='text-base-content/50'
                                avoidTranslation={!!item.avoidTranslation}
                                text={item.name}
                            />
                        </TouchableOpacity>
                        {index !== breadcrumb.length - 1 && <Text className='text-base-content/50' avoidTranslation text=' / '/>}
                    </View>
                </View>
            ))}
        </View>
    );
}

export default Breadcrumb;
