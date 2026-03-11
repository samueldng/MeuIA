import { MicIcon } from '@/components/ui/Icons';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface ChatInputFormProps {
    onSendText: (text: string) => void;
    onSendAudio: () => void; // For this phase, just a simulated action
    isRecording?: boolean;
}

export const ChatInputForm = ({ onSendText, onSendAudio, isRecording = false }: ChatInputFormProps) => {
    const [text, setText] = useState('');

    const pulse = useSharedValue(0);

    useEffect(() => {
        if (isRecording) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            pulse.value = withTiming(0, { duration: 300 });
        }
    }, [isRecording, pulse]);

    const ring1Style = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(pulse.value, [0, 1], [1.1, 1.3]) }],
            opacity: interpolate(pulse.value, [0, 1], [0.6, 0.3]),
        };
    });

    const ring2Style = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(pulse.value, [0, 1], [1.05, 1.15]) }],
            opacity: interpolate(pulse.value, [0, 1], [0.7, 0.4]),
        };
    });

    const handleSendText = () => {
        if (text.trim()) {
            onSendText(text.trim());
            setText('');
            Keyboard.dismiss();
        }
    };

    return (
        <View style={styles.container}>
            {/* Text Input Row */}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Fale ou Digite..."
                    placeholderTextColor={Colors.dark.textMuted}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={500}
                />

                {text.trim().length > 0 && (
                    <TouchableOpacity onPress={handleSendText} style={styles.sendTextBtn}>
                        <Ionicons name="send" size={20} color={Colors.dark.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Mic FAB Row */}
            <View style={styles.micRow}>
                <View style={styles.micContainer}>
                    <Animated.View style={[styles.ring1, ring1Style]} />
                    <Animated.View style={[styles.ring2, ring2Style]} />

                    <TouchableOpacity
                        onPress={onSendAudio}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.dark.micFabStart, Colors.dark.micFabMid, Colors.dark.micFabEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.micButton}
                        >
                            <MicIcon />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24, // Thumb zone clearance
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.surfaceElevated,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 52, // Slightly taller for modern feel
        borderWidth: 1,
        borderColor: Colors.dark.border,
        marginBottom: 32, // More space for the mic
    },
    textInput: {
        flex: 1,
        color: Colors.dark.text,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        maxHeight: 120,
    },
    sendTextBtn: {
        padding: 8,
        marginLeft: 8,
    },
    micRow: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    micContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        marginTop: -16, // pull it up slightly overlapping the input visually in the area
    },
    ring1: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: 'rgba(139,92,246,0.2)',
    },
    ring2: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(99,102,241,0.3)',
    },
    micButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(139,92,246,0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 8,
    },
});
