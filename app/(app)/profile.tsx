import BottomSheet from '@/components/BottomSheet';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown/Dropdown';
import DropDownModal from '@/components/dropdown/DropdownModal';
import { Input } from '@/components/input';
import PageLayout from '@/components/PageLayout';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { toast } from '@/services/toast';
import { useUserStore } from '@/store';
import { Languages, Pencil, RectangleEllipsis, UserPen } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from 'react-native';

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

    const handleUpdatePassword = async (password: string) => {
        await toast.promise(
            updatePassword('users/update-password', { password }),
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

                <Text
                    text='profile.user_data'
                    className='text-2xl font-bold text-base-content'
                />
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

                <View className='h-0.5 mt-4 bg-neutral-content/40' />

                <Text
                    text='profile.security'
                    className='text-2xl font-bold text-base-content'
                />
                {/* TODO: Change email and change name */}
                {/* <Dropdown
                    prefixLabelIcon={<Mail size={25} className='text-base-content' />}
                    label='profile.change_email'
                    text={data?.email || ''}
                    onPress={() => setIsChangeEmailModalOpen(true)}
                /> */}
                <Dropdown
                    prefixLabelIcon={<RectangleEllipsis size={25} className='text-base-content' />}
                    suffixLabelIcon={<Pencil size={20} className='text-base-content' />}
                    label='profile.change_password'
                    text='**********'
                    avoidTranslationText
                    onPress={() => setIsChangePasswordModalOpen(true)}
                />
            </PageLayout>


            {/* Change Email Modal */}
            {/* <BottomSheet
                isOpen={isChangeEmailModalOpen}
                onClose={() => setIsChangeEmailModalOpen(false)}
                sheetHeight={250}
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
            sheetHeight={250}
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
    onSubmit: (password: string) => void;
}) => {
    const [password, setPassword] = useState('');

    const handleUpdatePassword = async () => {
        onSubmit(password);
        setPassword('');
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            sheetHeight={250}
        >
            <View>
                <Text
                    text='profile.change_password'
                    className='text-2xl font-bold text-base-content'
                />
                <Input
                    label='profile.new_password'
                    keyboardType='visible-password'
                    value={password || ''}
                    onChangeText={(text) => setPassword(text)}
                    autoCapitalize="none"
                    secureTextEntry
                    textContentType='password'
                    onSubmitEditing={handleUpdatePassword}
                    returnKeyType='done'
                />
                <Button
                    name='update'
                    onPress={handleUpdatePassword}
                />
            </View>
        </BottomSheet>
    );
};
