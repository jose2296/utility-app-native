import { DashboardItemType } from '@/models/utils';
import { toast } from '@/services/toast';
import { useCallback } from 'react';
import { useLazyApi } from './use-api';

const useAddToDashboard = () => {
    const { request: addItemToDashboard } = useLazyApi(`dashboard`, 'POST');

    const addToDashboard = useCallback(
        async ({ entity_id, entity_type, name }: { entity_id: number, entity_type: DashboardItemType, name: string }) => {
            await toast.promise(
                addItemToDashboard(`dashboard`, { entity_id, entity_type, size: { width: 1, height: 1 } }),
                {
                    loading: {
                        title: 'dashboard.adding_item_to_dashboard',
                    translateData: { name }
                },
                success: {
                    title: 'dashboard.item_added_to_dashboard',
                    translateData: { name }
                },
                error: {
                    title: 'dashboard.item_already_in_dashboard',
                    translateData: { name }
                }
            }
        )
    }, [addItemToDashboard])

    return addToDashboard;
}

export default useAddToDashboard;
