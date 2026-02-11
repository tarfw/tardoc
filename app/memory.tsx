import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SectionList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemoryStore } from '../hooks/use-memory-store';
import { syncDb } from '../lib/db';

/**
 * DOCTOR EMR MEMORY CLASSIFICATION
 * Categories: LTM, STM
 * Includes detailed Clinical OREvents hierarchy in STM
 */

interface MemoryItem {
    id: string;
    title: string;
    type?: 'parent' | 'child';
}

interface MemorySection {
    title: string;
    data: MemoryItem[];
}

const EMR_MEMORY: MemorySection[] = [
    {
        title: 'Long-term Memory (LTM)',
        data: [
            { id: 'l1', title: 'Nodes', type: 'parent' },
            { id: 'l2', title: 'Patient Records', type: 'child' },
            { id: 'l3', title: 'Diagnosis Catalog', type: 'child' },
            { id: 'l4', title: 'Procedure Templates', type: 'child' },
            { id: 'l5', title: 'Points', type: 'parent' },
            { id: 'l6', title: 'Clinic Locations', type: 'child' },
            { id: 'l7', title: 'Ward / Bed Assignments', type: 'child' },
            { id: 'l8', title: 'S3', type: 'parent' },
            { id: 'l9', title: 'Archived Discharge Summaries', type: 'child' },
            { id: 'l10', title: 'Actors', type: 'parent' },
            { id: 'l11', title: 'Doctors', type: 'child' },
            { id: 'l12', title: 'Nurses', type: 'child' },
            { id: 'l13', title: 'Staff', type: 'child' },
        ],
    },
    {
        title: 'Short-term Memory (STM)',
        data: [
            { id: 's_or', title: 'OREvents', type: 'parent' },
            // Admissions Group
            { id: 's_or_1', title: '🏥 Admissions', type: 'parent' },
            { id: 's101', title: 'Patient Admit', type: 'child' },
            { id: 's102', title: 'Patient Transfer', type: 'child' },
            { id: 's103', title: 'Patient Discharge', type: 'child' },
            { id: 's104', title: 'Patient Readmit', type: 'child' },
            { id: 's105', title: 'Admission Void', type: 'child' },
            // Prescriptions Group
            { id: 's_or_2', title: '💊 Prescriptions', type: 'parent' },
            { id: 's201', title: 'Prescribe', type: 'child' },
            { id: 's202', title: 'Dispense', type: 'child' },
            { id: 's203', title: 'Administer', type: 'child' },
            { id: 's204', title: 'Refill', type: 'child' },
            { id: 's205', title: 'Cancel Prescription', type: 'child' },
            { id: 's206', title: 'Adverse Reaction', type: 'child' },
            // Lab & Diagnostics Group
            { id: 's_or_3', title: '🔬 Lab & Diagnostics', type: 'parent' },
            { id: 's301', title: 'Lab Order', type: 'child' },
            { id: 's302', title: 'Lab Result', type: 'child' },
            { id: 's303', title: 'Imaging Order', type: 'child' },
            { id: 's304', title: 'Imaging Result', type: 'child' },
            { id: 's305', title: 'Biopsy', type: 'child' },
            // Vitals & Monitoring Group
            { id: 's_or_4', title: '❤️ Vitals & Monitoring', type: 'parent' },
            { id: 's401', title: 'Vitals Record', type: 'child' },
            { id: 's402', title: 'Alert Trigger', type: 'child' },
            { id: 's403', title: 'ICU Monitor', type: 'child' },
            { id: 's404', title: 'Pain Assessment', type: 'child' },
            // Consultations Group
            { id: 's_or_5', title: '🩺 Consultations', type: 'parent' },
            { id: 's501', title: 'Consult Request', type: 'child' },
            { id: 's502', title: 'Consult Complete', type: 'child' },
            { id: 's503', title: 'Referral Out', type: 'child' },
            { id: 's504', title: 'Follow-Up Schedule', type: 'child' },
            // Procedures & Surgery Group
            { id: 's_or_6', title: '📋 Procedures & Surgery', type: 'parent' },
            { id: 's601', title: 'Procedure Schedule', type: 'child' },
            { id: 's602', title: 'Procedure Start', type: 'child' },
            { id: 's603', title: 'Procedure Complete', type: 'child' },
            { id: 's604', title: 'Anesthesia Log', type: 'child' },
            // Billing Group
            { id: 's_or_7', title: '💰 Billing', type: 'parent' },
            { id: 's701', title: 'Invoice Create', type: 'child' },
            { id: 's702', title: 'Payment Received', type: 'child' },
            { id: 's703', title: 'Insurance Claim', type: 'child' },
            { id: 's704', title: 'Invoice Void', type: 'child' },
            // Other STM
            { id: 's_visit', title: 'Active Visit Context', type: 'parent' },
            { id: 's_hist', title: 'Recent Patient History', type: 'parent' },
            { id: 's_intent', title: 'Doctor Session Intent', type: 'parent' },
        ],
    },
];

export default function MemoryScreen() {
    const router = useRouter();
    const { setMemory } = useMemoryStore();

    const handleSelect = (title: string) => {
        setMemory(title);
        router.back();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Doctor EMR Memories</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => syncDb()} style={styles.syncButton}>
                        <MaterialCommunityIcons name="sync" size={24} color="#006AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <SectionList
                sections={EMR_MEMORY}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.memoryItem,
                            item.type === 'child' && styles.childItem
                        ]}
                        onPress={() => handleSelect(item.title)}
                        activeOpacity={0.6}
                    >
                        <Text style={[
                            styles.itemTitle,
                            item.type === 'child' ? styles.childText : styles.parentText
                        ]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#006AFF', // Square Blue for headers
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 24,
    },
    memoryItem: {
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#f0f0f0',
    },
    childItem: {
    },
    itemTitle: {
        fontSize: 16,
    },
    parentText: {
        fontWeight: '600',
        color: '#000000',
    },
    childText: {
        fontWeight: '400',
        color: '#8E8E93',
    },
});
