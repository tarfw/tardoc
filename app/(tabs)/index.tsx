import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranscriptionStore } from '../../hooks/use-transcription-store';

export default function IntelligenceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isTranscribing } = useTranscriptionStore();

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

            <View className="px-8 flex-1 justify-center -mt-20">
                {isTranscribing ? (
                    <View className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 items-center">
                        <ActivityIndicator size="small" color="#006AFF" />
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-6">
                            Analyzing Audio Stream
                        </Text>
                    </View>
                ) : (
                    <View className="items-center">
                        <View className="w-24 h-24 rounded-[32px] bg-gray-50 items-center justify-center mb-8 border border-gray-100">
                            <MaterialCommunityIcons name="microphone-outline" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-400 text-center font-bold px-10 leading-6">
                            Hold the microphone button below to initiate clinical intelligence processing.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
