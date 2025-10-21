import dayjs from 'dayjs';

// Movies/series list items sort
export const sortListFixedItemsBy = (items: any[], sortBy: string): any[] => {
    switch (sortBy) {
        case 'title_asc':
            return [...items].sort((a, b) => a.data.title?.localeCompare(b.data.title));
        case 'title_desc':
            return [...items].sort((a, b) => b.data.title?.localeCompare(a.data.title));
        case 'release_date_asc':
            return [...items].sort((a, b) => new Date(a.data.released).getTime() - new Date(b.data.released).getTime());
        case 'release_date_desc':
            return [...items].sort((a, b) => new Date(b.data.released).getTime() - new Date(a.data.released).getTime());
        case 'added_at_asc':
            return [...items].sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
        case 'added_at_desc':
            return [...items].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
        default:
            return items;
    }
}

// Tasks list items sort
export const sortTasksListItemsBy = (items: any[], sortBy: string): any[] => {
    switch (sortBy) {
        case 'content_asc':
            return [...items].sort((a, b) => a.content?.localeCompare(b.content));
        case 'content_desc':
            return [...items].sort((a, b) => b.content?.localeCompare(a.content));
        case 'added_at_asc':
            return [...items].sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
        case 'added_at_desc':
            return [...items].sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());
        default:
            return items;
    }
}
