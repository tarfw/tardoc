import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    KeyboardTypeOptions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerDrawer } from '../components/DatePickerDrawer';
import { dbHelpers } from '../lib/db';

// Modern Form Input with Sharp Titles
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
    <View className="mb-8">
        <Text className="text-[11px] font-black text-gray-900 tracking-[1.5px] uppercase mb-3 ml-1">
            {label}
        </Text>
        <TextInput
            className={`bg-gray-50 rounded-2xl px-5 py-4 text-gray-900 text-base font-bold border border-gray-100 ${multiline ? 'h-28 text-top' : 'h-14'}`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType || 'default'}
            placeholderTextColor="#D1D5DB"
            selectionColor="#006AFF"
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    </View>
));

// Toggle Selector for ease of use
const ToggleSelector = ({
    label,
    options,
    value,
    onSelect
}: {
    label: string,
    options: string[],
    value: string,
    onSelect: (val: string) => void
}) => (
    <View className="mb-8">
        <Text className="text-[11px] font-black text-gray-900 tracking-[1.5px] uppercase mb-4 ml-1">
            {label}
        </Text>
        <View className="flex-row bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {options.map((opt) => {
                const isActive = value === opt;
                return (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onSelect(opt)}
                        style={[
                            { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
                            isActive ? { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 } : { backgroundColor: 'transparent' }
                        ]}
                    >
                        <Text
                            style={[
                                { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
                                { color: isActive ? '#006AFF' : '#9CA3AF' }
                            ]}
                        >
                            {opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);

export default function AddNodeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const nodeType = (params.type as string) || 'Patient';

    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Parent Selection State
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isPatientPickerVisible, setIsPatientPickerVisible] = useState(false);

    useEffect(() => {
        if (nodeType !== 'Patient') {
            loadPatients();
        }
    }, [nodeType]);

    const loadPatients = async () => {
        try {
            const data = await dbHelpers.getPatients();
            setPatients(data);
            if (params.parentId) {
                const parent = data.find(p => p.id === params.parentId);
                if (parent) setSelectedPatient(parent);
            }
        } catch (error) {
            console.error('Failed to load patients:', error);
        }
    };

    // Date Picker State
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState<string | null>(null);

    // Dynamic Payload State
    const [payloadFields, setPayloadFields] = useState<Record<string, string>>({});

    const handlePayloadChange = (key: string, value: string) => {
        setPayloadFields(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please provide a title or name');
            return;
        }

        if (nodeType !== 'Patient' && !selectedPatient) {
            alert('Please select a patient');
            return;
        }

        setIsSaving(true);
        try {
            const newNode = {
                id: Math.random().toString(36).substring(7),
                title: title.trim(),
                nodetype: nodeType,
                universalcode: `UC-${Math.random().toString(36).substring(7).toUpperCase()}`,
                parentid: selectedPatient?.id || null,
                payload: JSON.stringify(payloadFields),
            };

            await dbHelpers.insertNode(newNode);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Failed to save node:', error);
            alert('Error saving record.');
        } finally {
            setIsSaving(false);
        }
    };

    const DateInput = ({ label, field }: { label: string, field: string }) => (
        <View className="mb-8">
            <Text className="text-[11px] font-black text-gray-900 tracking-[1.5px] uppercase mb-3 ml-1">
                {label}
            </Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    setDatePickerTarget(field);
                    setIsDatePickerVisible(true);
                }}
                className="bg-gray-50 rounded-2xl px-5 h-14 border border-gray-100 flex-row justify-between items-center"
            >
                <Text className={`text-base font-bold ${payloadFields[field] ? 'text-gray-900' : 'text-gray-300'}`}>
                    {payloadFields[field] || 'Select Date'}
                </Text>
                <MaterialCommunityIcons name="calendar-month" size={20} color="#006AFF" />
            </TouchableOpacity>
        </View>
    );

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

    const renderDynamicFields = () => {
        const bind = (field: string) => ({
            label: field.replace(/_/g, ' '),
            placeholder: `Enter ${field.replace(/_/g, ' ')}...`,
            value: payloadFields[field] || '',
            onChangeText: (text: string) => handlePayloadChange(field, text)
        });

        switch (nodeType) {
            case 'Patient':
                return (
                    <>
                        <DateInput label="Date of Birth" field="dob" />
                        <ToggleSelector
                            label="Gender"
                            options={['Male', 'Female', 'Other']}
                            value={payloadFields['gender'] || ''}
                            onSelect={(val) => handlePayloadChange('gender', val)}
                        />
                        <FormInput {...bind('contact')} placeholder="+1..." keyboardType="phone-pad" />
                        <FormInput {...bind('address')} multiline />
                    </>
                );
            case 'Diagnosis':
                return (
                    <>
                        <ToggleSelector
                            label="Severity"
                            options={['Mild', 'Moderate', 'Severe']}
                            value={payloadFields['severity'] || ''}
                            onSelect={(val) => handlePayloadChange('severity', val)}
                        />
                        <ToggleSelector
                            label="Status"
                            options={['Acute', 'Chronic']}
                            value={payloadFields['status'] || ''}
                            onSelect={(val) => handlePayloadChange('status', val)}
                        />
                        <DateInput label="Onset Date" field="onset_date" />
                        <FormInput {...bind('notes')} multiline />
                    </>
                );
            case 'Prescription':
                return (
                    <>
                        <FormInput {...bind('dosage')} placeholder="e.g. 500mg" />
                        <FormInput {...bind('frequency')} placeholder="e.g. Twice daily" />
                        <FormInput {...bind('duration')} placeholder="e.g. 7 days" />
                        <FormInput {...bind('instructions')} multiline />
                    </>
                );
            case 'LabResult':
                return (
                    <>
                        <FormInput {...bind('value')} />
                        <FormInput {...bind('unit')} />
                        <FormInput {...bind('ref_range')} label="Ref Range" />
                        <FormInput {...bind('provider')} label="Laboratory" />
                    </>
                );
            case 'Vitals':
                return (
                    <>
                        <FormInput {...bind('value')} placeholder="e.g. 120/80" />
                        <FormInput {...bind('unit')} />
                        <FormInput {...bind('time')} label="Time Taken" />
                        <FormInput {...bind('notes')} multiline />
                    </>
                );
            case 'Procedure':
                return (
                    <>
                        <DateInput label="Procedure Date" field="date" />
                        <FormInput {...bind('provider')} label="Surgeon / Provider" />
                        <FormInput {...bind('location')} />
                        <FormInput {...bind('outcome')} label="Procedure Notes" multiline />
                    </>
                );
            default:
                return (
                    <FormInput {...bind('notes')} label="Description" multiline />
                );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            {/* Premium Header */}
            <View
                style={{ paddingTop: insets.top || 10 }}
                className="flex-row items-center justify-between px-6 pb-4"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <View className="bg-blue-600 px-4 py-1.5 rounded-full">
                    <Text className="text-[10px] font-black tracking-[2px] uppercase text-white">
                        NEW {nodeType}
                    </Text>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
                showsVerticalScrollIndicator={false}
                className="px-8 pt-6"
            >
                {/* Intro Section */}
                <View className="mb-12">
                    <View className="w-16 h-16 rounded-2xl bg-gray-900 items-center justify-center mb-6 shadow-xl shadow-gray-200">
                        <MaterialCommunityIcons name={getIcon(nodeType) as any} size={32} color="#FFF" />
                    </View>
                    <Text className="text-4xl font-black text-gray-900 leading-tight">
                        Creation.
                    </Text>
                    <Text className="text-gray-400 text-sm mt-2 font-medium">
                        Fill in the required clinical parameters below.
                    </Text>
                </View>

                {/* Patient Selector */}
                {nodeType !== 'Patient' && (
                    <TouchableOpacity
                        onPress={() => setIsPatientPickerVisible(true)}
                        activeOpacity={0.9}
                        className="bg-blue-600 p-6 rounded-[32px] flex-row items-center mb-12 shadow-xl shadow-blue-200"
                    >
                        <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4 border border-white/30">
                            <MaterialCommunityIcons name="account-search" size={24} color="#FFF" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-blue-100 tracking-widest uppercase mb-1">Target Patient</Text>
                            <Text className="text-lg font-black text-white">
                                {selectedPatient ? selectedPatient.title : 'Link to Patient'}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Main Fields */}
                <FormInput
                    label="Primary Title"
                    placeholder={`Name of this ${nodeType.toLowerCase()}...`}
                    value={title}
                    onChangeText={setTitle}
                />

                <View className="h-[1px] bg-gray-50 w-full mb-10" />

                {/* Dynamic Fields */}
                {renderDynamicFields()}

                {/* Action Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.8}
                    className={`h-16 rounded-[24px] items-center justify-center mb-10 ${isSaving ? 'bg-gray-100' : 'bg-gray-900 shadow-xl shadow-gray-200'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-white text-base font-black tracking-widest uppercase">
                            Finalize Record
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <DatePickerDrawer
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                onSelect={(date) => {
                    if (datePickerTarget) {
                        handlePayloadChange(datePickerTarget, date);
                    }
                }}
                initialDate={datePickerTarget ? payloadFields[datePickerTarget] : undefined}
                title={datePickerTarget === 'dob' ? 'Date of Birth' : 'Select Date'}
            />

            {/* Premium Patient Picker Modal */}
            <Modal
                visible={isPatientPickerVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsPatientPickerVisible(false)}
            >
                <View className="flex-1 bg-white">
                    <View className="px-8 pt-10 pb-6 flex-row items-center justify-between border-b border-gray-50">
                        <View>
                            <Text className="text-3xl font-black text-gray-900">Registry.</Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Select Patient</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsPatientPickerVisible(false)}
                            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                        {patients.length === 0 ? (
                            <View className="flex-1 justify-center items-center px-10">
                                <View className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-6">
                                    <MaterialCommunityIcons name="account-off" size={32} color="#D1D5DB" />
                                </View>
                                <Text className="text-gray-400 text-center font-bold">No active patients found in the registry.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={patients}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ padding: 32 }}
                                renderItem={({ item }) => {
                                    const p = item.payload ? JSON.parse(item.payload) : {};
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            className="flex-row items-center mb-8"
                                            onPress={() => {
                                                setSelectedPatient(item);
                                                setIsPatientPickerVisible(false);
                                            }}
                                        >
                                            <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mr-5 border border-gray-100">
                                                <MaterialCommunityIcons name="account" size={24} color="#000" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xl font-black text-gray-900">{item.title}</Text>
                                                <Text className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    {p.contact || 'No Contact Info'}
                                                </Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={24} color="#E5E7EB" />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
