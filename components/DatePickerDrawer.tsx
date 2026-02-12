import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerDrawerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
    initialDate?: string;
    title?: string;
}

const ITEM_HEIGHT = 54;

export const DatePickerDrawer = ({ visible, onClose, onSelect, initialDate, title }: DatePickerDrawerProps) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => (currentYear - 100 + i).toString());
    const [days, setDays] = useState<string[]>([]);

    const [selectedDay, setSelectedDay] = useState('01');
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    useEffect(() => {
        if (initialDate && visible) {
            const parts = initialDate.split('-');
            if (parts.length === 3) {
                const [y, m, d] = parts;
                setSelectedYear(y);
                setSelectedMonth(months[parseInt(m) - 1] || months[0]);
                setSelectedDay(d);
            }
        }
    }, [initialDate, visible]);

    useEffect(() => {
        const monthIndex = months.indexOf(selectedMonth);
        const daysInMonth = new Date(parseInt(selectedYear), monthIndex + 1, 0).getDate();
        const newDays = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
        setDays(newDays);
        if (parseInt(selectedDay) > daysInMonth) {
            setSelectedDay(daysInMonth.toString().padStart(2, '0'));
        }
    }, [selectedMonth, selectedYear]);

    const handleDone = () => {
        const monthIndex = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
        onSelect(`${selectedYear}-${monthIndex}-${selectedDay.padStart(2, '0')}`);
        onClose();
    };

    const PickerColumn = ({ data, selectedValue, onValueChange, label }: any) => {
        const paddedData = ['', ...data, ''];
        const initialIndex = data.indexOf(selectedValue);

        return (
            <View className="flex-1 items-center">
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] mb-4">{label}</Text>
                <View style={{ height: ITEM_HEIGHT * 3, width: '100%' }}>
                    <FlatList
                        data={paddedData}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        snapToInterval={ITEM_HEIGHT}
                        showsVerticalScrollIndicator={false}
                        decelerationRate="fast"
                        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                            if (index >= 0 && index < data.length) {
                                onValueChange(data[index]);
                            }
                        }}
                        renderItem={({ item }) => {
                            const isSelected = item === selectedValue;
                            return (
                                <View style={{ height: ITEM_HEIGHT }} className="justify-center items-center">
                                    <Text
                                        style={[
                                            { fontSize: 18, fontWeight: isSelected ? '900' : '500' },
                                            { color: isSelected ? '#000' : '#D1D5DB' }
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                    <View
                        pointerEvents="none"
                        className="absolute w-full border-y-2 border-gray-50 bg-gray-50/10"
                        style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
                    />
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1} />
                <View className="bg-white rounded-t-[54px] p-10 pb-16 shadow-2xl">
                    <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-10" />

                    <View className="flex-row justify-between items-end mb-12">
                        <View>
                            <Text className="text-4xl font-black text-gray-900 leading-tight">Timeline.</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Adjust clinical date</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleDone}
                            className="bg-gray-900 px-8 py-3 rounded-full"
                        >
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Confirm</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                        <PickerColumn label="Month" data={months} selectedValue={selectedMonth} onValueChange={setSelectedMonth} />
                        <PickerColumn label="Day" data={days} selectedValue={selectedDay} onValueChange={setSelectedDay} />
                        <PickerColumn label="Year" data={years} selectedValue={selectedYear} onValueChange={setSelectedYear} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
