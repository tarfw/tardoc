import { useEffect, useState } from 'react';

// Shared store for Dual Transcription state
let _localText: string | null = null;
let _cloudText: string | null = null;
let _nativeText: string | null = null;
let _isLocalTranscribing = false;
let _isCloudTranscribing = false;
let _isNativeTranscribing = false;

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((l) => l());
}

export const transcriptionStore = {
    getLocalText: () => _localText,
    getCloudText: () => _cloudText,
    getNativeText: () => _nativeText,
    getIsLocalTranscribing: () => _isLocalTranscribing,
    getIsCloudTranscribing: () => _isCloudTranscribing,
    getIsNativeTranscribing: () => _isNativeTranscribing,

    setLocalText: (text: string | null) => {
        _localText = text;
        notify();
    },
    setCloudText: (text: string | null) => {
        _cloudText = text;
        notify();
    },
    setNativeText: (text: string | null) => {
        _nativeText = text;
        notify();
    },
    setIsLocalTranscribing: (val: boolean) => {
        _isLocalTranscribing = val;
        notify();
    },
    setIsCloudTranscribing: (val: boolean) => {
        _isCloudTranscribing = val;
        notify();
    },
    setIsNativeTranscribing: (val: boolean) => {
        _isNativeTranscribing = val;
        notify();
    },
    clear: () => {
        _localText = null;
        _cloudText = null;
        _nativeText = null;
        _isLocalTranscribing = false;
        _isCloudTranscribing = false;
        _isNativeTranscribing = false;
        notify();
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
};

export function useTranscriptionStore() {
    const [localText, setLocalText] = useState(transcriptionStore.getLocalText());
    const [cloudText, setCloudText] = useState(transcriptionStore.getCloudText());
    const [nativeText, setNativeText] = useState(transcriptionStore.getNativeText());
    const [isLocalTranscribing, setIsLocalTranscribing] = useState(transcriptionStore.getIsLocalTranscribing());
    const [isCloudTranscribing, setIsCloudTranscribing] = useState(transcriptionStore.getIsCloudTranscribing());
    const [isNativeTranscribing, setIsNativeTranscribing] = useState(transcriptionStore.getIsNativeTranscribing());

    useEffect(() => {
        const unsubscribe = transcriptionStore.subscribe(() => {
            setLocalText(transcriptionStore.getLocalText());
            setCloudText(transcriptionStore.getCloudText());
            setNativeText(transcriptionStore.getNativeText());
            setIsLocalTranscribing(transcriptionStore.getIsLocalTranscribing());
            setIsCloudTranscribing(transcriptionStore.getIsCloudTranscribing());
            setIsNativeTranscribing(transcriptionStore.getIsNativeTranscribing());
        });
        return unsubscribe;
    }, []);

    return {
        localText,
        cloudText,
        nativeText,
        isLocalTranscribing,
        isCloudTranscribing,
        isNativeTranscribing,
        clear: transcriptionStore.clear,
    };
}
