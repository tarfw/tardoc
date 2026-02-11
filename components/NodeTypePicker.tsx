import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NodeTypePickerProps {
    onClose: () => void;
}

export const NodeTypePicker = ({ onClose }: NodeTypePickerProps) => {
    const router = useRouter();

    const nodeTypes = [
        { id: 'Patient', icon: 'account', color: '#006AFF', label: 'Patient' },
        { id: 'Diagnosis', icon: 'stethoscope', color: '#FF9500', label: 'Diagnosis' },
        { id: 'Prescription', icon: 'pill', color: '#FF2D55', label: 'Prescription' },
        { id: 'LabResult', icon: 'flask', color: '#5856D6', label: 'Lab Result' },
        { id: 'Vitals', icon: 'heart-pulse', color: '#FF3B30', label: 'Vitals' },
        { id: 'Procedure', icon: 'content-cut', color: '#34C759', label: 'Procedure' },
    ];

    const handleSelect = (type: string) => {
        onClose();
        // Use push to navigate to the new screen
        router.push(`/add-node?type=${type}`);
    };

    return (
        <View className="absolute inset-0 z-50 justify-end">
            {/* Backdrop */}
            <TouchableOpacity
                className="absolute inset-0 bg-black/40"
                onPress={onClose}
                activeOpacity={1}
            />

            {/* Drawer Content */}
            <View className="bg-white rounded-t-[25px] p-5 pb-10 overflow-hidden">
                <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-5" />
                <Text className="text-xl font-bold text-black mb-6 text-center">What do you want to add?</Text>

                <View className="flex-row flex-wrap justify-between gap-y-5">
                    {nodeTypes.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="w-[30%] items-center gap-2"
                            onPress={() => handleSelect(item.id)}
                        >
                            <View
                                className="w-16 h-16 rounded-[20px] items-center justify-center"
                                style={{ backgroundColor: item.color + '20' }}
                            >
                                <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
                            </View>
                            <Text className="text-[13px] font-semibold text-gray-800">{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};
