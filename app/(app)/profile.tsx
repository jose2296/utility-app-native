import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import DropDownModal from '@/components/dropdown/DropdownModal';
import { Input } from '@/components/input';
import PageLayout from '@/components/PageLayout';
import Eye from '@/components/svgs/Eye';
import EyeOff from '@/components/svgs/EyeOff';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { DaysOfWeek } from '@/models/me';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import dayjs from 'dayjs';
import { Bell, Languages, Pencil, RectangleEllipsis, ShieldUser, UserPen, UserRound } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false);
    const { data, updateProfile, setData } = useUserStore();
    const [email, setEmail] = useState(data?.email);
    const { request: updateUser } = useLazyApi('users/update-user', 'POST');
    const { request: updatePassword } = useLazyApi('users/update-password', 'POST');
    const { request: getMeData, loading: loadingMeData, data: meData } = useLazyApi('me');
    const { i18n } = useTranslation()

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

                <View className='h-0.5 mt-4 bg-neutral-content/40' />

                {/* Notifications */}
                <View className='gap-2'>
                    <View className='flex-row gap-2 items-center'>
                        <Bell size={25} className='text-base-content' />
                        <Text
                            text='profile.notifications'
                            className='text-2xl font-bold text-base-content'
                        />
                    </View>

                    <View className='pl-8 gap-2'>
                        {data?.userNotifications?.map(((notification, index) => (
                            <View key={`notification-${index}`} className='flex-row gap-4 items-center'>
                                <Text avoidTranslation text={notification.time} className='text-base-content text-lg font-bold' />

                                <View className='flex-row gap-2'>
                                    {Object.keys(DaysOfWeek).map((day, index) => (
                                        <View className={`flex-row items-center justify-center bg-neutral rounded-full size-10 ${notification.days.includes(day as DaysOfWeek) ? 'bg-primary' : ''}`} key={`day-${index}`}>
                                            <Text
                                                text={`days.initial.${day.toLocaleLowerCase()}`}
                                                className='text-base-content'
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )))}
                    </View>
                </View>

                <View className='h-0.5 mt-4 bg-neutral-content/40' />

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
        </>
    );
}


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
