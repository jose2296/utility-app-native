import { ITEMS_ICONS } from '@/utils/dashboard';
import { Href } from 'expo-router';
import { Folder } from './folder';
import { DashboardItemType } from './utils';

export interface Me {
    id: number;
    name: string;
    email: string;
    dashboardItems: ParsedDashboardItem[];
    workspaces: Folder[];
    created_at: string;
    updated_at: string;
}

export interface DashboardItem {
    id: number;
    order: number;
    size: {
        width: number;
        height: number;
    };
    icon: keyof typeof ITEMS_ICONS;
    href: Href;
    entity_id: number;
    entity_type: DashboardItemType;
    entity: DashboardItemEntity;
    user_id: number;
    created_at: string;
    updated_at: string;
}
export interface ParsedDashboardItem {
    id: number;
    size: {
        width: number;
        height: number;
    }
    order: number;
    icon: keyof typeof ITEMS_ICONS;
    href: Href;
    entity_id: number;
    entity_type: DashboardItemType;
    entity: DashboardItemEntity;
    user_id: number;
    created_at: string;
    updated_at: string;
}

interface DashboardItemEntity {
    id: number;
    name: string;
    type: DashboardItemType;
    user: any;
    created_at: string;
    updated_at: string;
    folder: Folder;
    workspace: Folder;
    isOwner: boolean;
}
