import Loader from '@/components/loader';
import { useApi } from '@/hooks/use-api';
import { FolderDetailsData } from '@/models/folder';
import { Breadcrumb as BreadcrumbType } from '@/models/utils';
import { useUserStore } from '@/store';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Href, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { BookText, Clapperboard, Film, Folder, SquareCheckBig, StickyNote, Tv } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

cssInterop(FontAwesome6, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            stroke: "selectionColor", // extract `color` and pass it to the `selectionColor`prop
        },
    },
});
cssInterop(Clapperboard, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Folder, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Film, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Tv, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(BookText, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(StickyNote, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(SquareCheckBig, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});

const icons = {
    tasks: <SquareCheckBig size={20} className='text-base-content' />,
    movies: <Film size={20} className='text-base-content' />,
    series: <Tv size={20} className='text-base-content' />,
    movies_and_series: <Clapperboard size={20} className='text-base-content' />,
    books: <BookText size={20} className='text-base-content' />,
    notes: <StickyNote size={20} className='text-base-content' />,
    folder: <Folder size={20} className='text-base-content' />
}


const parseFolder = (data: FolderDetailsData): FolderDetailsData => {
    const lists = data.lists.map((item) => ({
        id: item.id,
        name: item.name,
        type: 'list',
        icon: icons[item.type as keyof typeof icons],
        href: `/(app)/lists/${item.id}` as Href
    }));
    const notes = data.notes.map((item) => ({
        id: item.id,
        name: item.title,
        icon: icons.notes,
        type: 'note',
        href: `/(app)/notes/${item.id}` as Href,
    }));
    const children = data.children.map((item) => ({
        id: item.id,
        name: item.name,
        icon: icons.folder,
        type: 'folder',
        href: `/(app)/${item.root_id}/${item.id}` as Href,
    }));

    return {
        ...data,
        items: [...lists, ...notes, ...children],
        breadcrumb: data.breadcrumb.map((item) => ({
            id: item.id,
            name: item.name,
            href: `/(app)/${item.id}` as Href,
            avoidTranslation: true
        }))
    };
}

export default function WorkspaceScreen() {
    const { workspaceId } = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const workspace = useUserStore((state) => state.data?.workspaces.find((workspace) => workspace.id === Number(workspaceId)));
    const { data, loading } = useApi(`folders/${workspaceId}`, 'GET', null, parseFolder);

    useEffect(() => {
        if (workspace) {
            navigation.setOptions({ title: workspace.name });
        }
    }, [workspace]);

    if (loading || !data) {
        return (
            <View className='flex flex-1 flex-col items-center gap-2 justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <View className='px-4 py-4 gap-4'>
            <Breadcrumb breadcrumb={data?.breadcrumb} />

            <View className='flex flex-col gap-y-6'>
                {data.items.map((item) => (
                    <View key={`item-${item.id}-${item.name}`} className='flex flex-row items-center gap-6 border border-base-content hover:bg-base-300 rounded-lg bg-neutral'>
                        <Pressable onPress={() => {console.log(item?.href); router.push(item?.href as Href)}} android_ripple={{ color: '#00000022' }} className=' flex-1 flex-row flex items-center gap-x-4 py-5 px-6 text-xl'>
                            <View className='min-w-fit text-base-content'>
                                {item?.icon}
                            </View>
                            <Text className='text-base-content truncate text-2xl'>{item?.name}</Text>
                        </Pressable>
                        {/* <View className="flex items-center w-fit gap-x-2 mr-4">
                                {item.type === 'list' && <Item.List />}
                                {item.type === 'note' && <Item.Note />}
                                {item.type === 'folder' && <Item.Folder />}
                            </View> */}
                    </View>
                ))}
            </View>

        </View>
    );
}


const Breadcrumb = ({ breadcrumb }: { breadcrumb: BreadcrumbType[] }) => {
    const router = useRouter();

    return (
        <View className='flex flex-row items-center py-2 gap-2'>
            {breadcrumb.map((item, index) => (
                <View key={`breadcrumb-item-${item.id || index}-${item.name}`}>
                    {index !== breadcrumb.length - 1 ? (
                        <View className='flex flex-row items-center gap-2'>
                            <Pressable
                                onPress={() => router.push(item.href)}
                                className='hover:text-gray-300 transition-all text-base-content flex flex-row items-center gap-2'
                            >
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
