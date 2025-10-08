import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import { Input } from '@/components/input';
import Loader from '@/components/loader';
import PageLayout from '@/components/PageLayout';
import ArrowDownWideNarrow from '@/components/svgs/ArrowDownWideNarrow';
import Bookmark from '@/components/svgs/Boockmark';
import Eye from '@/components/svgs/Eye';
import EyeOff from '@/components/svgs/EyeOff';
import Search from '@/components/svgs/Search';
import SlidersHorizontal from '@/components/svgs/SlidersHorizontal';
import Trash2 from '@/components/svgs/Trash2';
import X from '@/components/svgs/X';
import Switch from '@/components/Switch';
import Text from '@/components/Text';
import { sortByOptions } from '@/constants/list';
import { useLazyApi } from '@/hooks/use-api';
import useDebouncedText from '@/hooks/use-debounce-text';
import useRealtimeGetData from '@/hooks/use-realtime';
import { BookFixedItem } from '@/models/books';
import { FixedItemList } from '@/models/list';
import { IdOrValue, KeyValue } from '@/models/utils';
import BooksList from '@/modules/lists/books/booksList';
import { searchBookByTitle } from '@/services/books-api';
import { sortListItemsBy } from '@/services/lists';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type ItemOption = KeyValue & {
    icon: React.ReactNode;
}

export const parseList = (list: any) => {
    list = parseListCommon(list);

    const fixedListItemsParsed = list.fixedListItems.reduce((acc: any, item: any) => {
        if (item.data.checked) {
            return {
                ...acc,
                read: [
                    ...acc.read,
                    item
                ],
            };
        }

        return {
            ...acc,
            notRead: [
                ...acc.notRead,
                item
            ]
        };
    }, { read: [], notRead: [] });

    return {
        ...list,
        fixedListItemsParsed
    };
};

const BooksScreen = () => {
    const { listId } = useLocalSearchParams();
    const { data: listData, loading, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const { workspaceId } = useLocalSearchParams();
    const workspace = useUserStore((state) => state.data?.workspaces?.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortByOpen, setSortByOpen] = useState(false);
    const [itemSelected, setItemSelected] = useState<any>(null);
    const [sortByOption, setSortByOption] = useState(sortByOptions[0]);
    const [read, setRead] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useUserStore();
    const { text: searchText, setText: setSearchText } = useDebouncedText('', (text) => handleSearchItems(text), 650);
    const [carouselData, setCarouselData] = useState<any[]>([]);
    const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
    const { request: createFixedListItem } = useLazyApi(`fixed-list-items`, 'POST');
    const { request: saveFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'POST');
    const { request: deleteFixedListItem } = useLazyApi(`fixed-list-items/:id`, 'DELETE');

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useEffect(() => {
        const hideHeader = (loading && !listData) || !listData;
        navigation.setOptions({ title: listData?.name, headerShown: !hideHeader, headerTintColor: workspace?.color });

    }, [navigation, listData, workspace]);

    useEffect(() => {
        if (listData) {
            applyFilters();
            setSearchText('');
        }
    }, [listData]);

    useEffect(() => {
        if (listData) {
            setCarouselData(getItemsByFiltersAndSort());
        }
    }, [sortByOption]);

    useEffect(() => {
        if (itemSelected?.id) {
            setItemOptions([
                { icon: itemSelected.data.checked ? <EyeOff className='text-secondary' /> : <Eye className='text-primary' />, key: itemSelected.data.checked ? 'list.fixed.mark_as_not_seen' : 'list.fixed.mark_as_seen', value: 'toggle_read' },
                { icon: <Trash2 className='text-error' />, key: 'list.fixed.remove_from_list', value: 'remove_from_list' },
            ]);
        } else {
            setItemOptions([
                { icon: <Bookmark className='text-info' />, key: 'list.fixed.add_to_list', value: 'add_to_list' },
            ]);
        }
    }, [itemSelected]);


    const applyFilters = () => {
        setCarouselData(getItemsByFiltersAndSort());
        setFiltersOpen(false);
    };


    const getItemsByFiltersAndSort = () => {
        const key = read ? 'read' : 'notRead';
        const newItems = listData.fixedListItemsParsed[key];

        return sortListItemsBy(newItems, sortByOption.value || 'title_asc') as any[];
    }

    const handleSearchItems = async (text: string) => {
        setLoadingSearch(true);
        const filterText = text?.toLowerCase().trim();
        const items = await searchItems(filterText);

        setLoadingSearch(false);
        setCarouselData(items);
    };

    const searchItems = async (filterText: string): Promise<FixedItemList<BookFixedItem>[]> => {
        if (filterText) {
            const listItemsFiltered = listData.fixedListItems.filter((item: FixedItemList<BookFixedItem>) => item.data.title.toLowerCase().includes(filterText))

            const itemsSearched = await searchBookByTitle(filterText);
            const itemsSearchedIds = listItemsFiltered.map((item: FixedItemList<BookFixedItem>) => item.data.externalId);
            const itemsSearchedParsed = itemsSearched
                .filter((item: BookFixedItem) => !itemsSearchedIds.includes(item.externalId))
                .map((item: BookFixedItem) => ({
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
                    return newItem;
                } else {
                    console.warn('This items is already in the list.');
                    return null;
                }
            case 'toggle_read': {
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
        }
    }

    if ((loading && !listData) || !listData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <PageLayout onRefresh={getList} breadcrumbData={listData?.breadcrumb}>
                <View className='flex flex-row gap-6 items-end'>
                    <View className='flex-1'>
                        <Input
                            label='list.books.search_book'
                            value={searchText}
                            selectionColor={colors?.['secondary']}
                            onChangeText={(value) => setSearchText(value)}
                            suffixIcon={
                                searchText.length > 0
                                    ? <TouchableOpacity onPress={() => setSearchText('')} hitSlop={10}>
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
                <BooksList
                    books={carouselData}
                    handleItemSelected={setItemSelected}
                />
            </PageLayout>


            {/* Filters */}
            <BottomSheet isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
                <View className='flex px-4 justify-between' style={{ paddingBottom: insets.bottom }}>
                    <View className='flex gap-4 pt-4'>
                        <Text text='filters' className='text-xl font-bold text-base-content' />
                        <Switch
                            label='list.toggle_seen'
                            value={read}
                            onPress={() => setRead(!read)}
                        />
                    </View>


                    <View className='items-end'>
                        <Button
                            name='apply'
                            onPress={() => applyFilters()}
                        />
                    </View>
                </View>
            </BottomSheet>

            {/* Sort By */}
            <BottomSheet isOpen={sortByOpen} onClose={() => setSortByOpen(false)} >
                <ScrollView className='flex flex-1' contentContainerClassName='px-4' contentContainerStyle={{ paddingBottom: insets.bottom }}>
                    <Text text='sort_by' className='text-xl font-bold text-base-content' />

                    <View className='flex gap-4 pt-4'>
                        {sortByOptions.length && sortByOptions.map((_sortByOption) => (
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


            {/* Item Options */}
            <BottomSheet isOpen={!!itemSelected} onClose={() => setItemSelected(null)}>
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
            </BottomSheet>
        </>
    );
}

export default BooksScreen;
