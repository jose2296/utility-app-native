
// contexts/ModalContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Modal, ModalContextValue, ModalProps } from './modal.model';

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const useModal = (): ModalContextValue => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal debe ser usado dentro de ModalProvider');
    }
    return context;
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modals, setModals] = useState<Modal[]>([]);

    const openModal = <T extends ModalProps>(
        type: 'modal' | 'bottomSheet',
        modalComponent: Modal['component'],
        props: Omit<T, 'onClose' | 'modalId'> = {} as Omit<T, 'onClose' | 'modalId'>
    ): string => {
        const id = Date.now().toString();
        setModals(prev => [...prev, { id, component: modalComponent, props, type }]);
        return id;
    };

    const closeModal = (id?: string): void => {
        if (id) {
            setModals(prev => prev.filter(modal => modal.id !== id));
        } else {
            // Cerrar el último modal si no se especifica ID
            setModals(prev => prev.slice(0, -1));
        }
    };

    const closeAllModals = (): void => {
        setModals([]);
    };

    const updateModalProps = <T extends ModalProps>(id: string, props: Partial<T>) => {
        setModals(prev => prev.map(modal => modal.id === id
            ? {
                ...modal,
                props: { ...modal.props, ...props }
            }
            : modal
        ));
    };

    const value: ModalContextValue = {
        modals,
        updateModalProps,
        openModal,
        closeModal,
        closeAllModals,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
