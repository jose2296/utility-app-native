import { useLazyApi } from '@/hooks/use-api';
import { Folder } from '@/models/folder';
import { KeyValue } from '@/models/utils';
import { useUserStore } from '@/store';
import { useEffect, useState } from 'react';
import DropDownModal from './dropdown/DropdownModal';

type WorkspaceType = Folder & KeyValue;

const DeepItemFromWorkspaceModal = () => {
    const storeWorkspaces = useUserStore(store => store.data?.workspaces);
    const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
    const [workspaceSelected, setWorkspaceSelected] = useState<WorkspaceType>();
    const { request: getFolder } = useLazyApi(`folders/:id`, 'GET');

    useEffect(() => {
        if (!workspaceSelected && storeWorkspaces) {
            setWorkspaces(storeWorkspaces.map((workspace) => ({
                ...workspace,
                key: workspace.name,
                value: workspace.id
            })));
        }
    }, [storeWorkspaces]);

    if (!workspaces?.length) {
        return null;
    }

    return (
        <>
            <DropDownModal<WorkspaceType>
                text='list.fixed.select_workspace'
                options={workspaces}
                isOpen={true}
                value={workspaceSelected?.value || ''}
                onPress={(option) => {
                    setWorkspaceSelected(option);
                }}
                onClose={() => { }}
            />
        </>
    );
};

export default DeepItemFromWorkspaceModal;

const FolderContent = () => {
    const { request: getFolder } = useLazyApi(`folders/:id`, 'GET');
    // RECURSIVIDAD

    return (
        <>
        </>
    );
}
