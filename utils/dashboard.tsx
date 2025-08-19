import { DashboardItem, ParsedDashboardItem } from '@/models/me';
import { DashboardItemType } from '@/models/utils';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Href } from 'expo-router';
import { BookText, Clapperboard, Film, Folder, LucideProps, SquareCheckBig, StickyNote, Tv } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { parseListType } from './lists';

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

export const ITEMS_ICONS = {
    tasks: SquareCheckBig,
    movies: Film,
    series: Tv,
    movies_and_series: Clapperboard,
    books: BookText,
    notes: StickyNote,
    folders: Folder
};

export const ItemIcon = ({ icon, ...props }: { icon: keyof typeof ITEMS_ICONS } & LucideProps) => {
    const Icon = ITEMS_ICONS[icon];

    return <Icon size={25} className='text-base-content' {...props} />;
}

export const parseDashboardItem = (items: any[]): ParsedDashboardItem[] => {
    return items.map((item, index) => {
        const icon = (item.entity_type === DashboardItemType.lists
            ? item.entity.type
            : item.entity_type
        ) as keyof typeof ITEMS_ICONS;

        return {
            ...item,
            icon: icon,
            href: `/(app)/${item.entity.workspace.id}/${item.entity_type}/${parseListType(item.entity.type)}/${item.entity.id}` as Href,
            order: item.order,
            size: item.size
        }
    }) || [];
}
