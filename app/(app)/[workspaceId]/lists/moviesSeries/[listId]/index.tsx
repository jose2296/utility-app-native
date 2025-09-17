import Loader from '@/components/loader';
import { useLazyApi } from '@/hooks/use-api';
import useRealtimeGetData from '@/hooks/use-realtime';
import MovieSeriesList from '@/modules/lists/movieSeries';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ellipsis } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';

export const parseList = (list: any) => {
    list = parseListCommon(list);

    const fixedListItemsParsed = list.fixedListItems.reduce((acc: any, item: any) => {
        if (item.data.checked) {
            return {
                ...acc,
                seen: [
                    ...acc.seen,
                    item
                ],
            };
        }

        return {
            ...acc,
            notSeen: [
                ...acc.notSeen,
                item
            ]
        };
    }, { seen: [], notSeen: [] });

    return {
        ...list,
        fixedListItemsParsed
    };

};

const ListScreen = () => {
    const { listId, workspaceId } = useLocalSearchParams();
    const { data: listData, loading, error, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const workspace = useUserStore((state) => state.data?.workspaces?.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useFocusEffect(
        useCallback(() => {
            getList();
        }, []
    ));

    useEffect(() => {
        const hideHeader = (loading && !listData) || !listData;
        navigation.setOptions({
            title: listData?.name,
            headerShown: !hideHeader,
            headerTintColor: workspace?.color,
            headerRight: () => (
                <TouchableOpacity disabled={false} onPress={() => null} className={`p-4`}>
                    <Ellipsis size={20} className='text-base-content' />
                </TouchableOpacity>
            )
        });
    }, [navigation, listData, workspace]);

    if ((loading && !listData) || !listData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <MovieSeriesList workspaceId={workspaceId as string} listData={listData} getList={getList} />

            {/* <BottomSheet
                isOpen={true}
                onClose={() => null}
                children={
                    <View className='flex flex-1 items-center justify-center'>
                        <Button name='Share list' onPress={async () => {
                            const isAvailable = await isAvailableAsync();
                            console.log(isAvailable);

                            if (!isAvailable) return;

                            Share.share({ title: 'TEST', message: 'TjEST' })
                                .then((res) => {
                                    console.log(res);
                                })
                                .catch((err) => {
                                    err && console.log(err);
                                });
                            await shareAsync('https://example.com', { dialogTitle: 'TEST', UTI: 'public.url' });
                        }} />
                    </View>
                }
            /> */}
        </>
    );
}

export default ListScreen;
