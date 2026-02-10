import { File } from 'expo-file-system';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { AudioContext } from 'react-native-audio-api';
import { useSpeechToText, WHISPER_TINY_EN } from 'react-native-executorch';

/**
 * Context for the Whisper Service.
 */
interface WhisperContextType {
    transcribeAudio: (audioUri: string) => Promise<string | null>;
    isWhisperReady: boolean;
    isWhisperTranscribing: boolean;
    whisperError: any;
    whisperDownloadProgress: number;
}

const WhisperCtx = createContext<WhisperContextType | null>(null);

const WHISPER_SAMPLE_RATE = 16000;

/**
 * Decode an audio file URI to a Float32Array waveform at 16kHz
 * using react-native-audio-api's AudioContext.
 */
async function decodeAudioToWaveform(audioUri: string): Promise<Float32Array> {
    // Read the file as ArrayBuffer using expo-file-system's File API
    const file = new File(audioUri);
    const arrayBuffer = await file.arrayBuffer();

    // Decode using AudioContext at 16kHz
    const audioContext = new AudioContext({ sampleRate: WHISPER_SAMPLE_RATE });
    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get the first channel's data (mono)
        const channelData = audioBuffer.getChannelData(0);

        console.log(
            `[Whisper] Decoded audio: ${channelData.length} samples, ` +
            `${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels} channels, ` +
            `duration: ${audioBuffer.duration.toFixed(2)}s`
        );

        return channelData;
    } finally {
        audioContext.close();
    }
}

/**
 * Provider component that initializes the Whisper model once.
 */
export function WhisperProvider({ children }: { children: React.ReactNode }) {
    // Stabilize the model config reference
    const modelConfig = useMemo(() => ({ ...WHISPER_TINY_EN }), []);

    const {
        transcribe,
        isReady,
        isGenerating: isTranscribing,
        error,
        downloadProgress,
    } = useSpeechToText({
        model: modelConfig,
    });

    useEffect(() => {
        if (error) console.error('[ExecuTorch Whisper] Load error:', error);
        if (isReady) console.log('[ExecuTorch Whisper] Model is ready for inference!');
        if (downloadProgress > 0 && downloadProgress < 1) {
            console.log(`[ExecuTorch Whisper] Download progress: ${(downloadProgress * 100).toFixed(1)}%`);
        }
    }, [isReady, error, downloadProgress]);

    const transcribeAudio = async (audioUri: string): Promise<string | null> => {
        if (!audioUri || !isReady || error) return null;

        try {
            console.log('[ExecuTorch Whisper] Decoding audio file:', audioUri);
            const waveform = await decodeAudioToWaveform(audioUri);

            console.log(`[ExecuTorch Whisper] Starting transcription with ${waveform.length} samples...`);
            const result = await transcribe(waveform);
            return result;
        } catch (e) {
            console.error('[ExecuTorch Whisper] Failed to transcribe:', e);
            return null;
        }
    };

    const value: WhisperContextType = {
        transcribeAudio,
        isWhisperReady: isReady,
        isWhisperTranscribing: isTranscribing,
        whisperError: error,
        whisperDownloadProgress: downloadProgress,
    };

    return (
        <WhisperCtx.Provider value={value}>
            {children}
        </WhisperCtx.Provider>
    );
}

/**
 * Hook to access the Whisper Service.
 * Must be used within a WhisperProvider.
 */
export function useWhisperService() {
    const context = useContext(WhisperCtx);
    if (!context) {
        throw new Error('useWhisperService must be used within a WhisperProvider');
    }
    return context;
}
