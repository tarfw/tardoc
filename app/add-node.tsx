import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    KeyboardTypeOptions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { dbHelpers } from '../lib/db';

// Helper Component for Inputs (Defined outside to prevent re-renders)
const FormInput = React.memo(({
    label,
    placeholder,
    value,
    onChangeText,
    multiline,
    keyboardType
}: {
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    multiline?: boolean,
    keyboardType?: KeyboardTypeOptions
}) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.textArea]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType || 'default'}
            placeholderTextColor="#A0A0A0"
        />
    </View>
));

export default function AddNodeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    // Default to 'Patient' if no type provided
    const nodeType = (params.type as string) || 'Patient';

    const [title, setTitle] = useState('');
    const [universalCode, setUniversalCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic Payload State
    const [payloadFields, setPayloadFields] = useState<Record<string, string>>({});

    const handlePayloadChange = (key: string, value: string) => {
        setPayloadFields(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!title.trim() || !universalCode.trim()) {
            alert('Please fill in Title and Universal Code');
            return;
        }

        setIsSaving(true);
        try {
            const newNode = {
                id: Math.random().toString(36).substring(7),
                title: title.trim(),
                nodetype: nodeType,
                universalcode: universalCode.trim(),
                payload: JSON.stringify(payloadFields), // Serialize dynamic fields
            };

            await dbHelpers.insertNode(newNode);
            alert('Record saved successfully!');
            router.dismissTo('/(tabs)/'); // Go back to root
        } catch (error) {
            console.error('Failed to save node:', error);
            alert('Error saving record. Check console.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderDynamicFields = () => {
        // Helper to bind value and onChangeText for cleaner JSX below
        const bind = (field: string) => ({
            value: payloadFields[field] || '',
            onChangeText: (text: string) => handlePayloadChange(field, text)
        });

        switch (nodeType) {
            case 'Patient':
                return (
                    <>
                        <FormInput label="Date of Birth" placeholder="YYYY-MM-DD" {...bind('dob')} />
                        <FormInput label="Gender" placeholder="M/F/Other" {...bind('gender')} />
                        <FormInput label="Contact Number" placeholder="+1..." {...bind('contact')} keyboardType="phone-pad" />
                        <FormInput label="Address" placeholder="Full address" {...bind('address')} multiline />
                    </>
                );
            case 'Diagnosis':
                return (
                    <>
                        <FormInput label="Severity" placeholder="Mild / Moderate / Severe" {...bind('severity')} />
                        <FormInput label="Status" placeholder="Acute / Chronic" {...bind('status')} />
                        <FormInput label="Onset Date" placeholder="YYYY-MM-DD" {...bind('onset_date')} />
                        <FormInput label="Clinical Notes" placeholder="Detailed observations..." {...bind('notes')} multiline />
                    </>
                );
            case 'Prescription':
                return (
                    <>
                        <FormInput label="Dosage" placeholder="e.g. 500mg" {...bind('dosage')} />
                        <FormInput label="Frequency" placeholder="e.g. Twice daily" {...bind('frequency')} />
                        <FormInput label="Duration" placeholder="e.g. 7 days" {...bind('duration')} />
                        <FormInput label="Instructions" placeholder="e.g. Take after food" {...bind('instructions')} multiline />
                    </>
                );
            case 'LabResult':
                return (
                    <>
                        <FormInput label="Value" placeholder="e.g. 98" {...bind('value')} />
                        <FormInput label="Unit" placeholder="e.g. mg/dL" {...bind('unit')} />
                        <FormInput label="Reference Range" placeholder="e.g. 70-100" {...bind('ref_range')} />
                        <FormInput label="LabProvider" placeholder="Lab Name" {...bind('provider')} />
                    </>
                );
            case 'Vitals':
                return (
                    <>
                        <FormInput label="Value" placeholder="e.g. 120/80" {...bind('value')} />
                        <FormInput label="Unit" placeholder="e.g. mmHg" {...bind('unit')} />
                        <FormInput label="Time Taken" placeholder="HH:MM" {...bind('time')} />
                        <FormInput label="Notes" placeholder="Position, state, etc." {...bind('notes')} />
                    </>
                );
            case 'Procedure':
                return (
                    <>
                        <FormInput label="Date" placeholder="YYYY-MM-DD" {...bind('date')} />
                        <FormInput label="Provider/Surgeon" placeholder="Dr. Name" {...bind('provider')} />
                        <FormInput label="Location" placeholder="Clinic/Hospital Room" {...bind('location')} />
                        <FormInput label="Outcome Notes" placeholder="Successful/Complications..." {...bind('outcome')} multiline />
                    </>
                );
            default:
                return (
                    <FormInput
                        label="Additional Notes"
                        placeholder="Enter details..."
                        {...bind('notes')}
                        multiline
                    />
                );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add {nodeType}</Text>
                    <Text style={styles.headerSubtitle}>New Record</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Fixed Fields */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title / Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={`Name of ${nodeType}`}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#A0A0A0"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Universal Code (ID)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Unique Identifier (e.g. PT-101)"
                        value={universalCode}
                        onChangeText={setUniversalCode}
                        autoCapitalize="characters"
                        placeholderTextColor="#A0A0A0"
                    />
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                    <Text style={styles.dividerText}>{nodeType} Details</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Dynamic Fields */}
                {renderDynamicFields()}

                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save {nodeType}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    dividerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#006AFF',
        marginRight: 10,
        textTransform: 'uppercase',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#006AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
