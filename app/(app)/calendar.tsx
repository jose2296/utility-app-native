import Text from '@/components/Text';
import { hexToRgba } from '@/services/utils';
import { useUserStore } from '@/store';
import { CalendarBody, CalendarContainer, CalendarHeader, DeepPartial, ThemeConfigs } from '@howljs/calendar-kit';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { View } from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';


export default function CalendarScreen() {
    const { colors } = useUserStore();
    const customTheme: DeepPartial<ThemeConfigs> = {
        // Your custom theme properties here
        colors: {
            primary: colors?.primary,
            onPrimary: colors?.['primary-content'],
            background: colors?.['base-100'],
            onBackground: colors?.['base-content'],
            border: hexToRgba(colors?.['base-content-hex']!, 0.4),
            text: colors?.['base-content'],
            surface: colors?.primary,
            onSurface: colors?.['primary-content'],
        },
        hourBorderColor: colors?.['base-content'],
        headerBorderColor: colors?.['base-content'],
        dayBarBorderColor: colors?.['base-content'],
        singleDayBorderColor: colors?.['base-content'],
    };
    const renderItem = useCallback(({ item }: any) => {
        console.log(item);

        return <View>
            <Text avoidTranslation className='text-base-content' text={item.title} />
        </View>;
    }, []);

    return (
        <>
            <CalendarProvider
                date={dayjs().format('YYYY-MM-DD')}
                showTodayButton
            >
                <ExpandableCalendar
                    onDayPress={day => {
                        console.log('selected day', day);
                    }}
                />

                {/* <AgendaList
                sections={[{
                    title: 'hola',
                    data: [{ hour: '12am', duration: '1h', title: 'Ashtanga Yoga' }]
                }] as SectionListData<any>[]}
                dayFormat='DD/MM/YYYY'
                dayFormatter={(day) => dayjs(day).format('YYYY-MM-DD')}
            // sections={ITEMS}
            renderItem={renderItem}
            // scrollToNextEvent
            /> */}
            </CalendarProvider>
        </>
    );

    return (
        <View className='flex-1'>
            <CalendarContainer
                locale='es-ES'
                theme={customTheme}
                numberOfDays={7}
                useAllDayEvent={true}
                onPressEvent={(event) => {
                    console.log('Event pressed:', event);
                }}
                scrollByDay={true}
                events={[
                    {
                        id: '1',
                        title: 'Hacer la compra asd asd as da das das das d a',
                        start: { dateTime: '2025-09-26T10:00:00' },
                        end: { dateTime: '2025-09-26T11:00:00' },
                        color: '#4285F4',
                        recurrenceRule: 'RRULE:FREQ=DAILY;COUNT=10'
                    },
                    {
                        id: '2',
                        localId: '2',
                        title: 'Poner la lavadora asda das da da sd asd as das da ads d as asdasdasd asd as das dsa asd',
                        start: { date: '2025-09-26' },
                        end: { date: '2025-09-26' },
                        color: '#FBBC05',
                    },
                    {
                        id: '4',
                        title: 'Company Holiday',
                        start: { date: '2025-09-26' },
                        end: { date: '2025-09-26' },
                        color: '#FBBC05',
                    },
                    {
                        id: '3',
                        title: 'Company Holiday',
                        start: { date: '2025-09-26' },
                        end: { date: '2025-09-26' },
                        color: '#FBBC05',
                    },
                    {
                        id: '5',
                        title: 'Company Holiday',
                        start: { date: '2025-09-26' },
                        end: { date: '2025-09-26' },
                        color: '#FBBC05',
                    }
                ]}
            >
                <CalendarHeader
                //  LeftAreaComponent={
                //     <View className=' bg-red-50 border-2 border-red-500'>
                //         <Text avoidTranslation text='Left' className='text-primary' />
                //     </View>
                // }
                // renderExpandIcon={(icon) => (
                //     <View className='flex-1 bg-red-50 border-2 border-red-500'>
                //         <Text avoidTranslation text='Left' className='text-primary' />
                //     </View>
                // )}
                // renderHeaderItem={(header) => (
                //     <View className='flex-1 bg-red-50 border-2 border-red-500'>
                //         <Text avoidTranslation text={header.index.toString()} className='text-primary' />
                //     </View>
                // )}
                // renderDayItem={(day) => (
                //     <View>
                //         <Text avoidTranslation text={day.dateUnix.toString()} className='text-primary' />
                //     </View>
                // )}
                />
                <CalendarBody
                    renderEvent={(event) => (
                        <View className='flex-1' style={{ backgroundColor: event.color }}>
                            <Text avoidTranslation text={event.title!} className='text-xs' />
                        </View>
                    )}
                />
            </CalendarContainer>
        </View>
    );
};
