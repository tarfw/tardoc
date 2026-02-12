import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranscriptionStore } from '../../hooks/use-transcription-store';

export default function AgentsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        text, isTranscribing, clear
    } = useTranscriptionStore();

    const hasAnyContent = text || isTranscribing;

    return (
        <View className="flex-1 bg-white">
            <View
                style={{ paddingTop: insets.top || 10 }}
                className="px-8 pb-10"
            >
                <Text className="text-4xl font-black text-gray-900 leading-tight">
                    Intelligence.
                </Text>
                <Text className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
                    Real-time clinical analysis
                </Text>
            </View>

            <View className="px-8">
                {/* Transcription Card */}
                {hasAnyContent ? (
                    <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFF" />
                            </View>
                            <Text className="text-[10px] font-black text-blue-600 tracking-widest uppercase">
                                Groq Cloud • Whisper V3
                            </Text>
                        </View>

                        {isTranscribing ? (
                            <View className="items-center py-10">
                                <ActivityIndicator size="small" color="#006AFF" />
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-[2px] mt-4">
                                    Processing Audio...
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-2xl font-bold text-gray-900 leading-8">
                                    {text || "Listening for capture..."}
                                </Text>

                                <TouchableOpacity
                                    onPress={clear}
                                    className="mt-8 self-start bg-gray-900 px-6 py-3 rounded-full"
                                >
                                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                        Dismiss
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-6">
                            <MaterialCommunityIcons name="microphone-outline" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-400 text-center font-bold px-10">
                            Hold the microphone button below to capture clinical notes.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
