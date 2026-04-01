import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface MonthSelectorProps {
    month: number; // 1-12
    year: number;
    onMonthChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onMonthChange }: MonthSelectorProps) {

    const handlePrevious = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        let newMonth = month - 1;
        let newYear = year;
        
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        
        onMonthChange(newMonth, newYear);
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        let newMonth = month + 1;
        let newYear = year;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        
        onMonthChange(newMonth, newYear);
    };

    const monthName = MONTHS[month - 1];

    return (
        <View style={styles.container}>
            <Pressable 
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]} 
                onPress={handlePrevious}
                hitSlop={10}
            >
                <Text style={styles.arrowText}>◀</Text>
            </Pressable>
            
            <View style={styles.textContainer}>
                <Text style={styles.monthText}>{monthName} {year}</Text>
            </View>
            
            <Pressable 
                style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]} 
                onPress={handleNext}
                hitSlop={10}
            >
                <Text style={styles.arrowText}>▶</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    button: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 10,
    },
    arrowText: {
        fontSize: 16,
        color: Colors.dark.primary,
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
        letterSpacing: 0.5,
    },
});
