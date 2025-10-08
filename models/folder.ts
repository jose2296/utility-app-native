import { ListTypeValue } from '@/modules/lists/saveListModal';
import { Href } from 'expo-router';
import { ITEMS_ICONS } from '../utils/dashboard';
import { List } from './list';
import { User } from './me';
import { Note } from './note';
import { Breadcrumb } from './utils';

export interface Folder {
    id: number;
    name: string;
    color: string;
    parent_id: number;
    user_id: number;
    root_id: number;
    children?: Folder[];
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
        listType?: ListTypeValue;
        isOwner?: boolean;
        collaborators?: User[];
        icon: keyof typeof ITEMS_ICONS;
        href: Href;
    }[];
    lists: List[];
    notes: Note[];
    children: Folder[];
    created_at: string;
    updated_at: string;
};
