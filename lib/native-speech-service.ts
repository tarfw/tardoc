import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Platform } from 'react-native';
import { ts } from './log';

/**
 * Native OS Speech Recognition (live microphone mode).
 * 
 * Because expo-speech-recognition's file transcription on Android only
 * supports WAV/MP3/OGG (not m4a/AAC), we use live microphone recognition
 * instead. The native recognizer listens to the mic in parallel with
 * expo-av recording, so both get the same audio input.
 * 
 * Usage:
 *   startNativeListening()   — call when recording starts
 *   stopNativeListening()    — call when recording stops, returns transcript
 */

let _resolveTranscript: ((text: string | null) => void) | null = null;
let _transcript: string | null = null;
let _subs: { remove: () => void }[] = [];
let _startTime = 0;
let _isListening = false;

function cleanup() {
    _subs.forEach(s => s.remove());
    _subs = [];
    _isListening = false;
}

/**
 * Start native speech recognition (microphone mode).
 * Call this BEFORE starting the expo-av recording.
 */
export async function startNativeListening(): Promise<void> {
    if (_isListening) {
        console.warn(`${ts()} [Native] Already listening, aborting previous session`);
        ExpoSpeechRecognitionModule.abort();
        cleanup();
    }

    // Reset state
    _transcript = null;
    _resolveTranscript = null;
    _startTime = Date.now();

    try {
        // Check permissions
        const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (permissions.status !== 'granted') {
            console.error(`${ts()} [Native] Permission denied`);
            return;
        }

        // Setup event listeners
        _subs.push(ExpoSpeechRecognitionModule.addListener('result', (event) => {
            if (event.results.length > 0) {
                // Accumulate the latest transcript (may get multiple partial/final results)
                _transcript = event.results[0].transcript;
                if (event.isFinal) {
                    const duration = Date.now() - _startTime;
                    console.log(`${ts()} [Native] Final result in ${duration}ms:`, _transcript);
                }
            }
        }));

        _subs.push(ExpoSpeechRecognitionModule.addListener('error', (event) => {
            console.error(`${ts()} [Native] Error:`, event.error, event.message);
            // Resolve with whatever we have (or null)
            if (_resolveTranscript) {
                _resolveTranscript(_transcript);
                _resolveTranscript = null;
            }
            cleanup();
        }));

        _subs.push(ExpoSpeechRecognitionModule.addListener('end', () => {
            const duration = Date.now() - _startTime;
            console.log(`${ts()} [Native] Session ended after ${duration}ms`);
            // Resolve with whatever we have
            if (_resolveTranscript) {
                _resolveTranscript(_transcript);
                _resolveTranscript = null;
            }
            cleanup();
        }));

        // Start live microphone recognition
        console.log(`${ts()} [Native] Starting live speech recognition...`);
        _isListening = true;

        ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: true,
            continuous: true,
            addsPunctuation: Platform.OS === 'android' ? false : true,
        });

    } catch (error) {
        console.error(`${ts()} [Native] Failed to start:`, error);
        cleanup();
    }
}

/**
 * Stop native speech recognition and return the accumulated transcript.
 * Call this when the user stops recording.
 * 
 * @returns The transcribed text, or null if nothing was recognized
 */
export function stopNativeListening(): Promise<string | null> {
    if (!_isListening) {
        console.warn(`${ts()} [Native] Not currently listening`);
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        _resolveTranscript = resolve;

        // Set a timeout in case 'end' event doesn't fire promptly
        const timeout = setTimeout(() => {
            console.warn(`${ts()} [Native] Stop timeout, resolving with current transcript`);
            if (_resolveTranscript) {
                _resolveTranscript(_transcript);
                _resolveTranscript = null;
            }
            cleanup();
        }, 5000);

        // Override the resolve to also clear timeout
        const originalResolve = _resolveTranscript;
        _resolveTranscript = (text) => {
            clearTimeout(timeout);
            originalResolve?.(text);
        };

        // Stop recognition (this triggers a final result + end event)
        console.log(`${ts()} [Native] Stopping...`);
        ExpoSpeechRecognitionModule.stop();
    });
}
