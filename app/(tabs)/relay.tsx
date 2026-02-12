import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEED_DATA = [
    {
        id: '1',
        author: 'Dr. James Wilson',
        handle: '@jwilson_oncology',
        specialty: 'Oncology',
        content: 'New data from the phase III trial regarding immunotherapy in early-stage NSCLC looks very promising. The hazard ratio of 0.68 is statistically significant.',
        time: '2h',
        likes: 142,
        reposts: 45,
        avatar: 'doctor',
    },
    {
        id: '2',
        author: 'Sarah Jenkins, RN',
        handle: '@sjenkins_pulse',
        specialty: 'Critical Care',
        content: 'Quick reminder for the night shift: the new protocol for sepsis management is now live in the EMR. Please double-check guidelines.',
        time: '4h',
        likes: 284,
        reposts: 89,
        avatar: 'account-heart',
    },
];

const PostItem = ({ item }: { item: typeof FEED_DATA[0] }) => (
    <View className="px-8 mb-12">
        <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center mr-4 border border-gray-100">
                <MaterialCommunityIcons name={item.avatar as any} size={24} color="#000" />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="text-base font-black text-gray-900">{item.author}</Text>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#006AFF" style={{ marginLeft: 6 }} />
                </View>
                <Text className="text-[10px] font-black text-blue-600 tracking-widest uppercase mt-0.5">{item.specialty}</Text>
            </View>
            <Text className="text-[10px] font-black text-gray-300 tracking-widest uppercase">{item.time}</Text>
        </View>

        <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
            <Text className="text-base font-bold text-gray-800 leading-6">{item.content}</Text>
        </View>

        <View className="flex-row items-center mt-4 px-2">
            <TouchableOpacity className="flex-row items-center mr-6">
                <MaterialCommunityIcons name="heart-outline" size={18} color="#D1D5DB" />
                <Text className="text-[10px] font-black text-gray-400 ml-2 tracking-widest">{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
                <MaterialCommunityIcons name="broadcast" size={18} color="#D1D5DB" />
                <Text className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">Relay</Text>
            </TouchableOpacity>
        </View>
    </View>
);

export default function RelayScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View className="flex-1 bg-white">
            <View
                style={{ paddingTop: insets.top || 10 }}
                className="px-8 pb-10"
            >
                <Text className="text-4xl font-black text-gray-900 leading-tight">
                    Network.
                    {/* The dot is part of the brand aesthetic */}
                </Text>
                <Text className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
                    Live clinical intelligence
                </Text>
            </View>

            <FlatList
                data={FEED_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PostItem item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            />
        </View>
    );
}
