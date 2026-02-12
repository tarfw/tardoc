import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dbHelpers } from '../lib/db';

const { width } = Dimensions.get('window');

export default function RecordDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [record, setRecord] = useState<any>(null);
    const [parent, setParent] = useState<any>(null);
    const [childRecords, setChildRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const nodes = await dbHelpers.getNodes();
            const foundRecord = nodes.find((n: any) => n.id === id);

            if (foundRecord) {
                setRecord(foundRecord);

                // If this is a child record, find its parent
                if (foundRecord.parentid) {
                    const foundParent = nodes.find((n: any) => n.id === foundRecord.parentid);
                    setParent(foundParent);
                }

                // If this is a patient, find all their medical records
                if (foundRecord.nodetype === 'Patient') {
                    const children = nodes.filter((n: any) => n.parentid === id);

                    // Sort children by date (extracted from payload)
                    const sortedChildren = children.sort((a, b) => {
                        const getDate = (node: any) => {
                            try {
                                const p = JSON.parse(node.payload || '{}');
                                // Check common date fields
                                const dateStr = p.date || p.onset_date || p.procedure_date || p.ts;
                                return dateStr ? new Date(dateStr).getTime() : 0;
                            } catch { return 0; }
                        };
                        return getDate(b) - getDate(a); // Newest first
                    });

                    setChildRecords(sortedChildren);
                }
            }
        } catch (error) {
            console.error('Failed to load record details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Patient': return 'account';
            case 'Diagnosis': return 'stethoscope';
            case 'Prescription': return 'pill';
            case 'LabResult': return 'flask';
            case 'Vitals': return 'heart-pulse';
            case 'Procedure': return 'content-cut';
            default: return 'file-document';
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#006AFF" />
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.centerContainer}>
                <Text>Record not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
                    <Text style={styles.backButtonTextInline}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Minimalist Top Nav */}
            <View
                style={{ paddingTop: insets.top || 10 }}
                className="flex-row items-center justify-between px-6 pb-4 bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <View className="bg-gray-100 px-4 py-1.5 rounded-full">
                    <Text className="text-[10px] font-black tracking-[2px] uppercase text-gray-400">
                        {record.nodetype}
                    </Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <MaterialCommunityIcons name="share-variant" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* High-End Title Section */}
                <View className="px-10 pt-8 pb-12">
                    <View className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center mb-8 shadow-xl shadow-blue-200">
                        <MaterialCommunityIcons name={getIcon(record.nodetype) as any} size={32} color="#FFF" />
                    </View>
                    <Text className="text-4xl font-black text-gray-900 leading-tight">
                        {record.title}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-3 font-medium">
                        Medical File • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                {/* Content Body */}
                <View className="px-10">
                    {/* Patient Context Card */}
                    {parent && (
                        <TouchableOpacity
                            onPress={() => router.push(`/record-details?id=${parent.id}`)}
                            activeOpacity={0.9}
                            className="bg-gray-50 p-6 rounded-[32px] flex-row items-center border border-gray-100 mb-12"
                        >
                            <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mr-4 border border-gray-100">
                                <MaterialCommunityIcons name="account" size={24} color="#006AFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Target Patient</Text>
                                <Text className="text-lg font-black text-gray-900">{parent.title}</Text>
                            </View>
                            <View className="bg-blue-600 w-8 h-8 rounded-full items-center justify-center">
                                <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Information Grid */}
                    <View className="mb-12">
                        <View className="flex-row items-center mb-8">
                            <View className="h-[2px] w-6 bg-blue-600 mr-3" />
                            <Text className="text-[11px] font-black text-gray-900 tracking-[3px] uppercase">
                                Clinical Details
                            </Text>
                        </View>

                        <View className="space-y-10">
                            {record.payload && (() => {
                                try {
                                    const payload = JSON.parse(record.payload);
                                    return Object.entries(payload).map(([key, value]) => (
                                        <View key={key}>
                                            <Text className="text-[10px] font-bold text-gray-300 tracking-widest uppercase mb-2">
                                                {key.replace(/_/g, ' ')}
                                            </Text>
                                            <Text className="text-xl font-bold text-gray-800 leading-7">
                                                {String(value)}
                                            </Text>
                                        </View>
                                    ));
                                } catch (e) {
                                    return (
                                        <View className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
                                            <Text className="text-gray-400 font-medium italic">Data Format: {record.payload}</Text>
                                        </View>
                                    );
                                }
                            })()}
                        </View>
                    </View>

                    {/* Timeline Implementation for Patients */}
                    {record.nodetype === 'Patient' && (
                        <View className="mt-4">
                            <View className="flex-row items-center mb-10">
                                <View className="h-[2px] w-6 bg-blue-600 mr-3" />
                                <Text className="text-[11px] font-black text-gray-900 tracking-[3px] uppercase">
                                    Patient Journey
                                </Text>
                            </View>

                            {childRecords.length === 0 ? (
                                <View className="bg-gray-50 py-16 rounded-[40px] items-center border border-dashed border-gray-200">
                                    <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-4 border border-gray-50">
                                        <MaterialCommunityIcons name="clipboard-outline" size={32} color="#CCC" />
                                    </View>
                                    <Text className="text-gray-400 text-sm font-bold tracking-tight">No history found yet</Text>
                                </View>
                            ) : (
                                <View className="pl-4 border-l-2 border-gray-50 ml-2 space-y-12 pb-10">
                                    {childRecords.map((child, index) => {
                                        const p = JSON.parse(child.payload || '{}');
                                        const date = p.date || p.onset_date || p.procedure_date || 'RECENT';

                                        return (
                                            <TouchableOpacity
                                                key={child.id}
                                                onPress={() => router.push(`/record-details?id=${child.id}`)}
                                                activeOpacity={0.7}
                                                className="relative"
                                            >
                                                {/* Timeline Marker */}
                                                <View className="absolute -left-[32px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-blue-600 z-10" />

                                                <View className="bg-white">
                                                    <Text className="text-[10px] font-black text-blue-600 tracking-widest uppercase mb-1.5">
                                                        {date}
                                                    </Text>
                                                    <Text className="text-2xl font-black text-gray-900 mb-2 leading-tight">{child.title}</Text>
                                                    <View className="flex-row items-center">
                                                        <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                                                            <Text className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                                                                {child.nodetype}
                                                            </Text>
                                                        </View>
                                                        <MaterialCommunityIcons name="chevron-right" size={14} color="#D1D5DB" style={{ marginLeft: 6 }} />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    backButtonInline: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#006AFF',
        borderRadius: 20,
    },
    backButtonTextInline: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
