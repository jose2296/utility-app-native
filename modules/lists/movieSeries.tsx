import BottomSheetOptions from '@/components/modal/bottom-sheet-options';
import PageLayout from '@/components/PageLayout';
import { sortByFixedListOptions } from '@/constants/list';
import { useLazyApi } from '@/hooks/use-api';
import useDebouncedText from '@/hooks/use-debounce-text';
import { FixedItemList, ThemoviedbFixedItem } from '@/models/list';
import { ThemoviedbProvider } from '@/models/themovieddb';
import { IdOrValue, KeyValue } from '@/models/utils';
import { sortListFixedItemsBy } from '@/services/lists';
import { getItemProviders, searchMoviesOrSeriesItem } from '@/services/themoviedb';
import { useUserStore } from '@/store';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/button';
import Carousel from '../../components/Carrousel';
import Dropdown from '../../components/dropdown/Dropdown';
import { Input } from '../../components/input';
import Loader from '../../components/loader';
import ArrowDownWideNarrow from '../../components/svgs/ArrowDownWideNarrow';
import Bookmark from '../../components/svgs/Boockmark';
import Eye from '../../components/svgs/Eye';
import EyeOff from '../../components/svgs/EyeOff';
import Search from '../../components/svgs/Search';
import SlidersHorizontal from '../../components/svgs/SlidersHorizontal';
import Trash2 from '../../components/svgs/Trash2';
import Tv from '../../components/svgs/Tv';
import X from '../../components/svgs/X';
import Switch from '../../components/Switch';
import Text from '../../components/Text';
import FixedItemProvidersModal from './fixedItemProvidersModal';
import MovieSeriesItem from './movieSerieItem';

type ItemOption = KeyValue & {
    icon: React.ReactNode;
}

export enum MoviesAndSeriesTypes {
    movies = 'movies',
    series = 'series',
    all = 'all'
}

const categories = [
    { key: 'lists.types.all', value: MoviesAndSeriesTypes.all },
    { key: 'lists.types.movies', value: MoviesAndSeriesTypes.movies },
    { key: 'lists.types.series', value: MoviesAndSeriesTypes.series },
];

const MovieSeriesList = ({ workspaceId, listData, getList }: { workspaceId: string, listData: any, getList: () => Promise<void> }) => {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [categoryFiltersOpen, setCategoryFiltersOpen] = useState(false);
    const [sortByOpen, setSortByOpen] = useState(false);
    const [itemSelected, setItemSelected] = useState<any>(null);
    const [sortByOption, setSortByOption] = useState(sortByFixedListOptions[0]);
    const [seen, setSeen] = useState(false);
    const [category, setCategory] = useState(categories[0]);
    const [carouselData, setCarouselData] = useState<any[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useUserStore();
    const { text: searchText, setText: setSearchText } = useDebouncedText('', (text) => handleSearchItems(text), 650);
    const [itemSelectedProviders, setItemSelectedProviders] = useState<ThemoviedbProvider[] | null>(null);
    const [showProvidersModal, setShowProvidersModal] = useState(false);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const { request: createFixedListItem } = useLazyApi(`fixed-list-items`, 'POST');
    const { request: saveFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'POST');
    const { request: deleteFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'DELETE');

    // useLayoutEffect(() => {
    //     setSearchText('');
    // }, []);


    useEffect(() => {
        setCarouselData(getItemsByFiltersAndSort());
    }, [sortByOption, listData]);

    const getItemsByFiltersAndSort = () => {
        const key = seen ? 'seen' : 'notSeen';
        const newItems = listData.fixedListItemsParsed[key];

        if (category.value !== 'all') {
            const filterItems = newItems.filter((item: any) => item.data.type === category.value);
            return sortListFixedItemsBy(filterItems, sortByOption.value || 'title_asc') as any[];
        }

        return sortListFixedItemsBy(newItems, sortByOption.value || 'title_asc') as any[];
    }

    useEffect(() => {
        applyFilters();
        if (listData.type === 'movies_and_series') {
            setCategory(categories[0]);
        } else if (listData.type === 'movies') {
            setCategory(categories[1]);
        } else if (listData.type === 'series') {
            setCategory(categories[2]);
        }
    }, [listData]);

    useEffect(() => {
        if (itemSelected?.id) {
            setItemOptions([
                { icon: itemSelected.data.checked ? <EyeOff className='text-secondary' /> : <Eye className='text-primary' />, key: itemSelected.data.checked ? 'list.fixed.mark_as_not_seen' : 'list.fixed.mark_as_seen', value: 'toggle_seen' },
                { icon: <Tv className='text-warning' />, key: 'list.fixed.see_providers', value: 'see_providers' },
                { icon: <Trash2 className='text-error' />, key: 'list.fixed.remove_from_list', value: 'remove_from_list' },
            ]);
        } else {
            setItemOptions([
                { icon: <Bookmark className='text-info' />, key: 'list.fixed.add_to_list', value: 'add_to_list' },
                { icon: <Tv className='text-warning' />, key: 'list.fixed.see_providers', value: 'see_providers' }
            ]);
        }
    }, [itemSelected]);

    const applyFilters = () => {
        setCarouselData(getItemsByFiltersAndSort());
        setFiltersOpen(false);
    };

    const handleSearchItems = async (text: string) => {
        setLoadingSearch(true);
        const filterText = text?.toLowerCase().trim();

        const items = await searchItems(filterText);
        setLoadingSearch(false);
        // setItems(_items)
        console.log({items: items[0].data});

        setCarouselData(items);
    }

    const searchItems = async (filterText: string): Promise<FixedItemList<ThemoviedbFixedItem>[]> => {
        if (filterText) {
            const listItemsFiltered = listData.fixedListItems.filter((item: FixedItemList<ThemoviedbFixedItem>) => item.data.title.toLowerCase().includes(filterText))

            const searchType = category.value || 'all';
            const itemsSearched = await searchMoviesOrSeriesItem(filterText, searchType);
            console.log({ itemsSearched });

            const itemsSearchedIds = listItemsFiltered.map((item: FixedItemList<ThemoviedbFixedItem>) => item.data.themoviedbId);
            const itemsSearchedParsed = itemsSearched.filter((_item: ThemoviedbFixedItem) => !itemsSearchedIds.includes(_item.themoviedbId))
                .map((item: ThemoviedbFixedItem) => ({
                    data: item,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

            return [...listItemsFiltered, ...itemsSearchedParsed];
        }

        return getItemsByFiltersAndSort();
    }

    const handleItemOptionSelected = async (option: IdOrValue) => {
        switch (option) {
            case 'add_to_list':
                if (!itemSelected?.id) {
                    const newItemPromise = createFixedListItem(`fixed-list-items`, { list_id: listData.id, order: 0, ...{ ...itemSelected, created_at: undefined, updated_at: undefined } });

                    // notify.promise(
                    //     newItemPromise,
                    //     { isMarkup: true, key: 'list.fixed.adding_item_to_list', data: { title: item.data.title } },
                    //     { isMarkup: true, key: 'list.fixed.item_added_to_list', data: { title: item.data.title } }
                    // );

                    const newItem = await newItemPromise;
                    // setItem?.(newItem);

                    setItemSelected(null);
                    setSearchText('');
                    return newItem;
                } else {
                    console.warn('This items is already in the list.');
                    return null;
                }
            case 'toggle_seen': {
                const data = {
                    ...itemSelected.data,
                    checked: !itemSelected.data.checked
                }
                const updatedItemPromise = saveFixedListItem(`fixed-list-items/${itemSelected.id}`, { ...itemSelected, data, user: undefined, list: undefined });
                // notify.promise(
                //     updatedItemPromise,
                //     { isMarkup: true, key: 'list.fixed.marking_item_as_' + (data.checked ? 'seen' : 'not_seen'), data: { title: item.data.title } },
                //     { isMarkup: true, key: 'list.fixed.item_marked_as_' + (data.checked ? 'seen' : 'not_seen'), data: { title: item.data.title } }
                // );
                const updatedItem = await updatedItemPromise;
                // setItem?.(updatedItem);
                setItemSelected(null);
                return updatedItem;
            }
            case 'remove_from_list': {
                {
                    const deleteFixedListItemPromise = deleteFixedListItem(`fixed-list-items/${itemSelected.id}`);
                    // notify.promise(
                    //     deleteFixedListItemPromise,
                    //     { isMarkup: true, key: 'list.fixed.removing_item_from_list', data: { title: item.data.title } },
                    //     { isMarkup: true, key: 'list.fixed.item_removed_from_list', data: { title: item.data.title } }
                    // );
                    const deletedItem = await deleteFixedListItemPromise;
                    // setItem?.(deletedItem);
                    setItemSelected(null);
                    return deletedItem;
                }
            }
            case 'see_providers': {
                setShowProvidersModal(true);
                setIsLoadingProviders(true);
                const providers = await getItemProviders(itemSelected.data.type, itemSelected.data.themoviedbId);
                setItemSelectedProviders(providers);
                setIsLoadingProviders(false);
                break;
            }
        }
    }

    return (
        <>
            <PageLayout onRefresh={getList} breadcrumbData={listData?.breadcrumb} className='gap-0'>
                {/* <CustomPullToRefreshOnRelease onRefresh={getList}> */}
                    <View className='flex flex-1 gap-6'>
                        <View className='flex flex-row gap-6 items-end'>
                            <View className='flex-1'>
                                <Input
                                    label={category.value === 'all' ? 'list.fixed.search_item' : category.value === 'movies' ? 'list.fixed.search_movie' : 'list.fixed.search_series'}
                                    value={searchText}
                                    selectionColor={colors?.['secondary']}
                                    onChangeText={(value) => setSearchText(value)}
                                    suffixIcon={
                                        searchText.length > 0
                                            ? <TouchableOpacity onPress={() => setSearchText('')}>
                                                <X size={20} className='text-base-content' />
                                            </TouchableOpacity>
                                            : <Search size={20} className='text-base-content' />
                                    }
                                />
                            </View>
                            <View className='flex flex-row gap-6 pb-2'>
                                <TouchableOpacity hitSlop={10} onPress={() => setSortByOpen(true)} disabled={searchText.length > 0}>
                                    <ArrowDownWideNarrow size={24} className={`mb-2 text-base-content ${searchText.length > 0 ? 'opacity-50' : ''}`} />
                                </TouchableOpacity>
                                <TouchableOpacity hitSlop={10} onPress={() => setFiltersOpen(true)} disabled={searchText.length > 0}>
                                    <SlidersHorizontal size={24} className={`mb-2 text-base-content ${searchText.length > 0 ? 'opacity-50' : ''}`} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {loadingSearch &&
                            <View className='flex-1 items-center justify-center'>
                                <Loader />
                            </View>
                        }
                        {!loadingSearch && carouselData.length > 0 &&
                            <Carousel
                                data={carouselData}
                                keyExtractor={(item) => `${item.data.type}-${item.data.themoviedbId}`}
                                renderItem={(item) =>
                                    {
                                        return (
                                            <MovieSeriesItem
                                                {...item.data}
                                                itemId={item.id}
                                                onPress={() => {
                                                    const url = item.id
                                                        ? `(app)/${workspaceId}/lists/moviesSeries/${listData.id}/${item.data.type}/${item.id}`
                                                        : `(app)/${workspaceId}/lists/moviesSeries/${listData.id}/${item.data.type}/unlisted/${item.data.themoviedbId}`;
                                                    router.push(url as Href);
                                                }}
                                                onLongPress={() => setItemSelected(item)}
                                            />
                                        );
                                    }
                                }
                            />
                        }
                        {!loadingSearch && !carouselData.length &&
                            <View className='flex-1 items-center justify-center'>
                                <Text text='no_items' className='text-2xl text-base-content' />
                            </View>
                        }
                    </View>
                {/* </CustomPullToRefreshOnRelease> */}
            </PageLayout>

            {/* Filters */}
            <BottomSheet isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
                <View className='flex px-4 gap-4 justify-between'>
                    <View className='flex gap-2 pt-4'>
                        <Text text='filters' className='text-xl font-bold text-base-content' />
                        <Switch
                            label='list.toggle_seen'
                            value={seen}
                            onPress={() => setSeen(!seen)}
                        />
                        {listData.type === 'movies_and_series' && (
                            <Dropdown
                                label='list.fixed.select_list_type'
                                text={category.key}
                                onPress={() => setCategoryFiltersOpen(true)}
                            />
                        )}
                    </View>

                    <Button
                        name='apply'
                        onPress={() => applyFilters()}
                    />
                </View>
            </BottomSheet>

            {/* Sort By */}
            <BottomSheet isOpen={sortByOpen} onClose={() => setSortByOpen(false)} >
                <ScrollView className='flex' contentContainerClassName='px-4'>
                    <Text text='sort_by' className='text-xl font-bold text-base-content' />

                    <View className='flex gap-4 pt-4'>
                        {sortByFixedListOptions.length && sortByFixedListOptions.map((_sortByOption) => (
                            <TouchableOpacity
                                key={_sortByOption.value}
                                className={`px-6 py-4 rounded-xl border-2  ${sortByOption.value === _sortByOption.value ? 'border-primary/80' : 'border-base-content/20'}`}
                                onPress={() => {
                                    setSortByOption(_sortByOption);
                                    setSortByOpen(false);
                                }}
                            >
                                <Text text={_sortByOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </BottomSheet>

            {/* Category */}
            <BottomSheet isOpen={categoryFiltersOpen} onClose={() => setCategoryFiltersOpen(false)}>
                <View className='flex px-4'>
                    <Text text='list.fixed.select_list_type' className='text-xl font-bold text-base-content' />

                    <View className='flex gap-4 pt-4'>
                        {categories.length && categories.map((_category) => (
                            <TouchableOpacity
                                key={_category.value}
                                className={`px-6 py-4 rounded-xl border-2  ${category.value === _category.value ? 'border-primary/80' : 'border-base-content/20'}`}
                                onPress={() => {
                                    setCategory(_category);
                                    setCategoryFiltersOpen(false);
                                }}
                            >
                                <Text text={_category.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Item Options */}
            <BottomSheetOptions
                isOpen={!!itemSelected}
                onClose={() => setItemSelected(null)}
                options={itemOptions.map(_itemOption => ({
                    ..._itemOption,
                    value: _itemOption.value.toString()
                }))}
                title={itemSelected?.data.title}
                handleItemOptionSelected={handleItemOptionSelected}
            />
            {/* <BottomSheet isOpen={!!itemSelected} onClose={() => setItemSelected(null)}>
                <View className='flex px-4'>
                    <Text avoidTranslation text={itemSelected?.data.title} className='text-xl font-bold text-base-content' />

                    <View className='flex gap-4 pt-4'>
                        {itemOptions?.map((_itemOption) => (
                            <TouchableOpacity
                                key={_itemOption.value}
                                className={`flex-row items-center gap-6 px-6 py-4 rounded-xl border-2 border-base-content/40`}
                                onPress={() => handleItemOptionSelected(_itemOption.value)}
                            >
                                {_itemOption.icon}
                                <Text text={_itemOption.key} className={`text-2xl text-base-content`} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet> */}

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

export default MovieSeriesList;
