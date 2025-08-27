// types/modal.ts
import { JSX } from 'react';

export interface ModalProps {
    onClose: () => void;
    modalId: string;
    sheetHeight?: number;
}

export interface Modal {
    id: string;
    component: (props: ModalProps) => JSX.Element;
    props: any;
    type: 'modal' | 'bottomSheet';
}

export interface ModalContextValue {
    modals: Modal[];
    openModal: <T extends ModalProps>(
        type: 'modal' | 'bottomSheet',
        modalComponent: Modal['component'],
        props?: Omit<T, 'onClose' | 'modalId'>
    ) => string;
    updateModalProps: <T extends ModalProps>(id: string, props: Partial<T>) => void;
    closeModal: (id?: string) => void;
    closeAllModals: () => void;
}

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
