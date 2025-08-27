import dayjs from 'dayjs';
import { Image } from 'expo-image';
import React from 'react';
import { ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import Text from '../../components/Text';
import Eye from '../../components/svgs/Eye';
import EyeOff from '../../components/svgs/EyeOff';

type ItemProps = {
    itemId?: number;
    title: string;
    image: string;
    type?: 'movies' | 'series';
    released: string;
    checked: boolean;
    user?: {
        id: number;
        email: string;
        name: string;
        created_at: string;
        updated_at: string;
    };
    isCollaborating?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
}
const MovieSeriesItem = ({ itemId, title, image, type, released, user, isCollaborating, checked, onPress, onLongPress }: ItemProps) => {
    return (
        <View className='flex flex-1 flex-col gap-4 w-full'>
            <View className='flex flex-row gap-x-4 items-center justify-between w-full pb-1'>
                {isCollaborating &&
                    <View className='size-8 max-w-8 max-h-8 min-w-8 min-h-8'>
                        {user && <View className='flex rounded-xl bg-info w-full h-full'>
                            <Text avoidTranslation text={user?.name.at(0) || ''} className='text-info-content text-xl font-bold' />
                        </View>}
                    </View>
                }
                <View className="flex-1 truncate">
                    {/* <Tooltip label={title} avoidTranslation className='justify-center'> */}
                    <Text avoidTranslation numberOfLines={1} text={title} className='text-2xl text-base-content font-bold' />
                    {/* </Tooltip> */}
                </View>

            </View>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                onLongPress={onLongPress}
                className='rounded-xl relative overflow-hidden '>

                {image ? <ItemImage source={{ uri: image }}/> : <PlaceholderImage /> }
                {itemId &&
                    <View className={`absolute w-32 h-32 -top-16 -right-16 ${checked ? 'bg-primary' : 'bg-secondary'} transform rotate-45 z-10 pb-3 items-center justify-end`}>
                        {checked ? (
                            <Eye size={24} className='text-primary-content -rotate-45' />
                        ) : (
                            <EyeOff size={24} className='text-secondary-content -rotate-45' />
                        )}
                    </View>
                }
            </TouchableOpacity>

            <View className='flex flex-row px-2 gap-x-4 items-center justify-between w-full'>
                <Text avoidTranslation text={dayjs(released).format('DD/MM/YYYY')} className='text-xl text-base-content font-bold border border-base-content/40 px-4 py-2 rounded-full' />
                {type && <Text
                    text={type === 'series' ? 'lists.types.serie' : 'lists.types.movie'}
                    className={`text-2xl text-base-content font-bold rounded-full px-6 py-2 ${type === 'series' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`}
                />}
            </View>
        </View>
    );
}

export default MovieSeriesItem;


const ItemImage = ({ source }: { source: ImageSourcePropType }) => {
    return (

        <Image
            style={{ width: '100%', aspectRatio: '1/1.5', borderRadius: 16 }}

            source={source}
            contentPosition='top'
            // placeholder={{ blurhash }}
            contentFit='fill'
            transition={400}
        />
    );
}

const PlaceholderImage = () => {
    // const placeholderImage = useImage('/assets/images/movie-serie-item-placeholder.png');
    const placeholderImage = require('@/assets/images/lists/a.webp');

    return (
        <Image
            style={{ width: '100%', aspectRatio: '1/1.5', borderRadius: 16 }}
            className='bg-red-50 '
            source={placeholderImage}
            contentPosition='top'
            // placeholder={{ blurhash }}
            contentFit='fill'
            transition={400}
        />
    );
}
