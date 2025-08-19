import { ThemoviedbFixedItem } from '@/models/list';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../Text';
import Eye from '../svgs/Eye';
import EyeOff from '../svgs/EyeOff';

type ItemProps = ThemoviedbFixedItem & {
    itemId: number;
    user?: {
        id: number;
        email: string;
        name: string;
        created_at: string;
        updated_at: string;
    };
    isCollaborating?: boolean;
    // dropdownOptions: DropdownOption[];
    url: Href;
    onPress?: () => void;
    onLongPress?: () => void;

    // url={item.id ? `${location.href}/${item.data.type}/${item.id}` : `${location.href}/${item.data.type}/unlisted/${item.data.themoviedbId}`}


    // showDropdown?: boolean;
    // handleDropdownOptionSelected?: (option: DropdownOption) => void;
}
const MovieSeriesItem = ({ itemId, themoviedbId, title, image, type, released, user, isCollaborating, url, checked, onPress, onLongPress }: ItemProps) => {
    const router = useRouter();

    // return <View className='flex bg-red-900 p-4 w-full flex-1'>
    //     <Text text={title} className='text-base-content bg-red-500' />
    // </View>;

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

                {/* <div className="flex w-10 min-w-10">
                    {showDropdown &&
                        <Dropdown
                            options={dropdownOptions}
                            onSelect={handleDropdownOptionSelected}
                        />
                    }
                </div> */}
            </View>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                onLongPress={onLongPress}
                className='rounded-xl relative overflow-hidden '>
                {/* <TouchableOpacity onPress={() => router.push(url)} className='rounded-xl'> */}
                {/* <ViewTransition name={`${type}-${themoviedbId}`}> */}
                <Image
                    style={{ width: '100%', aspectRatio: '1/1.5', borderRadius: 16 }}

                    source={{ uri: image }}
                    contentPosition='top'
                    // placeholder={{ blurhash }}
                    contentFit='fill'
                    transition={400}
                />
                {/* <View className='absolute bottom-0 -left-4 w-1/3 h-6 bg-red-500 transform items-center justify-center rotate-45'>
                    <Text text={checked ? 'list.seen' : 'list.not_seen'} className='text-md text-base-content font-bold' />
                </View> */}
                {itemId &&
                    <View className={`absolute w-32 h-32 -top-16 -right-16 ${checked ? 'bg-primary' : 'bg-secondary'} transform rotate-45 z-10 pb-3 items-center justify-end`}>
                        {checked ? (
                            <Eye size={24} className='text-primary-content -rotate-45' />
                        ) : (
                            <EyeOff size={24} className='text-secondary-content -rotate-45' />
                        )}
                    </View>
                }
                {/* <Image
                    width={150}
                    height={200}
                    className='w-full h-full'
                    source={{ uri: image }}
                    alt={title}
                /> */}
                {/* </ViewTransition> */}
            </TouchableOpacity>

            <View className='flex flex-row px-2 gap-x-4 items-center justify-between w-full'>
                <Text avoidTranslation text={dayjs(released).format('DD/MM/YYYY')} className='text-xl text-base-content font-bold border border-base-content/40 px-4 py-2 rounded-full' />
                <Text
                    text={type === 'series' ? 'lists.types.serie' : 'lists.types.movie'}
                    className={`text-2xl text-base-content font-bold rounded-full px-6 py-2 ${type === 'series' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`}
                />
            </View>

            {/* <div className={`flex pt-3 gap-x-4 min-h-11 ${type ? 'justify-between' : 'justify-center'} w-full px-1`}>
                {released && <p className='badge h-8 px-4 badge-outline'>{dayjs(released).format('DD/MM/YYYY')}</p>}
                {!!type &&
                    <p className={`badge h-8 px-4 text-black ${type === 'series' ? 'bg-secondary' : 'bg-primary '}`}>{type === 'series' ? t('lists.types.serie') : t('lists.types.movie')}</p>
                }
            </div> */}
        </View>
    );
}

export default MovieSeriesItem;
