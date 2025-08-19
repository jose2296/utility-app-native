import { Href } from 'expo-router';

export const parseListType = (type: string) => {
    return ['movies_and_series', 'movies', 'series'].includes(type)
        ? 'moviesSeries'
        : type;
}

export const parseListCommon = (list: any) => {
    list.isCollaborating = !!list.listCollaborators.length;

    const foldersBreadcrumb = list.folder.breadcrumb.map((item: any, index: number) => ({
        id: item.id,
        name: item.name,
        color: item.color || null,
        href: index === 0 ? `/(app)/${item.id}` : `/(app)/${list.folder.root.id}/${item.id}` as Href,
        avoidTranslation: true
    }));

    list.breadcrumb = [...foldersBreadcrumb, {
        id: list.id,
        name: list.name,
        href: `/(app)/${list.folder.root.id}/lists/${parseListType(list.type)}/${list.id}` as Href,
        avoidTranslation: true
    }];

    return list;
};
