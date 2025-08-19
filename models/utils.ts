import { Href } from 'expo-router';

export type IdOrValue = string | number;

export interface Breadcrumb {
    id?: number;
    name: string;
    href: Href;
    avoidTranslation?: boolean;
    color?: string;
};

export enum DashboardItemType {
    lists = 'lists',
    notes = 'notes'
}

export type SelectOption = {
    avoidTranslation?: boolean;
    key: string;
    value: IdOrValue;
};

export interface KeyValue {
    key: string;
    value: string;
}
