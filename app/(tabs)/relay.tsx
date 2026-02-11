import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FEED_DATA = [
    {
        id: '1',
        author: 'Dr. James Wilson',
        handle: '@jwilson_oncology',
        specialty: 'Oncology',
        content: 'New data from the phase III trial regarding immunotherapy in early-stage NSCLC looks very promising. The hazard ratio of 0.68 is statistically significant. #Oncology #Research #MedEd',
        time: '2h',
        likes: 142,
        reposts: 45,
        comments: 12,
        avatar: 'doctor',
        color: '#006AFF'
    },
    {
        id: '2',
        author: 'Sarah Jenkins, RN',
        handle: '@sjenkins_pulse',
        specialty: 'Critical Care',
        content: 'Quick reminder for the night shift: the new protocol for sepsis management is now live in the EMR. Please double-check the vasopressor titration guidelines. Stay safe! 🏥',
        time: '4h',
        likes: 284,
        reposts: 89,
        comments: 24,
        avatar: 'account-heart',
        color: '#FF2D55'
    },
    {
        id: '3',
        author: 'Mayo Clinic Updates',
        handle: '@mayoclinic_live',
        specialty: 'Health System',
        content: 'Join us tomorrow at 10 AM EST for our webinar on "AI-Augmented Diagnostics in Cardiology." Register via the portal link. #Cardiology #AI #HealthTech',
        time: '6h',
        likes: 567,
        reposts: 231,
        comments: 56,
        avatar: 'hospital-building',
        color: '#5856D6'
    },
    {
        id: '4',
        author: 'Dr. Elena Rossi',
        handle: '@erossi_neurosurg',
        specialty: 'Neurosurgery',
        content: 'Just finished a 12-hour resection of a complex vestibular schwannoma. Great teamwork by the neuro-anesthesia department. Rest is finally here. 🧠✨',
        time: '9h',
        likes: 1205,
        reposts: 156,
        comments: 89,
        avatar: 'brain',
        color: '#FF9500'
    }
];

const PostItem = ({ item }: { item: typeof FEED_DATA[0] }) => (
    <View style={styles.postContainer}>
        <View style={styles.postHeader}>
            <View style={[styles.avatarBox, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.avatar as any} size={24} color={item.color} />
            </View>
            <View style={styles.headerText}>
                <View style={styles.nameRow}>
                    <Text style={styles.author}>{item.author}</Text>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#006AFF" style={{ marginLeft: 4 }} />
                    <Text style={styles.handle}> • {item.time}</Text>
                </View>
                <Text style={styles.specialty}>{item.specialty}</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="dots-horizontal" size={20} color="#8E8E93" />
            </TouchableOpacity>
        </View>

        <Text style={styles.content}>{item.content}</Text>
    </View>
);

export default function RelayScreen() {
    return (
        <View style={styles.container}>
            <FlatList
                data={FEED_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PostItem item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        paddingBottom: 100, // Extra space for tab bar
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: -1,
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    postContainer: {
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    avatarBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    handle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    specialty: {
        fontSize: 13,
        fontWeight: '600',
        color: '#006AFF',
        marginTop: 1,
    },
    content: {
        fontSize: 15,
        color: '#1a1a1a',
        lineHeight: 22,
        paddingLeft: 0,
    },
});
