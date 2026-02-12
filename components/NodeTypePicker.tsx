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
        { id: 'Patient', icon: 'account', label: 'Patient' },
        { id: 'Diagnosis', icon: 'stethoscope', label: 'Diagnosis' },
        { id: 'Prescription', icon: 'pill', label: 'Script' },
        { id: 'LabResult', icon: 'flask', label: 'Lab' },
        { id: 'Vitals', icon: 'heart-pulse', label: 'Vitals' },
        { id: 'Procedure', icon: 'content-cut', label: 'Surgery' },
    ];

    const handleSelect = (type: string) => {
        onClose();
        router.push(`/add-node?type=${type}`);
    };

    return (
        <View className="absolute inset-0 z-50 justify-end">
            {/* Darker backdrop for focus */}
            <TouchableOpacity
                className="absolute inset-0 bg-black/60"
                onPress={onClose}
                activeOpacity={1}
            />

            {/* Ultra-Modern Clinical Drawer */}
            <View className="bg-white rounded-t-[60px] p-10 pb-16 shadow-2xl">
                {/* Grabber */}
                <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-10" />

                <View className="mb-12">
                    <Text className="text-4xl font-black text-gray-900 leading-tight">
                        Protocol.
                    </Text>
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px] mt-1">
                        Select object to initiate creation
                    </Text>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {nodeTypes.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={{ width: '48%' }}
                            className="bg-gray-50 rounded-[32px] p-6 flex-row items-center border border-gray-100 mb-4"
                            onPress={() => handleSelect(item.id)}
                            activeOpacity={0.8}
                        >
                            <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3 shadow-sm shadow-black/5">
                                <MaterialCommunityIcons name={item.icon as any} size={20} color="#006AFF" />
                            </View>
                            <Text className="text-[13px] font-black text-gray-900 tracking-tight">
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Optional Footer or Dismiss */}
                <TouchableOpacity
                    onPress={onClose}
                    className="mt-6 py-4 items-center"
                >
                    <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[3px]">Dismiss Picker</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
