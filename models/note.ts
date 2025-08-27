export interface Note {
    id: number;
    title: string;
    content: string;
    folder_id: number;
    isOwner: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}
