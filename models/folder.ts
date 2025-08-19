import { Href } from 'expo-router';
import { List } from './list';
import { Note } from './note';
import { Breadcrumb } from './utils';
import { ITEMS_ICONS } from '../utils/dashboard';

export interface Folder {
    id: number;
    name: string;
    color: string;
    parent_id: number;
    user_id: number;
    root_id: number;
    created_at: string;
    updated_at: string;
};

export interface FolderDetailsData {
    id: number;
    name: string;
    color: string;
    parent_id: number;
    user_id: number;
    breadcrumb: Breadcrumb[];
    items: {
        id: number;
        name: string;
        type: string;
        icon: keyof typeof ITEMS_ICONS;
        href: Href;
    }[];
    lists: List[];
    notes: Note[];
    children: Folder[];
    created_at: string;
    updated_at: string;
};
