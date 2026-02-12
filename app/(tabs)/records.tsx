import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranscriptionStore } from '../../hooks/use-transcription-store';
import { dbHelpers, subscribeToDbChanges } from '../../lib/db';
import { useEmbeddingService } from '../../lib/embedding-service';

export default function RecordsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [allRecords, setAllRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { generateEmbedding, isEmbeddingReady, isEmbeddingGenerating, embeddingError } = useEmbeddingService();
    const [isSearching, setIsSearching] = useState(false);
    const { text: transcribedText, isTranscribing } = useTranscriptionStore();

    // Automatically update query when transcription text changes
    useEffect(() => {
        if (transcribedText) {
            setQuery(transcribedText);
        }
    }, [transcribedText]);

    // Robustly trigger search when transcription finishes
    useEffect(() => {
        if (!isTranscribing && transcribedText) {
            setQuery(transcribedText);
            handleSearch(transcribedText); // Search immediately with the text
        }
    }, [isTranscribing, transcribedText]);

    const fetchAllRecords = async () => {
        try {
            const nodes = await dbHelpers.getNodes();
            setAllRecords(nodes);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllRecords();
            const unsubscribe = subscribeToDbChanges(() => {
                fetchAllRecords();
            });
            return () => unsubscribe();
        }, [])
    );

    const handleSearch = async (overrideQuery?: string) => {
        const activeSearchTerm = overrideQuery !== undefined ? overrideQuery : query;

        if (!activeSearchTerm.trim()) {
            setResults([]);
            return;
        }

        if (!isEmbeddingReady) return;

        setIsSearching(true);
        try {
            const vector = await generateEmbedding(activeSearchTerm);
            if (vector) {
                const nodeResults = await dbHelpers.semanticSearchNodes(vector, 20);
                setResults(nodeResults);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (query.length === 0) {
            setResults([]);
        }
    }, [query]);

    const displayData = query.trim() ? results : allRecords;

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

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.recordItem}
            activeOpacity={0.7}
            onPress={() => router.push(`/record-details?id=${item.id}`)}
        >
            <View style={styles.recordIconContainer}>
                <MaterialCommunityIcons
                    name={getIcon(item.nodetype) as any}
                    size={24}
                    color="#006AFF"
                />
            </View>
            <View style={styles.recordTextContainer}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <View style={styles.recordMeta}>
                    <Text style={styles.recordType}>{item.nodetype}</Text>
                    {item.distance !== undefined && (
                        <Text style={styles.recordDistance}>
                            • Match: {(1 - item.distance).toLocaleString(undefined, { style: 'percent' })}
                        </Text>
                    )}
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.searchSection, { paddingTop: 5 }]}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={22} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search records semantically..."
                        placeholderTextColor="#A0A0A0"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch()}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} className="pr-1">
                            <MaterialCommunityIcons name="close-circle" size={20} color="#C7C7CC" />
                        </TouchableOpacity>
                    )}
                </View>

                {!isEmbeddingReady && !embeddingError && query.length > 0 && (
                    <View style={styles.statusBanner}>
                        <ActivityIndicator size="small" color="#006AFF" />
                        <Text style={styles.statusText}>Initializing AI for semantic search...</Text>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#006AFF" />
                </View>
            ) : (
                <FlatList
                    data={displayData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons
                                name={query.trim() ? "database-search-outline" : "folder-open-outline"}
                                size={64}
                                color="#E5E5EA"
                            />
                            <Text style={styles.emptyText}>
                                {query.trim() ? "No semantically related records found." : "No records found yet."}
                            </Text>
                        </View>
                    }
                />
            )}

            {isSearching && (
                <View style={styles.searchingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.searchingText}>Searching with AI...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54, // Modern big height
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        color: '#000',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#F0F7FF',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#006AFF',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Extra padding for tab bar
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    recordIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    recordTextContainer: {
        flex: 1,
    },
    recordTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    recordMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    recordType: {
        fontSize: 13,
        color: '#8E8E93',
    },
    recordDistance: {
        fontSize: 13,
        color: '#006AFF',
        marginLeft: 4,
        fontWeight: '500',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E5E5EA',
        marginLeft: 59,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    searchingOverlay: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchingText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
