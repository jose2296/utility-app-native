import { ITEMS_ICONS } from '@/utils/dashboard';
import { Href } from 'expo-router';
import { Folder, FolderDetailsData } from './folder';
import { DashboardItemType } from './utils';

export interface Me extends User {
    dashboardItems: ParsedDashboardItem[];
    workspaces: FolderDetailsData[];
    userNotifications: UserNotification[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    device_tokens?: string[];
    language: string;
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
    name?: string;
    title?: string;
    type: DashboardItemType;
    user: any;
    created_at: string;
    updated_at: string;
    folder: Folder;
    workspace: Folder;
    isOwner: boolean;
}

export enum DaysOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
}

export interface UserNotification {
    time: string;
    days: DaysOfWeek[];
}
