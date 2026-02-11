import { useEffect, useState } from 'react';

// Shared store for Transcription state (Groq Cloud)
let _text: string | null = null;
let _isTranscribing = false;

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((l) => l());
}

export const transcriptionStore = {
    getText: () => _text,
    getIsTranscribing: () => _isTranscribing,

    setText: (text: string | null) => {
        _text = text;
        notify();
    },
    setIsTranscribing: (val: boolean) => {
        _isTranscribing = val;
        notify();
    },
    clear: () => {
        _text = null;
        _isTranscribing = false;
        notify();
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
};

export function useTranscriptionStore() {
    const [text, setText] = useState(transcriptionStore.getText());
    const [isTranscribing, setIsTranscribing] = useState(transcriptionStore.getIsTranscribing());

    useEffect(() => {
        const unsubscribe = transcriptionStore.subscribe(() => {
            setText(transcriptionStore.getText());
            setIsTranscribing(transcriptionStore.getIsTranscribing());
        });
        return unsubscribe;
    }, []);

    return {
        text,
        isTranscribing,
        clear: transcriptionStore.clear,
    };
}

