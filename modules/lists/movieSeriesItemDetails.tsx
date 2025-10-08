import { useLazyApi } from '@/hooks/use-api';
import { FixedItemList, ThemoviedbFixedItem, ThemoviedbFixedItemDetails } from '@/models/list';
import { ThemoviedbProvider } from '@/models/themovieddb';
import { IdOrValue, KeyValue } from '@/models/utils';
import { getItemDetails, getItemProviders, getItemToSaveByThemoviedbId } from '@/services/themoviedb';
import { useUserStore } from '@/store';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";
import BottomSheet from '../../components/BottomSheet';
import Carousel from '../../components/Carrousel';
import Loader from '../../components/loader';
import Bookmark from '../../components/svgs/Boockmark';
import Eye from '../../components/svgs/Eye';
import EyeOff from '../../components/svgs/EyeOff';
import Trash2 from '../../components/svgs/Trash2';
import Tv from '../../components/svgs/Tv';
import Youtube from '../../components/svgs/Youtube';
import Text from '../../components/Text';
import FixedItemProvidersModal from './fixedItemProvidersModal';
import MovieSeriesItem from './movieSerieItem';
import Rating from './rating';


const MovieSeriesItemDetails = ({ type, themoviedbId, itemId, listId, workspaceId }: { type: 'movies' | 'series', themoviedbId?: number, itemId?: number, listId: number, workspaceId: number }) => {
    const [item, setItem] = useState<FixedItemList<ThemoviedbFixedItem>>();
    const [data, setData] = useState<ThemoviedbFixedItemDetails>();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState<KeyValue[]>([]);
    const [showAllSynopsis, setShowAllSynopsis] = useState(false);
    const { request: getFixedListItem } = useLazyApi(`fixed-list-items/${itemId}`);
    const { request: getFixedListItemByThemoviedbId } = useLazyApi(`fixed-list-items/themoviedb/${type}/${themoviedbId}`);
    const { request: createFixedListItem } = useLazyApi(`fixed-list-items`, 'POST');
    const { request: saveFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'POST');
    const { request: deleteFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'DELETE');
    const [itemSelectedProviders, setItemSelectedProviders] = useState<ThemoviedbProvider[] | null>(null);
    const [showProvidersModal, setShowProvidersModal] = useState(false);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [showTrailerModal, setShowTrailerModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors } = useUserStore();
    const router = useRouter();
    const { colorScheme = 'light' } = useColorScheme();

    useEffect(() => {
        if (!showTrailerModal) {
            // player.pause();
        }
    }, [showTrailerModal]);

    useEffect(() => {
        const hideHeader = loading && !data;
        navigation.setOptions({ title: data?.title || '', headerShown: !hideHeader });
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, [data, loading]);

    useFocusEffect(
        useCallback(() => {
            setData(undefined);
            setItem(undefined);
            setLoading(true);

            if (itemId && !themoviedbId) {
                getItemData();
            }

            if (!itemId && themoviedbId) {
                getItemDataByThemoviedbId();
            }

        }, [itemId, themoviedbId])
    );

    useEffect(() => {
        const options: KeyValue[] = item
            ? [
                { key: item.data?.checked ? 'list.fixed.mark_as_not_seen' : 'list.fixed.mark_as_seen', value: 'toggle_seen' },
                { key: 'list.fixed.see_providers', value: 'see_providers' },
                { key: 'list.fixed.remove_from_list', value: 'remove_from_list' },
            ]
            : [
                { key: 'list.fixed.add_to_list', value: 'add_to_list' },
                { key: 'list.fixed.see_providers', value: 'see_providers' }
            ];

        setOptions(options);
    }, [item, data]);


    const getItemData = async () => {
        try {
            setLoading(true);
            const item = await getFixedListItem(`fixed-list-items/${itemId}`);
            const details = await getItemDetails(type, item.data.themoviedbId);

            setItem(item);
            setData(details);
            setLoading(false);
        } catch (error) {
            // router.replace(`/app/lists/${listId}`);
            setLoading(false);
        }
    }

    const getItemDataByThemoviedbId = async () => {
        try {
            setLoading(true);
            const details = await getItemDetails(type, themoviedbId!);
            setData(details);

            try {
                const item = await getFixedListItemByThemoviedbId(`fixed-list-items/themoviedb/${type}/${themoviedbId}`);
                setItem(item);
                setLoading(false);
            } catch (error) {
                console.warn(error);
                setLoading(false);
            }
        } catch (error) {
            console.warn(error);
            setLoading(false);
            if ((error as any).status === 404) {
                // router.replace(`/app/lists/${listId}`);
            }
        }
    }

    const handleOptionSelected = async (option: KeyValue['value']) => {
        switch (option) {
            case 'toggle_seen': {
                const _data = {
                    ...item?.data,
                    checked: !item?.data?.checked
                }
                const updatedItemPromise = saveFixedListItem(`fixed-list-items/${item?.id}`, { ...item, data: _data, user: undefined, list: undefined });
                // notify.promise(
                //     updatedItemPromise,
                //     { isMarkup: true, key: 'list.fixed.marking_item_as_' + (data.checked ? 'seen' : 'not_seen'), data: { title: item.data.title } },
                //     { isMarkup: true, key: 'list.fixed.item_marked_as_' + (data.checked ? 'seen' : 'not_seen'), data: { title: item.data.title } }
                // );
                const updatedItem = await updatedItemPromise;
                setItem(updatedItem);
                // setItemSelected(null);
                return updatedItem;
            }
            case 'see_providers': {
                setShowProvidersModal(true);
                setIsLoadingProviders(true);
                const providers = await getItemProviders(type, themoviedbId || item?.data.themoviedbId!);
                setItemSelectedProviders(providers);
                setIsLoadingProviders(false);
                break;
            }
            case 'remove_from_list': {
                const deleteFixedListItemPromise = deleteFixedListItem(`fixed-list-items/${item?.id}`);
                // notify.promise(
                //     deleteFixedListItemPromise,
                //     { isMarkup: true, key: 'list.fixed.removing_item_from_list', data: { title: item.data.title } },
                //     { isMarkup: true, key: 'list.fixed.item_removed_from_list', data: { title: item.data.title } }
                // );
                const deletedItem = await deleteFixedListItemPromise;
                setItem(undefined);
                // setItemSelected(null);
                return deletedItem;
            }
            case 'add_to_list': {
                if (!item?.id) {
                    const data = await getItemToSaveByThemoviedbId(type, themoviedbId!);
                    const newItemPromise = createFixedListItem(`fixed-list-items`, { list_id: listId, data, order: 0 });

                    // notify.promise(
                    //     newItemPromise,
                    //     { isMarkup: true, key: 'list.fixed.adding_item_to_list', data: { title: item.data.title } },
                    //     { isMarkup: true, key: 'list.fixed.item_added_to_list', data: { title: item.data.title } }
                    // );


                    const newItem = await newItemPromise;
                    setItem(newItem);

                    // setItemSelected(null);
                    return newItem;
                } else {
                    console.warn('This items is already in the list.');
                    return null;
                }
            }
            case 'see_trailer':
                setShowTrailerModal(true);
                break;
        }
    }

    if (loading && !data) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                ref={scrollRef}
                className='py-6 px-4 flex flex-1'
                contentContainerClassName='gap-6'
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                scrollEventThrottle={16}
            >

                <View className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <View
                        className={`flex flex-row gap-8 bg-cover bg-center bg-no-repeat items-center sm:items-start justify-center`}
                    >
                        <View className='rounded-box md:max-w-[275px] sm:max-w-[200px] max-w-[250px] w-fit'>
                            {/* <Image
                                onLoad={() => console.log('loaded')}
                                className='aspect-auto rounded-box'
                                src={{ uri: data?.image, }}
                                alt={data?.title}
                            /> */}
                            <Image
                                style={{ width: '100%', aspectRatio: '1/1.5', borderRadius: 16 }}
                                className='aspect-auto rounded-box'
                                source={{ uri: data?.image }}
                                contentPosition='top'
                                // placeholder={{ blurhash }}
                                contentFit='fill'
                                transition={400}
                            />
                        </View>

                        <View className="flex flex-col gap-4 items-center">
                            <View className="flex flex-col gap-4">
                                {!!data?.videos.length &&
                                    <FixedItemDetailsButtonAction
                                        value='see_trailer'
                                        onPress={() => handleOptionSelected('see_trailer')}
                                    />
                                }
                                {options.map(option => (
                                    <FixedItemDetailsButtonAction
                                        key={option.key}
                                        value={option.value}
                                        onPress={() => handleOptionSelected(option.value)}
                                        checked={item?.data?.checked || false}
                                    />
                                ))}
                            </View>
                            {!!data?.score && <Rating score={data?.score} />}
                        </View>
                    </View>
                </View>

                <View className="flex flex-col gap-2">
                    {data?.tagline && <Text avoidTranslation text={data?.tagline} className='text-2xl text-base-content font-bold text-center italic' />}
                    {/* <ExpandableText text={data?.synopsis} lines={8} /> */}
                    <TouchableOpacity onPress={() => setShowAllSynopsis(!showAllSynopsis)}>
                        <Text numberOfLines={showAllSynopsis ? undefined : 8} avoidTranslation text={data?.synopsis || ''} className='text-base-content text-2xl' />
                    </TouchableOpacity>
                    <View className='flex flex-row gap-x-6 items-center flex-wrap'>
                        <Text avoidTranslation text={data?.released || ''} className='text-xl text-base-content font-bold' />
                        <Text text={type === 'series' ? 'lists.types.serie' : 'lists.types.movie'} className={`text-xl text-base-content rounded-full px-4 py-2 font-bold ${type === 'series' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`} />
                        <Text avoidTranslation text={data?.status || ''} className='text-xl text-base-content font-bold bg-neutral rounded-full px-4 py-2' />
                        {!!data?.time && <Text avoidTranslation text={data?.time || ''} className='text-xl text-base-content font-bold' />}
                    </View>
                    {data?.nextEpisodeToAir && <Text avoidTranslation text={`Next episode: ${data?.nextEpisodeToAir}`} className='text-xl text-base-content font-bold' />}
                    <Text avoidTranslation text={data?.genres || ''} className='text-xl text-base-content font-bold' />
                </View>

                {!!data?.collection && (
                    <View className='rounded-xl overflow-hidden'>
                        <ImageBackground
                            className='relative min-h-20 p-6 flex sm:gap-10 gap-6 items-center sm:items-start sm:text-left flex-col-reverse sm:flex-row'
                            source={{ uri: data?.collection.backdrop_path }}
                            imageStyle={{
                                borderRadius: 16
                            }}
                        >
                            <LinearGradient
                                // Background Linear Gradient
                                colors={[`rgba(${colorScheme === 'dark' ? '0, 0, 0' : '255, 255, 255'}, 0.75)`, `rgba(${colorScheme === 'dark' ? '0, 0, 0' : '255, 255, 255'}, 0.5)`]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{

                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: '100%',
                                    borderRadius: 16
                                }}
                            >
                            </LinearGradient>
                            <View
                                className='rounded-xl p-6 sm:gap-10 gap-6 sm:items-start items-center sm:text-left flex-col-reverse sm:flex-row'
                            >
                                {!showCollectionModal &&
                                    <Image
                                        className='rounded-xl w-full aspect-auto z-10'
                                        style={{ aspectRatio: '1/1.5', maxWidth: 250, minWidth: 250, borderRadius: 16 }}
                                        source={{ uri: data?.collection.poster_path }}
                                        contentPosition='top'
                                        contentFit='fill'
                                        transition={400}
                                    />
                                }
                                {showCollectionModal &&
                                    <View style={{ width: '100%', minWidth: 250 }}>
                                        <Carousel
                                            data={data?.collection?.movies}
                                            keyExtractor={(item) => `collection-${item.themoviedbId}`}
                                            renderItem={(item) => (
                                                <MovieSeriesItem
                                                    {...item}
                                                    showDropdown={false}
                                                    onPress={() => router.push(`/(app)/${workspaceId}/lists/moviesSeries/${listId}/${type}/unlisted/${item.themoviedbId}`)}
                                                />
                                            )}
                                        />
                                    </View>
                                }
                                <View className='flex gap-4 items-center sm:items-start flex-1'>
                                    <Text
                                        text='list.fixed.collection_title'
                                        translateData={{ collectionName: data?.collection.name }}
                                        className='text-2xl text-base-content text-center'
                                    />
                                    <Text
                                        numberOfLines={8}
                                        // onTextLayout={(e) => console.log({ lines: e.nativeEvent.lines, length: e.nativeEvent.lines.length })}
                                        avoidTranslation
                                        text={data?.collection.overview}
                                        className='text-base-content text-xl text-center'
                                    />
                                    {/* <p className='text-lg'>{data?.collection.movies.map(movie => movie.title).join(', ')}</p> */}
                                    <TouchableOpacity className='bg-neutral px-6 py-3 rounded-2xl' onPress={() => setShowCollectionModal(!showCollectionModal)} activeOpacity={0.8}>
                                        <Text text={!showCollectionModal ? 'list.fixed.see_collection' : 'close'} className='text-base-content text-2xl' />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                )}

                {!!data?.recommendations.length &&
                    <View className='gap-4'>
                        <Text text='list.fixed.recommendations' className='text-3xl font-bold text-base-content' />
                        <Carousel
                            data={data?.recommendations}
                            itemWidthOffset={0.9}
                            keyExtractor={(item) => item.themoviedbId}
                            renderItem={(item) => (
                                // TODO: Guardar los ids de todas las películas y series para saber si estan en la lista y si estan vistas o no. Aqui y en la colleccion y el la busqueda de items
                                <MovieSeriesItem
                                    {...item}
                                    showDropdown={false}
                                    onPress={() => router.push(`/(app)/${workspaceId}/lists/moviesSeries/${listId}/${type}/unlisted/${item.themoviedbId}`)}
                                />
                            )}
                        />
                    </View>
                }

            </ScrollView>

            {!!data?.videos.length &&
                <BottomSheet
                    isOpen={showTrailerModal}
                    onClose={() => setShowTrailerModal(false)}
                >
                    <Text text='list.fixed.trailer' numberOfLines={1} translateData={{ title: data?.title! }} className='text-2xl text-base-content' />

                    <View className='items-center justify-center py-6 aspect-video'>
                        <WebView
                            style={{ maxWidth: '100%', width: '100%', aspectRatio: 16 / 9 }}
                            allowsFullscreenVideo
                            source={{ uri: data.videos[0].src }}
                        />
                    </View>

                </BottomSheet>
            }

            {/* Collection modal */}
            {!!data?.collection &&
                <BottomSheet
                    isOpen={false}
                    onClose={() => setShowCollectionModal(false)}
                >
                    <Text text='list.fixed.collection' numberOfLines={1} translateData={{ title: data?.title! }} className='text-2xl text-base-content' />
                    <ScrollView contentContainerClassName='w-full'>
                        <Carousel
                            data={data?.collection?.movies || []}
                            keyExtractor={(item) => `collection-${item.themoviedbId}`}
                            renderItem={(item) => (
                                // TODO: Guardar los ids de todas las películas y series para saber si estan en la lista y si estan vistas o no. Aqui y en la colleccion y el la busqueda de items
                                <MovieSeriesItem
                                    {...item}
                                    showDropdown={false}
                                    onPress={() => {
                                        router.push(`/(app)/${workspaceId}/lists/moviesSeries/${listId}/${type}/unlisted/${item.themoviedbId}`);
                                        setShowCollectionModal(false);
                                    }}
                                />
                            )}
                        />
                    </ScrollView>
                </BottomSheet>
            }

            {/* Item Providers */}
            <FixedItemProvidersModal
                itemSelectedProviders={itemSelectedProviders}
                isLoading={isLoadingProviders}
                isOpen={showProvidersModal}
                onClose={() => { setShowProvidersModal(false); setItemSelectedProviders(null); }}
            />
        </>
    );
}

export default MovieSeriesItemDetails;


const FixedItemDetailsButtonAction = ({ value, onPress, checked }: { value: IdOrValue, onPress: () => void, checked?: boolean }) => {
    const [isPressed, setIsPressed] = useState(true);

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={20}
            // onPressIn={() => setIsPressed(true)}
            // onPressOut={() => setIsPressed(false)}
            className='bg-neutral rounded-full p-4 btn-neutral group hover:scale-115 transition-all'
            onPress={onPress}
        >
            {(value === 'toggle_seen' || value === 'toggle_read') &&
                <>
                    {checked
                        ? <Eye className={`${isPressed ? 'stroke-primary' : 'stroke-neutral-content'}`} />
                        : <EyeOff className={`${isPressed ? 'stroke-secondary' : 'stroke-neutral-content'}`} />}
                </>
            }
            {value === 'add_to_list' &&
                <Bookmark className={`${isPressed ? 'stroke-info' : 'stroke-neutral-content'}`} />
            }
            {value === 'remove_from_list' &&
                <Trash2 className={`${isPressed ? 'stroke-error' : 'stroke-neutral-content'}`} />
            }
            {value === 'see_providers' &&
                <Tv className={`${isPressed ? 'stroke-accent' : 'stroke-neutral-content'}`} />
            }
            {value === 'see_trailer' &&
                <Youtube className={`${isPressed ? 'stroke-neutral-content' : 'stroke-neutral-content'}`} />
            }
        </TouchableOpacity>
    );
};
