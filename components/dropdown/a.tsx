import Dropdown from '@/components/dropdown/Dropdown';
import DropDownModal from '@/components/dropdown/DropdownModal';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { Folder, FolderDetailsData } from '@/models/folder';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Button from '../button';
import Loader from '../loader';

export interface Selection {
    workspace: FolderDetailsData | Folder;
    level: number;
    isLoading?: boolean;
}

interface WorkspaceSelectorProps {
    workspaces: FolderDetailsData[];
    title: string;
    onSelectOption: (option: Selection[]) => void;
    handleCollaborateList: () => void;
}

const WorkspaceSelector = ({ workspaces = [], title, onSelectOption, handleCollaborateList }: WorkspaceSelectorProps) => {
    const [selections, setSelections] = useState<Selection[]>([]);
    const [openModalLevel, setOpenModalLevel] = useState<number | null>(null);
    const { request: getFolderData } = useLazyApi(`folders/:id`, 'GET');
    const router = useRouter();

    // Obtener las opciones para un nivel específico
    const getOptionsForLevel = (level: number): Array<Folder | FolderDetailsData> => {
        if (level === 0) {
            return workspaces;
        }

        const previousSelection = selections[level - 1];
        if (!previousSelection) return [];

        return previousSelection.workspace.children || [];
    };

    // Manejar la selección de un workspace
    const handleSelect = async (workspace: FolderDetailsData | Folder, level: number) => {
        // Eliminar todas las selecciones posteriores a este nivel
        const newSelections = selections.slice(0, level);

        // Agregar la nueva selección con estado de carga
        newSelections.push({ workspace, level, isLoading: true });
        setSelections(newSelections);

        try {
            // Hacer la petición para obtener los datos actualizados del workspace
            const updatedWorkspace = await getFolderData(`folders/${workspace.id.toString()}`);

            // Actualizar la selección con los datos obtenidos
            const finalSelections = [...newSelections];
            finalSelections[level] = {
                workspace: updatedWorkspace,
                level,
                isLoading: false
            };

            setSelections(finalSelections);
            onSelectOption?.(finalSelections);
        } catch (error) {
            console.error('Error fetching workspace children:', error);

            // En caso de error, mantener el workspace sin loading
            const finalSelections = [...newSelections];
            finalSelections[level] = {
                workspace,
                level,
                isLoading: false
            };

            setSelections(finalSelections);
        }
    };

    // Abrir modal para un nivel específico
    const openModal = (level: number) => {
        setOpenModalLevel(level);
    };

    // Cerrar modal
    const closeModal = () => {
        setOpenModalLevel(null);
    };

    // Calcular cuántos dropdowns mostrar
    const getDropdownCount = () => {
        if (selections.length === 0) return 1;

        const lastSelection = selections[selections.length - 1];

        // Si está cargando, mostrar solo los actuales
        if (lastSelection.isLoading) return selections.length;

        // Si tiene children, mostrar uno más
        if (lastSelection.workspace.children?.length) {
            return selections.length + 1;
        }

        return selections.length;
    };

    const dropdownCount = getDropdownCount();

    return (
        <>
            <View className='flex flex-1 px-10' style={{ paddingBottom: 22 }}>
                <ScrollView contentContainerClassName='flex flex-1 items-center justify-center gap-4'>
                    <Text
                        className='text-2xl text-center text-base-content'
                        text='select_workspace'
                    />
                    <View className='gap-4 w-full'>
                        {Array.from({ length: dropdownCount }).map((_, level) => {
                            const selection = selections[level];
                            const options = getOptionsForLevel(level);

                            // Si no hay opciones para este nivel, no mostrar el dropdown
                            if (options?.length === 0) return null;

                            // Verificar si el nivel anterior está cargando
                            const previousSelection = level > 0 ? selections[level - 1] : null;
                            const isPreviousLoading = previousSelection?.isLoading || false;

                            return (
                                <View key={level} className="relative">
                                    <Dropdown
                                        label={level === 0 ? 'select_workspace' : level === 1 ? 'select_folder_from_workspace' : 'select_folder_from'}
                                        translateLabelData={{
                                            name: previousSelection?.workspace.name || ''
                                        }}
                                        text={selection?.workspace.name || 'Seleccionar...'}
                                        onPress={() => openModal(level)}
                                        disabled={isPreviousLoading}
                                        avoidTranslationText={!!selection}
                                        suffixLabelIcon={selection?.isLoading ? <Loader size={20} /> : undefined}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {selections.length > 0 && (
                    <Text
                        className='text-2xl my-4 text-center text-base-content'
                        text={selections.length === 1 ? 'collaborate.save_item_in_workspace' : 'collaborate.save_item_in_folder'}
                        translateData={{
                            name: selections?.[selections.length - 1]?.workspace?.name || '',
                            title: title || ''
                        }}
                    />
                )}
                <View className='flex flex-row gap-4 items-center justify-center'>
                    <Button
                        type='error'
                        name='collaborate.decline_invitation'
                        onPress={() => router.push(`/`)}
                    />
                    <Button
                        type='success'
                        name='collaborate.accept_invitation'
                        onPress={handleCollaborateList}
                    />
                </View>
            </View>

            {/* Modales para cada nivel */}
            {Array.from({ length: dropdownCount }).map((_, level) => {
                const options = getOptionsForLevel(level);
                const selection = selections[level];

                if (options?.length === 0) return null;

                return (
                    <DropDownModal
                        key={`modal-${level}`}
                        text={level === 0 ? 'Seleccionar Workspace' : `Seleccionar Carpeta - Nivel ${level + 1}`}
                        options={options.map(ws => ({
                            key: ws.name,
                            value: ws.id
                        }))}
                        isOpen={openModalLevel === level}
                        value={selection?.workspace.id || null as any}
                        onPress={(option) => {
                            const workspace = options.find(ws => ws.id === option.value);
                            if (workspace) {
                                handleSelect(workspace, level);
                            }
                        }}
                        onClose={closeModal}
                        avoidTranslation
                    />
                );
            })}
        </>
    );
};

export default WorkspaceSelector;
