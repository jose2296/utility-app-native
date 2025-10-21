import AnimatedList from '@/components/animatedList';
import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import Checkbox from '@/components/checkbox';
import Dropdown from '@/components/dropdown/Dropdown';
import FixedButton from '@/components/FixedButton';
import InformationModal from '@/components/InformationModal';
import { Input } from '@/components/input';
import Loader from '@/components/loader';
import { CustomSwipeable, useSwipeableControl } from '@/components/swipeable';
import Switch from '@/components/Switch';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { Event, EventReminder, EventReminderUnits } from '@/models/events';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useNavigation } from 'expo-router';
import { Bell, Calendar, Check, Clock, Pencil, Plus, Text as TextIcon, Trash2, Undo } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';


const parseEvents = (data: Event[]): Event[] => {
    const newEvents = data.reduce<{ inCompleted: Event[], completed: Event[] }>((acc, event) => {
        const reminders = event.reminders?.map((reminder, index) => ({
            index,
            offset_time: reminder.offset_time,
            unit: reminder.unit,
            specific_time: reminder.specific_time
        })) || [];

        return event.completed
            ? { ...acc, completed: [...acc.completed, { ...event, reminders }] }
            : { ...acc, inCompleted: [...acc.inCompleted, { ...event, reminders }] };
    }, { inCompleted: [], completed: [] });

    const emptyItem = (newEvents.completed.length && newEvents.inCompleted.length
        ? [{ id: 'empty', title: '', completed: false, date: '', is_all_day: false, time: '', created_at: '', updated_at: '' }]
        : []);

    return [
        ...newEvents.inCompleted,
        ...emptyItem,
        ...newEvents.completed,
    ];
}

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [saveEventModalVisible, setSaveEventModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false);
    const [saveEventModalMode, setSaveEventModalMode] = useState<'create' | 'edit' | 'see'>('create');
    const navigation = useNavigation();
    const { request: deleteEvent } = useLazyApi('events', 'DELETE');
    const { request: getEvents, data: events, loading: isLoading } = useLazyApi<Event[]>('events', 'GET', null, parseEvents);
    const { request: toggleEventCompleted, loading: toggleEventCompletedLoading } = useLazyApi('events/', 'POST');
    const { request: saveEvent } = useLazyApi('events/', 'POST');

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    disabled={selectedDate.format('DD/MM/YYYY') === dayjs().format('DD/MM/YYYY')}
                    onPress={() => setSelectedDate(dayjs())}
                    className={`size-16 items-center justify-center relative ${selectedDate.format('DD/MM/YYYY') === dayjs().format('DD/MM/YYYY') ? 'opacity-50' : ''}`}
                    hitSlop={10}
                >
                    <Calendar size={30} className='text-base-content' />
                    <View className='w-full h-full flex items-center justify-center absolute top-[5px]'>
                        <Text
                            avoidTranslation
                            text={dayjs().format('DD') || ''}
                            className='text-base-content text-[8px] font-bold'
                        />
                    </View>
                </TouchableOpacity>
            )
        });
    }, [selectedDate]);

    useEffect(() => {
        getEvents(`events/${selectedDate.format('YYYY-MM-DD')}`);
    }, [selectedDate]);

    // useEffect(() => {
    //     if (eventsData) {
    //         const newEvents = eventsData.reduce<{ inCompleted: Event[], completed: Event[] }>((acc, event) => {
    //             return event.completed
    //                 ? { ...acc, completed: [...acc.completed, event] }
    //                 : { ...acc, inCompleted: [...acc.inCompleted, event] };
    //         }, { inCompleted: [], completed: [] });

    //         setEvents([
    //             ...newEvents.inCompleted,
    //             ...(newEvents.completed.length && newEvents.inCompleted.length ? [{ id: 'empty', title: '', completed: false, date: '', is_all_day: false, time: '', created_at: '', updated_at: '' }] : []),
    //             ...newEvents.completed,
    //         ]);
    //     }
    // }, [eventsData]);

    const getEventsData = async () => {
        await getEvents(`events/${selectedDate.format('YYYY-MM-DD')}`);
    }

    const handleSaveEvent = async ({ date, time, title, description, isAllDay, reminders }: { date: dayjs.Dayjs, time: dayjs.Dayjs, title: string, description: string, isAllDay: boolean, reminders: EventReminder[] }) => {
        await saveEvent(`events`, {
            id: selectedEvent?.id,
            title,
            description,
            date: date.toDate(),
            time: isAllDay ? null : time.toDate(),
            is_all_day: isAllDay,
            reminders: reminders.map((reminder) => ({
                offset_time: parseInt(reminder.offset_time),
                unit: reminder.unit,
                specific_time: reminder.specific_time?.toDate()
            }))
        });
        getEventsData();
        setSaveEventModalVisible(false);
        setSelectedEvent(null);
    }

    const handleToggleEventCompleted = async (event_id: string, completed: boolean): Promise<void> => {
        await toggleEventCompleted(`events`, { id: event_id, completed });
        getEventsData();
    }

    const handleDeleteEvent = async (event: Event): Promise<void> => {
        await deleteEvent(`events/${event.id}`);
        getEventsData();
    }

    const handleOpenSaveEventModal = (event: Event) => {
        setSaveEventModalMode('edit');
        setSelectedEvent(event);
        setSaveEventModalVisible(true);
    }

    const handleOpenDeleteEventModal = (event: Event) => {
        setSelectedEvent(event);
        setDeleteEventModalVisible(true);
    }

    return (
        <>
            <CalendarContainer
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
            <EventsContainer
                selectedDate={selectedDate}
                events={events || []}
                isLoading={isLoading}
                handleSeeEvent={(event) => {
                    setSaveEventModalMode('see');
                    setSelectedEvent(event);
                    setSaveEventModalVisible(true);
                }}
                toggleEventCompletedLoading={toggleEventCompletedLoading}
                handleToggleEventCompleted={handleToggleEventCompleted}
                handleEditEvent={handleOpenSaveEventModal}
                handleDeleteEvent={handleOpenDeleteEventModal}
            />

            <FixedButton
                onPress={() => {
                    setSaveEventModalMode('create');
                    setSelectedEvent(null);
                    setSaveEventModalVisible(true);
                }}
            />

            {/* Save event modal */}
            <SaveEventModal
                isOpen={saveEventModalVisible}
                mode={saveEventModalMode}
                event={selectedEvent}
                selectedDate={selectedDate}
                handleEditEvent={handleOpenSaveEventModal}
                handleDeleteEvent={(event) => {
                    setSelectedEvent(event);
                    setSaveEventModalVisible(false);
                    setDeleteEventModalVisible(true);
                }}
                onClose={() => {
                    setSaveEventModalVisible(false);
                    setSelectedEvent(null);
                }}
                onSubmit={handleSaveEvent}
            />

            {/* Delete Event modal */}
            <InformationModal
                isOpen={deleteEventModalVisible}
                title='events.delete_event'
                message='events.delete_event_message'
                messageTranslateData={{ title: selectedEvent?.title || '' }}
                isLoading={false}
                onClose={() => {
                    setDeleteEventModalVisible(false);
                    setSelectedEvent(null);
                }}
                onSubmit={() => {
                    handleDeleteEvent(selectedEvent!);
                    setDeleteEventModalVisible(false);
                    setSelectedEvent(null);
                }}
            />
        </>
    );
};

const CalendarContainer = ({ selectedDate, setSelectedDate }: { selectedDate: dayjs.Dayjs, setSelectedDate: (date: dayjs.Dayjs) => void }) => {
    const { colors } = useUserStore();
    const [forceRenderKey, setForceRenderKey] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setForceRenderKey(1);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    return (
        <CalendarProvider
            date={selectedDate.format('YYYY-MM-DD')}
            style={{
                flex: 0
            }}
            onDateChanged={date => {
                setSelectedDate(dayjs(date));
            }}
            onMonthChange={date => {
                setSelectedDate(dayjs(date.dateString));
            }}
        >
            <ExpandableCalendar
                key={forceRenderKey}
                renderHeader={(date, info) => {
                    return (
                        <TouchableOpacity onPress={() => alert('provider month: ' + dayjs(date.dateString).format('DD/MM/YYYY'))}>
                            <Text avoidTranslation text={selectedDate.format('MMMM YYYY') || ''} className='text-base-content text-xl capitalize' />
                        </TouchableOpacity>
                    )
                }}
                theme={{
                    backgroundColor: colors?.['base-100']!,
                    calendarBackground: colors?.['base-100']!,
                    textSectionTitleColor: colors?.['base-content']!,
                    textSectionTitleDisabledColor: colors?.['base-content-rgba/20']!,
                    selectedDayBackgroundColor: colors?.['primary']!,
                    selectedDayTextColor: colors?.['primary-content']!,
                    todayTextColor: colors?.['primary']!,
                    dayTextColor: colors?.['base-content']!,
                    textDisabledColor: colors?.['base-content-rgba/20']!,
                    dotColor: colors?.['primary']!,
                    selectedDotColor: colors?.['primary-content']!,
                    arrowColor: colors?.['base-content']!,
                    disabledArrowColor: colors?.['primary-rgba/20']!,
                    monthTextColor: colors?.['base-content']!,
                    indicatorColor: colors?.['primary-rgba/20']!,
                    textDayFontFamily: 'SansSerif',
                    textMonthFontFamily: 'SansSerif',
                    textDayHeaderFontFamily: 'SansSerif',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16
                }}
                onDayPress={day => {
                    // alert('day press: ' + dayjs(day.dateString).format('DD/MM/YYYY'));
                }}
                onMonthChange={date => {
                    // alert('month change: ' + dayjs(date.dateString).format('DD/MM/YYYY'));
                }}
            />

            {/* <ScrollView horizontal contentContainerClassName='w-full'>
                    <AgendaList
                        sections={[{
                            title: 'hola',
                            data: [{ hour: '12am', duration: '1h', title: 'Ashtanga Yoga' }]
                        }] as SectionListData<any>[]}
                        // dayFormat='DD/MM/YYYY'
                        // renderSectionHeader={(section) => <Text avoidTranslation text={section.section.data?.[0]?.hour || 'asdasd'} className='text-base-content' />}
                        dayFormatter={(day) => dayjs(day).format('DD/MM/YYYY')}
                        // sections={ITEMS}
                        renderItem={() => <View />}
                    // scrollToNextEvent
                    />

                </ScrollView> */}
        </CalendarProvider>
    );
}

interface EventsContainerProps {
    selectedDate: dayjs.Dayjs;
    events: Event[];
    isLoading: boolean;
    toggleEventCompletedLoading: boolean;
    handleToggleEventCompleted: (event_id: string, completed: boolean) => Promise<void>;
    handleSeeEvent: (event: Event) => void;
    handleEditEvent: (event: Event) => void;
    handleDeleteEvent: (event: Event) => void;
}
const EventsContainer = ({ selectedDate, events, isLoading, toggleEventCompletedLoading, handleToggleEventCompleted, handleSeeEvent, handleEditEvent, handleDeleteEvent }: EventsContainerProps) => {
    const todayFormatted = dayjs().format('YYYY-MM-DD');
    const selectedDateFormatted = selectedDate.format('YYYY-MM-DD');

    if (isLoading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Loader />
            </View>
        );
    }

    return (
        <>
            <View className='flex-1 px-4 py-4 border-t border-base-content/40'>
                <Text
                    text={selectedDateFormatted === todayFormatted ? 'events.today_events' : 'events.events_for_day'}
                    translateData={{ date: selectedDate.format('DD/MM/YYYY') }}
                    className='text-base-content text-2xl'
                />

                {!events?.length ? (
                    <View className='flex-1 items-center justify-center'>
                        <Text text={selectedDateFormatted === todayFormatted ? 'events.no_events_today' : 'events.no_items'} className='text-base-content text-2xl' />
                    </View>
                ) : (
                    <View className='h-full py-2'>
                        <AnimatedList
                            data={events}
                            getKey={(item) => item.id}
                            renderItem={(event) =>
                                <EventItem
                                    event={event}
                                    toggleEventCompleted={handleToggleEventCompleted}
                                    isLoading={toggleEventCompletedLoading}
                                    handleSeeEvent={handleSeeEvent}
                                    handleEditEvent={handleEditEvent}
                                    handleDeleteEvent={handleDeleteEvent}
                                />
                            }
                        />
                    </View>
                )}
            </View>

            {/* Bottom Modal to edit/create events */}
        </>
    );
}

interface EventItemProps {
    event: Event;
    isLoading: boolean;
    handleSeeEvent: (event: Event) => void;
    toggleEventCompleted: (event_id: string, completed: boolean) => Promise<void>;
    handleEditEvent: (event: Event) => void;
    handleDeleteEvent: (event: Event) => void;
}
const EventItem = ({ event, isLoading, handleSeeEvent, toggleEventCompleted, handleEditEvent, handleDeleteEvent }: EventItemProps) => {
    const { ref: swipeableRef, closeRightActions, reset } = useSwipeableControl();

    if (event.id === 'empty') {
        return (
            <View className='px-4 flex-row gap-4 h-0.5 bg-base-content/50 my-1' />
        );
    }

    return (
        <CustomSwipeable
            ref={swipeableRef}
            rightActions={
                <View className='flex-row'>
                    <TouchableOpacity
                        onPress={() => handleEditEvent(event)}
                        className='px-5 items-center justify-center bg-secondary rounded-l-xl'
                    >
                        <Pencil size={20} className='text-secondary-content' />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeleteEvent(event)}
                        className='px-5 items-center justify-center bg-error rounded-r-xl'
                    >
                        <Trash2 size={20} className='text-error-content' />
                    </TouchableOpacity>
                </View>
            }
            leftAction={
                <View className='flex flex-row flex-1 items-center'>
                    <TouchableOpacity
                        onPress={() => handleEditEvent(event)}
                        className={`h-full flex-1 items-center justify-center rounded-xl ${event.completed ? 'bg-warning' : 'bg-success'}`}
                    >
                        {isLoading
                            ? <Loader size={30} />
                            : event.completed
                                ? <Undo size={30} className='text-warning-content' />
                                : <Check size={35} className='text-success-content' />}

                    </TouchableOpacity>
                </View>
            }
            onSwipeLeftComplete={() => { toggleEventCompleted(event.id, !event.completed).then(() => { reset(); }) }}
        >
            <View className='px-4 py-2 flex-row gap-4 items-center border-0 bg-base-100 border-base-content rounded-xl'>
                <Checkbox
                    size={24}
                    onChange={(completed) => toggleEventCompleted(event.id, completed)}
                    checked={event.completed}
                    className='flex-row gap-4 py-4 items-center'
                />
                <TouchableOpacity className='flex-1 h-full justify-center' onPress={() => handleSeeEvent(event)}>
                    <Text text={event.title} numberOfLines={1} avoidTranslation className={`text-base-content text-xl ${event.completed ? 'line-through' : ''}`} />
                </TouchableOpacity>
            </View>
        </CustomSwipeable>
    );
}


interface SaveEventModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'see';
    event?: Event | null;
    selectedDate: dayjs.Dayjs;
    handleEditEvent: (event: Event) => void;
    handleDeleteEvent: (event: Event) => void;
    onClose: () => void;
    onSubmit: ({ date, time, title, description, isAllDay, reminders }: { date: dayjs.Dayjs, time: dayjs.Dayjs, title: string, description: string, isAllDay: boolean, reminders: EventReminder[] }) => void;
}
const SaveEventModal = ({ isOpen, mode, event, selectedDate, onClose, onSubmit, handleEditEvent, handleDeleteEvent }: SaveEventModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(selectedDate);
    const [time, setTime] = useState(selectedDate);
    const [isAllDay, setIsAllDay] = useState(true);
    const [reminders, setReminders] = useState<EventReminder[]>([]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showAddReminderModal, setShowAddReminderModal] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<EventReminder | null>(null);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setDate(dayjs(selectedDate));
        setShowDatePicker(false);
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setTime(dayjs(selectedDate));
        setShowTimePicker(false);
    };

    useEffect(() => {
        setTitle(event?.title || '');
        setDescription(event?.description || '');
        setDate(event?.date ? dayjs(event.date) : selectedDate);
        setIsAllDay(event?.is_all_day ?? true);
        setTime(event?.time ? dayjs(event.time) : dayjs());
        setReminders(event?.reminders || []);
    }, [event, selectedDate]);

    return (
        <>
            <BottomSheet
                isOpen={isOpen}
                onClose={onClose}
            >
                {mode !== 'see' &&
                    <Text
                        text={mode === 'create' ? 'events.add_event' : 'events.edit_event'}
                        className='text-base-content text-xl px'
                    />
                }
                {mode === 'see' &&
                    <View className='gap-4 pb-4'>
                        <View>
                            <Text
                                avoidTranslation
                                text={event?.title!}
                                className='text-base-content text-2xl'
                            />
                        </View>
                        <View className='flex-row items-center gap-2'>
                            <Clock className='text-base-content' />
                            <Text
                                avoidTranslation
                                text={dayjs(event?.date!).format('DD/MM/YYYY') + `${event?.is_all_day ? '' : ` - ${dayjs(event?.time!).format('HH:mm')}`}`}
                                className='text-base-content text-xl'
                            />
                        </View>
                        {event?.description &&
                            <View className='flex-row gap-2'>
                                <TextIcon className='text-base-content' />
                                <Text
                                    avoidTranslation
                                    text={event.description!}
                                    className='text-base-content text-xl'
                                />
                            </View>
                        }
                    </View>
                }
                <View className='gap-6'>
                    {/* Content */}
                    <View className='gap-4'>
                        {mode !== 'see' &&
                            <>
                                {/* Title */}
                                <Input
                                    label='events.save_event_title'
                                    value={title}
                                    onChangeText={(title) => setTitle(title)}
                                />
                                {/* Description */}
                                <Input
                                    label='events.save_event_description'
                                    value={description}
                                    onChangeText={(description) => setDescription(description)}
                                    numberOfLines={20}
                                    multiline
                                />

                                {/* Date */}
                                <Dropdown
                                    label='events.save_event_date'
                                    text={date.format('DD/MM/YYYY')}
                                    onPress={() => setShowDatePicker(true)}
                                />
                                {showDatePicker &&
                                    <RNDateTimePicker
                                        value={date.toDate()}
                                        mode='date'
                                        onChange={onChangeDate}
                                        is24Hour
                                        locale='es-ES'
                                        themeVariant='dark'
                                    />

                                }
                                {/* Is all day and time */}
                                <View className='flex-row gap-4 w-full justify-stretch'>
                                    <View className='gap-4 pt-1'>
                                        <Text text='events.save_event_is_all_day' className='text-base-content text-md px-1' />
                                        <Switch
                                            value={isAllDay}
                                            onPress={() => {
                                                setIsAllDay(!isAllDay);
                                                setReminders([]);
                                            }}
                                        />
                                    </View>
                                    <View className='flex-1'>
                                        <Dropdown
                                            label='events.save_event_time'
                                            text={time.format('HH:mm')}
                                            disabled={isAllDay}
                                            onPress={() => setShowTimePicker(true)}
                                        />
                                        {showTimePicker &&
                                            <RNDateTimePicker
                                                value={time.toDate()}
                                                mode='time'
                                                onChange={onChangeTime}
                                                is24Hour
                                                locale='es-ES'
                                                themeVariant='dark'
                                            />
                                        }
                                    </View>
                                </View>
                            </>
                        }

                        {/* Reminders */}
                        <View>
                            <TouchableOpacity
                                className='flex-row gap-2 items-center justify-between py-2'
                                onPress={() => { setShowAddReminderModal(true); setSelectedReminder(null) }}
                                disabled={mode === 'see'}
                            >
                                <View className='flex-row gap-3 items-center'>
                                    <Bell className='text-base-content' />
                                    <Text text={mode !== 'see' ? 'events.add_reminder' : 'events.reminders'} className='text-base-content text-lg' />
                                </View>
                                {mode !== 'see' && <Plus className='text-base-content' />}
                            </TouchableOpacity>

                            {!reminders.length &&
                                <Text text='events.no_reminders' className='text-base-content text-lg pt-1 pl-8' />
                            }
                            <ScrollView className='max-h-44 pl-8'>
                                {reminders.length > 0 && reminders.map((reminder, index) => (
                                    <Reminder
                                        key={reminder.offset_time + reminder.unit + index}
                                        mode={mode}
                                        reminder={reminder}
                                        reminders={reminders}
                                        isAllDay={isAllDay}
                                        setSelectedReminder={setSelectedReminder}
                                        setShowAddReminderModal={setShowAddReminderModal}
                                        setReminders={setReminders}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                    {/* Buttons */}
                    <View className='items-end justify-end flex-row gap-4'>
                        {mode !== 'see' &&
                            <Button
                                name={mode === 'create' ? 'create' : 'save'}
                                disabled={!title}
                                onPress={() => onSubmit({ date, time, title, description, isAllDay, reminders })}
                            />
                        }
                        {mode === 'see' &&
                            <>
                                <Button
                                    name='delete'
                                    type='error'
                                    onPress={() => handleDeleteEvent(event!)}
                                />
                                <Button
                                    name='edit'
                                    type='secondary'
                                    onPress={() => handleEditEvent(event!)}
                                />
                            </>
                        }
                    </View>
                </View>
            </BottomSheet>

            <SaveReminderModal
                isOpen={showAddReminderModal}
                mode={selectedReminder ? 'edit' : 'create'}
                isAllDay={isAllDay}
                onClose={() => setShowAddReminderModal(false)}
                onSubmit={(offset_time, unit, specific_time) => {
                    const areDuplicatedReminders = reminders.some((reminder) => reminder.offset_time === offset_time && reminder.unit === unit && reminder.specific_time === specific_time);
                    if (areDuplicatedReminders) {
                        toast.warning({
                            title: 'events.reminders_duplicated'
                        })
                        return;
                    }

                    if (!selectedReminder) {
                        setReminders([...reminders, { index: reminders.length, offset_time, unit, specific_time }]);
                    } else {
                        setReminders(reminders.map((reminder) => reminder.index === selectedReminder?.index ? { ...reminder, offset_time, unit, specific_time } : reminder));
                    }
                    setShowAddReminderModal(false);
                    setSelectedReminder(null);
                }}
                selectedReminder={selectedReminder}
            />
        </>
    );
}

interface ReminderProps {
    reminder: EventReminder,
    reminders: EventReminder[],
    mode: 'create' | 'edit' | 'see',
    isAllDay: boolean,
    setSelectedReminder: (reminder: EventReminder) => void,
    setShowAddReminderModal: (show: boolean) => void,
    setReminders: (reminders: EventReminder[]) => void
}
const Reminder = ({ reminder, reminders, mode, isAllDay, setSelectedReminder, setShowAddReminderModal, setReminders }: ReminderProps) => {
    const { ref, closeRightActions, reset } = useSwipeableControl();

    const time = reminder.specific_time ? dayjs(reminder.specific_time).format('HH:mm') : '';

    const Content = () => (
        <TouchableOpacity
            className='flex-row justify-between items-center w-full pl-2 py-3 bg-base-100 rounded-xl'
            onPress={() => { setShowAddReminderModal(true); setSelectedReminder(reminder); }}
        >
            {reminder.unit === EventReminderUnits.same_day && (
                <Text
                    text='events.reminders_time.is_all_day.same_day'
                    translateData={{ time }}
                    className='text-base-content text-lg'
                />
            )}
            {reminder.unit !== EventReminderUnits.same_day && (
                <Text
                    text={`events.reminders_time.${isAllDay ? 'is_all_day' : 'is_not_all_day'}.before_${reminder.unit}_${reminder.offset_time.length === 1 ? 'one' : 'other'}`}
                    translateData={{
                        count: reminder.offset_time ?? '0',
                        time
                    }}
                    className='text-base-content text-lg'
                />
            )}
        </TouchableOpacity>
    );

    if (mode === 'see') {
        return <Content />
    }

    return (
        <CustomSwipeable
            ref={ref}
            rightActions={
                <View className='flex flex-row items-center pl-4'>
                    <TouchableOpacity
                        onPress={() => { setSelectedReminder(reminder); setShowAddReminderModal(true); closeRightActions(); }}
                        className='h-full rounded-l-xl bg-secondary flex items-center justify-center p-4 px-6'
                    >
                        <Pencil className='text-secondary-content' size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setReminders(reminders.filter((_reminder) => _reminder.index !== reminder.index)); reset(); }}
                        className='h-full rounded-r-xl bg-error flex items-center justify-center p-4 px-6'
                    >
                        <Trash2 className='text-error-content' size={18} />
                    </TouchableOpacity>
                </View>
            }
        >
            <Content />
        </CustomSwipeable>
    );
}




const noAllDayReminderOptions = [
    EventReminderUnits.minutes,
    EventReminderUnits.hours,
    EventReminderUnits.days,
    EventReminderUnits.weeks
];

const allDayReminderOptions = [
    EventReminderUnits.same_day,
    EventReminderUnits.days,
    EventReminderUnits.weeks
];

interface AddReminderModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    isAllDay: boolean;
    onClose: () => void;
    onSubmit: (offset_time: string, unit: EventReminderUnits, reminderAt?: dayjs.Dayjs) => void;
    selectedReminder: EventReminder | null;
}
const SaveReminderModal = ({ isOpen, mode, isAllDay, onClose, onSubmit, selectedReminder }: AddReminderModalProps) => {
    const [reminderTime, setReminderTime] = useState(selectedReminder?.offset_time ?? (isAllDay ? '1' : '15'));
    const [reminderAt, setReminderAt] = useState(isAllDay && selectedReminder?.specific_time ? dayjs(selectedReminder.specific_time) : undefined);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const reminderOptions = isAllDay ? allDayReminderOptions : noAllDayReminderOptions;
    const [reminderUnit, setReminderUnit] = useState(selectedReminder?.unit ?? reminderOptions[0]);

    useEffect(() => {
        setReminderTime(selectedReminder?.offset_time ?? (isAllDay ? '1' : '15'));
        setReminderAt(isAllDay && selectedReminder?.specific_time ? dayjs(selectedReminder.specific_time) : undefined);
        setShowTimePicker(false);
        setReminderUnit(selectedReminder?.unit ?? reminderOptions[0]);
    }, [selectedReminder, isAllDay]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            <View className='gap-2 px-2'>
                <Text text={mode === 'create' ? 'events.add_reminder' : 'events.edit_reminder'} className='text-base-content text-xl' />
                <View className='gap-6'>
                    <View className='flex flex-row gap-4'>
                        <View className={`${isAllDay ? 'w-1/4' : 'w-full'}`}>
                            <Input
                                label='events.reminders_time.time'
                                value={reminderTime}
                                keyboardType='number-pad'
                                onChangeText={(text) => setReminderTime(text)}
                            />
                        </View>

                        {isAllDay &&
                            <View className='w-2/3'>
                                <Dropdown
                                    text={reminderAt?.format('HH:mm') || ''}
                                    onPress={() => setShowTimePicker(true)}
                                />
                                {showTimePicker &&
                                    <RNDateTimePicker
                                        value={reminderAt?.toDate() || new Date()}
                                        mode='time'
                                        onChange={(event, date) => {
                                            if (date) {
                                                setReminderAt(dayjs(date));
                                                setShowTimePicker(false);
                                            }
                                        }}
                                        is24Hour
                                        locale='es-ES'
                                        themeVariant='dark'
                                    />
                                }
                            </View>
                        }
                    </View>
                    {reminderOptions.map((option) => (
                        <Checkbox
                            key={option}
                            checked={reminderUnit === option}
                            readonly={reminderUnit === option}
                            onChange={() => setReminderUnit(option)}
                        >
                            {option === EventReminderUnits.same_day && (
                                <Text
                                    text='events.reminders_time.is_all_day.same_day'
                                    translateData={{ time: reminderAt?.format('HH:mm') ?? '' }}
                                    className='text-base-content text-lg'
                                />
                            )}
                            {option !== EventReminderUnits.same_day && (
                                <Text
                                    text={`events.reminders_time.${isAllDay ? 'is_all_day' : 'is_not_all_day'}.before_${option}_${reminderTime.length === 1 ? 'one' : 'other'}`}
                                    translateData={{
                                        count: reminderTime ?? '0',
                                        time: reminderAt?.format('HH:mm') ?? ''
                                    }}
                                    className='text-base-content text-lg'
                                />
                            )}
                        </Checkbox>
                    ))}
                </View>

                <View className='items-end mt-6'>
                    <Button
                        name={mode === 'create' ? 'create' : 'save'}
                        onPress={() => onSubmit(reminderTime, reminderUnit, reminderAt)}
                    />
                </View>
            </View>
        </BottomSheet>
    );
}
