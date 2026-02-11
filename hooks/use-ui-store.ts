import { useEffect, useState } from 'react';

// Simple singleton store for UI state
let isNodePickerOpen = false;
const listeners = new Set<(val: boolean) => void>();

const uiStore = {
    get: () => isNodePickerOpen,
    set: (val: boolean) => {
        isNodePickerOpen = val;
        listeners.forEach((l) => l(val));
    },
    subscribe: (listener: (val: boolean) => void) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};

export function useUIStore() {
    const [isOpen, setIsOpen] = useState(uiStore.get());

    useEffect(() => {
        const unsubscribe = uiStore.subscribe(setIsOpen);
        return () => {
            unsubscribe();
        };
    }, []);

    return {
        isNodePickerOpen: isOpen,
        openNodePicker: () => uiStore.set(true),
        closeNodePicker: () => uiStore.set(false),
    };
}
