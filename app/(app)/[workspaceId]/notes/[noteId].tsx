import BlockNoteEditor from '@/components/BlockNoteEditor';
import Loader from '@/components/loader';
import PageLayout from '@/components/PageLayout';
import CloudCheck from '@/components/svgs/CloudCheck';
import Refresh from '@/components/svgs/Refresh';
import { useLazyApi } from '@/hooks/use-api';
import { useUserStore } from '@/store';
import { parseNote } from '@/utils/notes';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';

const NoteScreen = () => {
    const { noteId, workspaceId } = useLocalSearchParams();
    const { data: noteData, loading, request: getNote } = useLazyApi<any>(`notes/${noteId}`, 'GET', null, parseNote);
    const { loading: isSavingNote, request: saveNote } = useLazyApi<any>(`notes/:id`, 'POST');

    const workspace = useUserStore((state) => state.data?.workspaces?.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    // useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useEffect(() => {
        getNote();
    }, [getNote]);


    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => { }} className='p-4'>
                    {isSavingNote
                        ? <View className='animate-spin'><Refresh className='stroke-base-content' /></View>
                        : <CloudCheck className='text-base-content/40' />}
                </TouchableOpacity>
            )
        });
    }, [isSavingNote]);

    useEffect(() => {
        const hideHeader = (loading && !noteData) || !noteData;
        navigation.setOptions({ title: noteData?.title, headerShown: !hideHeader, headerTintColor: workspace?.color });
    }, [navigation, noteData, workspace]);

    const saveNoteContent = async (content: string) => {
        const data = {
            id: Number(noteId),
            content
        }
        try {
            await saveNote(`notes/${noteId}`, data);
            // toast.success({
            //     title: 'Note saved',
            // })
        } catch (error) {
            console.error(error);
        }
    }

    if ((loading && !noteData) || !noteData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <PageLayout breadcrumbData={noteData?.breadcrumb} className='flex-1'>
                <View className='flex-1 w-full h-full'>
                    <BlockNoteEditor
                        onChange={saveNoteContent}
                        initialValue={noteData?.content ? JSON.parse(noteData?.content) : undefined}
                    />
                </View>
            </PageLayout>
        </>
    );
};

export default NoteScreen;
