import { Href } from 'expo-router';

export const parseNote = (note: any) => {

    const foldersBreadcrumb = note.folder.breadcrumb.map((item: any, index: number) => ({
        id: item.id,
        name: item.name,
        color: item.color || null,
        href: index === 0 ? `/(app)/${item.id}` : `/(app)/${note.folder.root.id}/${item.id}` as Href,
        avoidTranslation: true
    }));

    note.breadcrumb = [...foldersBreadcrumb, {
        id: note.id,
        name: note.title,
        href: `/(app)/${note.folder.root.id}/notes/${note.id}` as Href,
        avoidTranslation: true
    }];

    return note;
};
