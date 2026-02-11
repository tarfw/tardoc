import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranscriptionStore } from '../../hooks/use-transcription-store';

export default function AgentsScreen() {
    const router = useRouter();
    const {
        localText, cloudText, nativeText,
        isLocalTranscribing, isCloudTranscribing, isNativeTranscribing,
        clear
    } = useTranscriptionStore();

    const hasAnyContent = localText || cloudText || nativeText ||
        isLocalTranscribing || isCloudTranscribing || isNativeTranscribing;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agents</Text>
            <Text style={styles.subtitle}>Triple Transcription Test</Text>

            {/* Local Transcription Card */}
            {hasAnyContent && (
                <View style={[styles.transcriptionBox, { borderColor: 'rgba(0, 106, 255, 0.15)' }]}>
                    <Text style={[styles.transcriptionLabel, { color: '#006AFF' }]}>📱 Local (Whisper Tiny) ~4s</Text>

                    {isLocalTranscribing ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#006AFF" />
                            <Text style={styles.transcribingText}>Transcribing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.transcriptionText}>{localText || "Waiting..."}</Text>
                    )}
                </View>
            )}

            {/* Cloud Transcription Card */}
            {hasAnyContent && (
                <View style={[styles.transcriptionBox, { borderColor: 'rgba(255, 59, 48, 0.15)', marginTop: 15 }]}>
                    <Text style={[styles.transcriptionLabel, { color: '#FF3B30' }]}>☁️ Cloud (Groq Large-V3) ~1s</Text>

                    {isCloudTranscribing ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#FF3B30" />
                            <Text style={[styles.transcribingText, { color: '#FF3B30' }]}>Transcribing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.transcriptionText}>{cloudText || "Waiting..."}</Text>
                    )}
                </View>
            )}

            {/* Native Transcription Card */}
            {hasAnyContent && (
                <View style={[styles.transcriptionBox, { borderColor: 'rgba(175, 82, 222, 0.15)', marginTop: 15 }]}>
                    <Text style={[styles.transcriptionLabel, { color: '#AF52DE' }]}>🗣️ Native (OS Dictation)</Text>

                    {isNativeTranscribing ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#AF52DE" />
                            <Text style={[styles.transcribingText, { color: '#AF52DE' }]}>Transcribing...</Text>
                        </View>
                    ) : (
                        <Text style={styles.transcriptionText}>{nativeText || "Waiting..."}</Text>
                    )}
                </View>
            )}

            {hasAnyContent && (
                <TouchableOpacity onPress={clear} style={styles.dismissButton}>
                    <Text style={styles.dismissText}>Clear All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        marginBottom: 30,
    },
    transcriptionBox: {
        backgroundColor: '#F5F7FF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: 20,
        borderWidth: 1,
        width: '90%',
        marginTop: 10,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
    },
    transcribingText: {
        fontSize: 15,
        color: '#006AFF',
        fontWeight: '600',
    },
    transcriptionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    transcriptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
        lineHeight: 24,
    },
    dismissButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    dismissText: {
        fontSize: 13,
        color: '#006AFF',
        fontWeight: '600',
    },
});
