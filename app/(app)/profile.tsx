import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import DropDownModal from '@/components/dropdown/DropdownModal';
import InformationModal from '@/components/InformationModal';
import { Input } from '@/components/input';
import PageLayout from '@/components/PageLayout';
import Eye from '@/components/svgs/Eye';
import EyeOff from '@/components/svgs/EyeOff';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { DaysOfWeek, UserNotification } from '@/models/me';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Bell, Languages, Pencil, Plus, RectangleEllipsis, ShieldUser, Trash2, UserPen, UserRound } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false);
    const { data, updateProfile, setData } = useUserStore();
    const [email, setEmail] = useState(data?.email);
    const { request: updateUser, loading: updatingUser } = useLazyApi('users/update-user', 'POST');
    const { request: updatePassword } = useLazyApi('users/update-password', 'POST');
    const { request: getMeData, loading: loadingMeData, data: meData } = useLazyApi('me');
    const { i18n } = useTranslation()
    const [isSaveNotificationsModalOpen, setIsSaveNotificationsModalOpen] = useState(false);
    const [notificationSelected, setNotificationSelected] = useState<UserNotification | null>(null);
    const [isDeleteNotificationModalOpen, setIsDeleteNotificationModalOpen] = useState(false);

    useEffect(() => {
        if (meData) {
            setData(meData);
        }
    }, [meData]);

    const handleSaveLanguage = async (language: string) => {
        await toast.promise(
            updateUser('users/update-user', { language }),
            {
                loading: {
                    title: 'profile.loading',
                },
                success: {
                    title: 'profile.language_changed_successfully',
                },
                error: {
                    title: 'profile.error',
                }
            }
        );

        updateProfile({
            language
        });
        i18n.changeLanguage(language);
        dayjs.locale(language);
    };

    const handleUpdateEmail = async () => {
        await toast.promise(
            updateUser('users/update-user', { email }),
            {
                loading: {
                    title: 'loading',
                },
                success: {
                    title: 'profile.email_changed_successfully',
                },
                error: {
                    title: 'error',
                }
            }
        );

        setIsChangeEmailModalOpen(false);
    };

    const handleUpdatePassword = async ({ current_password, new_password }: { current_password: string; new_password: string }) => {
        await toast.promise(
            updatePassword('users/update-password', { current_password, new_password }),
            {
                loading: {
                    title: 'loading',
                },
                success: {
                    title: 'profile.password_changed_successfully',
                },
                error: {
                    title: 'error',
                }
            }
        );
        setIsChangePasswordModalOpen(false);
    };

    const handleUpdateName = async (name: string) => {
        await toast.promise(
            updateUser('users/update-user', { name }),
            {
                loading: {
                    title: 'loading',
                },
                success: {
                    title: 'profile.name_changed_successfully',
                },
                error: {
                    title: 'error',
                }
            }
        );

        updateProfile({
            name
        });
        setIsChangeNameModalOpen(false);
    };

    const handleSaveNotifications = async ({ time, days }: { time: dayjs.Dayjs; days: DaysOfWeek[] }) => {
        let _userNotifications = data?.userNotifications || [];

        if (notificationSelected) {
            _userNotifications = _userNotifications.map((notification: UserNotification) => {
                if (notification.id === notificationSelected.id) {
                    return {
                        time: time.toDate(),
                        days
                    }
                }

                return {
                    time: notification.time,
                    days: notification.days
                };
            }) || [];
        } else {
            _userNotifications.push({
                time: time.toDate(),
                days
            });
        }

        const userNotifications = _userNotifications.map((notification: UserNotification) => ({
            time: notification.time,
            days: notification.days
        }))
        await toast.promise(
            updateUser('users/update-user', { userNotifications }),
            {
                loading: {
                    title: 'loading',
                },
                success: {
                    title: notificationSelected ? 'profile.notification_saved_successfully' : 'profile.notification_created_successfully',
                },
                error: {
                    title: 'error',
                }
            }
        );
        setNotificationSelected(null);
        setIsSaveNotificationsModalOpen(false);
        getMeData();
    };

    const handleDeleteNotification = async () => {
        const userNotifications = data?.userNotifications
            ?.filter((notification) => notification.id !== notificationSelected?.id)
            ?.map((notification) => ({
                time: notification.time,
                days: notification.days
            })) || [];

        await toast.promise(
            updateUser('users/update-user', { userNotifications }),
            {
                loading: {
                    title: 'loading',
                },
                success: {
                    title: 'profile.notification_deleted_successfully',
                },
                error: {
                    title: 'error',
                }
            }
        );
        setIsDeleteNotificationModalOpen(false);
        setNotificationSelected(null);
        getMeData();
    };

    return (
        <>
            <PageLayout
                onRefresh={getMeData}
                breadcrumbData={[
                    {
                        name: 'profile.title',
                        href: '/profile',
                    },
                ]}>

                {/* User Data */}
                <View className='gap-2'>
                    <View className='flex-row gap-2 items-center'>
                        <UserRound size={25} className='text-base-content' />
                        <Text
                            text='profile.user_data'
                            className='text-2xl font-bold text-base-content'
                        />
                    </View>
                    <View className='pl-8'>
                        <Dropdown
                            prefixLabelIcon={<UserPen size={25} className='text-base-content' />}
                            suffixLabelIcon={<Pencil size={20} className='text-base-content' />}
                            label='profile.change_name'
                            text={data?.name || ''}
                            onPress={() => setIsChangeNameModalOpen(true)}
                        />
                        <Dropdown
                            prefixLabelIcon={<Languages size={25} className='text-base-content' />}
                            label='profile.change_language'
                            text={`languages.${data?.language}`}
                            onPress={() => setIsLanguageModalOpen(true)}
                        />
                    </View>
                </View>

                <View className='h-0.5 mt-6 mb-4 bg-neutral-content/40' />

                {/* Notifications */}
                <View className='gap-4'>
                    <TouchableOpacity
                        className='flex-row gap-2 items-center justify-between'
                        onPress={() => {
                            setIsSaveNotificationsModalOpen(true);
                            setNotificationSelected(null)
                        }}
                    >
                        <View className='flex-row gap-2 items-center'>
                            <Bell size={25} className='text-base-content' />
                            <Text
                                text='profile.notifications'
                                className='text-2xl font-bold text-base-content'
                            />

                        </View>
                        <Plus size={25} className='text-base-content' />

                    </TouchableOpacity>

                    <View className='pl-8 pr-2 gap-4'>
                        {data?.userNotifications?.map(((notification, index) => (
                            <TouchableOpacity
                                key={`notification-${index}`}
                                className='flex-row gap-4 items-center justify-between'
                                onPress={() => {
                                    setIsSaveNotificationsModalOpen(true);
                                    setNotificationSelected(notification);
                                }}
                            >
                                <Text avoidTranslation text={dayjs(notification.time).format('HH:mm')} className='text-base-content text-lg font-bold' />

                                <View className='flex-row gap-2'>
                                    {Object.keys(DaysOfWeek).map((day, index) => (
                                        <View className={`flex-row items-center justify-center bg-neutral rounded-full size-8 ${notification.days.includes(day as DaysOfWeek) ? 'bg-primary' : ''}`} key={`day-${index}`}>
                                            <Text
                                                text={`days.initial.${day.toLocaleLowerCase()}`}
                                                className='text-base-content text-sm'
                                            />
                                        </View>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsSaveNotificationsModalOpen(true);
                                        setNotificationSelected(notification);
                                    }}
                                    className='flex-row gap-2 items-center'
                                    hitSlop={10}
                                >
                                    <Pencil size={20} className='text-base-content' />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setNotificationSelected(notification);
                                        setIsDeleteNotificationModalOpen(true);
                                    }}
                                    className='flex-row gap-2 items-center'
                                    hitSlop={10}
                                >
                                    <Trash2 size={20} className='text-error size-20' />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )))}

                        {!data?.userNotifications?.length && (
                            <Text
                                text='profile.no_notifications'
                                className='text-base-content text-center'
                            />
                        )}
                    </View>
                </View>

                <View className='h-0.5 mt-6 mb-4 bg-neutral-content/40' />

                {/* Security */}
                <View className='gap-2'>
                    <View className='flex-row gap-2 items-center'>
                        <ShieldUser size={25} className='text-base-content' />
                        <Text
                            text='profile.security'
                            className='text-2xl font-bold text-base-content'
                        />
                    </View>
                    {/* TODO: Change email and change name */}
                    {/* <Dropdown
                        prefixLabelIcon={<Mail size={25} className='text-base-content' />}
                        label='profile.change_email'
                        text={data?.email || ''}
                        onPress={() => setIsChangeEmailModalOpen(true)}
                    /> */}
                    <View className='pl-8'>
                        <Dropdown
                            prefixLabelIcon={<RectangleEllipsis size={25} className='text-base-content' />}
                            suffixLabelIcon={<Pencil size={20} className='text-base-content' />}
                            label='profile.change_password'
                            text='**********'
                            avoidTranslationText
                            onPress={() => setIsChangePasswordModalOpen(true)}
                        />
                    </View>
                </View>
            </PageLayout>


            {/* Change Email Modal */}
            {/* <BottomSheet
                isOpen={isChangeEmailModalOpen}
                onClose={() => setIsChangeEmailModalOpen(false)}
            >
                <View>
                    <Input
                        label='profile.email'
                        value={email || ''}
                        onChangeText={(text) => setEmail(text)}
                    />
                    <Button
                        name='update'
                        onPress={handleUpdateEmail}
                    />
                </View>
            </BottomSheet> */}

            {/* Change Name Modal */}
            <ChangeNameModal
                isOpen={isChangeNameModalOpen}
                name={data?.name || ''}
                onClose={() => setIsChangeNameModalOpen(false)}
                onSubmit={handleUpdateName}
            />

            {/* Update Password Modal */}
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSubmit={handleUpdatePassword}
            />

            {/* Update Language Modal */}
            <DropDownModal
                text='profile.select_language'
                options={[
                    { key: 'languages.en', value: 'en' },
                    { key: 'languages.es', value: 'es' },
                ]}
                value={data?.language || 'en'}
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
                onPress={(language) => handleSaveLanguage(language.value)}
            />

            {/* Save Notifications Modal */}
            <SaveNotificationsModal
                isOpen={isSaveNotificationsModalOpen}
                notification={notificationSelected}
                onClose={() => {
                    setIsSaveNotificationsModalOpen(false);
                    setNotificationSelected(null);
                }}
                mode={notificationSelected ? 'edit' : 'create'}
                onSubmit={data => handleSaveNotifications(data)}
            />

            {/* Delete Notification Modal */}
            <InformationModal
                isLoading={updatingUser}
                isOpen={isDeleteNotificationModalOpen}
                title='profile.delete_notification'
                message='profile.delete_notification_message'
                messageTranslateData={{
                    time: dayjs(notificationSelected?.time).format('HH:mm') || ''
                }}
                onClose={() => {
                    setIsDeleteNotificationModalOpen(false);
                    setNotificationSelected(null);
                }}
                onSubmit={() => handleDeleteNotification()}
            />
        </>
    );
}

interface SaveNotificationsModalProps {
    isOpen: boolean;
    notification?: UserNotification | null;
    mode: 'create' | 'edit';
    onClose: () => void;
    onSubmit: ({ time, days }: { time: dayjs.Dayjs; days: DaysOfWeek[] }) => void;
}
const SaveNotificationsModal = ({ isOpen, notification, mode, onClose, onSubmit }: SaveNotificationsModalProps) => {
    const [time, setTime] = useState(dayjs());
    const [days, setDays] = useState<DaysOfWeek[]>([]);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (notification) {
            const [hours, minutes] = dayjs(notification.time).format('HH:mm').split(':')
            setTime(dayjs().set('hours', parseInt(hours)).set('minutes', parseInt(minutes)));
        } else {
            setTime(dayjs());
        }
        setDays(notification?.days || []);
    }, [notification]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            <View className='gap-4 justify-end'>
                <View className='gap-4'>
                    <Text
                        text={mode === 'create' ? 'profile.create_notification' : 'profile.edit_notification'}
                        className='text-2xl font-bold text-base-content'
                    />

                    <View>
                        <Dropdown
                            text={time.format('HH:mm') || ''}
                            onPress={() => setShowTimePicker(true)}
                        />
                        {showTimePicker &&
                            <RNDateTimePicker
                                value={time.toDate()}
                                mode='time'
                                onChange={(event, date) => {
                                    if (date) {
                                        setTime(dayjs(date));
                                        setShowTimePicker(false);
                                    }
                                }}
                                is24Hour
                                locale='es-ES'
                                themeVariant='dark'
                            />
                        }
                    </View>

                    <View className='flex-row gap-2 pb-4'>
                        {Object.keys(DaysOfWeek).map((day, index) => (
                            <TouchableOpacity
                                key={`day-${index}`}
                                onPress={() => {
                                    if (days.includes(day as DaysOfWeek)) {
                                        setDays(days.filter((d) => d !== day));
                                    } else {
                                        setDays([...days, day as DaysOfWeek]);
                                    }
                                }}
                                hitSlop={15}
                                className={`flex-row items-center justify-center bg-neutral rounded-full flex-1 p-4 ${days.includes(day as DaysOfWeek) ? 'bg-primary' : ''}`}
                            >
                                <Text
                                    text={`days.initial.${day.toLocaleLowerCase()}`}
                                    className='text-base-content text-sm'
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className='flex-row justify-end gap-2'>
                    <Button
                        name={mode === 'create' ? 'create' : 'update'}
                        onPress={() => onSubmit({ time, days })}
                    />
                </View>

            </View>
        </BottomSheet>
    );
};


const ChangeNameModal = ({
    isOpen,
    name,
    onClose,
    onSubmit
}: {
    isOpen: boolean;
    name: string;
    onClose: () => void;
    onSubmit: (name: string) => void;
}) => {
    const [_name, setName] = useState(name);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            <View>
                <Text
                    text='profile.change_name'
                    className='text-2xl font-bold text-base-content'
                />
                <Input
                    label='profile.name'
                    value={_name || ''}
                    onChangeText={(text) => setName(text)}
                    onSubmitEditing={() => onSubmit(_name)}
                    returnKeyType='done'
                />
                <Button
                    name='update'
                    onPress={() => onSubmit(_name)}
                />
            </View>
        </BottomSheet>
    );
};

const ChangePasswordModal = ({
    isOpen,
    onClose,
    onSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: ({ current_password, new_password }: { current_password: string; new_password: string }) => void;
}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || currentPassword.length < 6 || newPassword.length < 6) {
            toast.error({
                title: 'validations.min_length',
                translateData: {
                    count: 6 as any
                }
            })
            return;
        }
        onSubmit({ current_password: currentPassword, new_password: newPassword });
        setNewPassword('');
        setCurrentPassword('');
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            <View className='gap-4'>
                <Text
                    text='profile.change_password'
                    className='text-2xl font-bold text-base-content'
                />
                <View>
                    <Input
                        label='profile.current_password'
                        keyboardType='visible-password'
                        value={currentPassword || ''}
                        onChangeText={(text) => setCurrentPassword(text)}
                        autoCapitalize="none"
                        secureTextEntry={!isCurrentPasswordVisible}
                        textContentType='password'
                        returnKeyType='done'
                        suffixIcon={
                            <TouchableOpacity hitSlop={15} onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}>
                                {isCurrentPasswordVisible ? <Eye className='text-base-content' /> : <EyeOff className='text-base-content' />}
                            </TouchableOpacity>
                        }
                    />
                    <Input
                        label='profile.new_password'
                        keyboardType='visible-password'
                        value={newPassword || ''}
                        onChangeText={(text) => setNewPassword(text)}
                        autoCapitalize="none"
                        secureTextEntry={!isNewPasswordVisible}
                        textContentType='password'
                        onSubmitEditing={handleUpdatePassword}
                        returnKeyType='done'
                        suffixIcon={
                            <TouchableOpacity hitSlop={15} onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
                                {isNewPasswordVisible ? <Eye className='text-base-content' /> : <EyeOff className='text-base-content' />}
                            </TouchableOpacity>
                        }
                    />
                </View>
                <Button
                    name='update'
                    onPress={handleUpdatePassword}
                />
            </View>
        </BottomSheet>
    );
};
