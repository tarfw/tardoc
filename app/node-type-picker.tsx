import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NodeTypePicker() {
    const router = useRouter();

    const nodeTypes = [
        { id: 'Patient', icon: 'account', color: '#006AFF', label: 'Patient' },
        { id: 'Diagnosis', icon: 'stethoscope', color: '#FF9500', label: 'Diagnosis' },
        { id: 'Prescription', icon: 'pill', color: '#FF2D55', label: 'Prescription' },
        { id: 'LabResult', icon: 'flask', color: '#5856D6', label: 'Lab Result' },
        { id: 'Vitals', icon: 'heart-pulse', color: '#FF3B30', label: 'Vitals' },
        { id: 'Procedure', icon: 'scalpel', color: '#34C759', label: 'Procedure' },
    ];

    const handleSelect = (type: string) => {
        router.back(); // Close modal
        // Small delay to allow modal to close smoothly before pushing new screen
        setTimeout(() => {
            router.push(`/add-node?type=${type}`);
        }, 100);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} activeOpacity={1} />

            <BlurView intensity={80} tint="light" style={styles.sheet}>
                <View style={styles.handle} />
                <Text style={styles.title}>What do you want to add?</Text>

                <View style={styles.grid}>
                    {nodeTypes.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.item}
                            onPress={() => handleSelect(item.id)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        paddingBottom: 40,
        overflow: 'hidden',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 25,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 20,
    },
    item: {
        width: '30%',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
});
