import { createContext } from 'react';
import { useState, useRef } from 'react';

export const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [ modalState, setModalState ] = useState(null);
    const resolveRef = useRef(null);

    function showConfirm(options) {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setModalState({ type: 'confirm', ...options });
        });
    }

    function showAlert(options) {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setModalState({ type: 'alert', ...options });
        });
    }

    function handleConfirm() {
        resolveRef.current(true);
        setModalState(null);
    }

    function handleCancel() {
        resolveRef.current(false);
        setModalState(null);
    }

    return (
        <ModalContext.Provider value={{ modalState, showConfirm, showAlert, handleConfirm, handleCancel }}>
            {children}
        </ModalContext.Provider>
    );
}