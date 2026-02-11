import { ts } from './log';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || ''; // Use environment variable to avoid security violations
const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

/**
 * Transcribe audio using Groq Cloud API (Whisper Large-V3-Turbo).
 * 
 * @param audioUri Local file URI of the audio recording
 * @returns Transcribed text or null if failed
 */
export async function transcribeWithGroq(audioUri: string): Promise<string | null> {
    try {
        console.log(`${ts()} [Groq] Starting cloud transcription...`);
        const startTime = Date.now();

        const formData = new FormData();

        // Append file
        formData.append('file', {
            uri: audioUri,
            name: 'recording.m4a', // Whisper handles m4a fine
            type: 'audio/m4a',
        } as any);

        // Model Selection
        formData.append('model', 'whisper-large-v3-turbo');
        // Optional: language, prompt, etc.
        // formData.append('language', 'en'); 

        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                // 'Content-Type': 'multipart/form-data', // Let fetch set boundary automatically
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        console.log(`${ts()} [Groq] Transcription complete in ${duration}ms:`, data.text);

        return data.text;
    } catch (error) {
        console.error(`${ts()} [Groq] Failed to transcribe:`, error);
        return null; // Return null on failure so UI handles it
    }
}
