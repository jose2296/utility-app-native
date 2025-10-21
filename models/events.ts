import dayjs from 'dayjs';

export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    completed: boolean;
    is_all_day: boolean;
    time?: string;
    reminders?: EventReminder[];
    created_at: string;
    updated_at: string;
}

export interface EventReminder {
    id?: string;
    index: number;
    event_id?: string;
    offset_time: string;
    unit: EventReminderUnits;
    specific_time?: dayjs.Dayjs;
    created_at?: string;
}

export enum EventReminderUnits {
    same_day = 'same_day',
    minutes = 'minutes',
    hours = 'hours',
    days = 'days',
    weeks = 'weeks'
}
