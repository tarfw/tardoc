import { useEffect, useMemo } from 'react';
import { useSpeechToText, WHISPER_TINY_EN } from 'react-native-executorch';

/**
 * Hook to provide on-device speech-to-text (Whisper).
 * Uses Whisper Tiny English model via ExecuTorch.
 */
export function useWhisperService() {
    // Stabilize the model config reference
    const modelConfig = useMemo(() => ({ ...WHISPER_TINY_EN }), []);

    const {
        transcribe,
        isReady,
        isTranscribing,
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
            console.log('[ExecuTorch Whisper] Starting transcription for:', audioUri);
            const result = await transcribe(audioUri);
            return result;
        } catch (e) {
            console.error('[ExecuTorch Whisper] Failed to transcribe:', e);
            return null;
        }
    };

    return {
        transcribeAudio,
        isWhisperReady: isReady,
        isWhisperTranscribing: isTranscribing,
        whisperError: error,
        whisperDownloadProgress: downloadProgress,
    };
}
