import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { updateAIName } = useAuthStore();
    const { setAIName } = useSettingsStore();
    const router = useRouter();

    const handleContinue = async () => {
        if (!name.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await updateAIName(name.trim());
            setAIName(name.trim());
            router.replace('/(tabs)/chat');
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <View style={styles.content}>
                {/* Animated glow circle */}
                <View style={styles.glowCircle}>
                    <View style={styles.glowInner}>
                        <Text style={styles.emoji}>✨</Text>
                    </View>
                </View>

                <Text style={styles.title}>Dê um nome à sua IA</Text>
                <Text style={styles.subtitle}>
                    Este é o diferencial do MeuIA — sua assistente é única.{'\n'}
                    Como você quer chamá-la?
                </Text>

                <TextInput
                    style={[styles.input, name.trim().length > 0 && styles.inputActive]}
                    placeholder="Ex: Luna, Atlas, Nova..."
                    placeholderTextColor={Colors.dark.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    maxLength={20}
                    autoCapitalize="words"
                />

                {/* Live preview — shows how the name will look in chat */}
                {name.trim().length > 0 && (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <View style={styles.previewDot} />
                            <Text style={styles.previewLabel}>Preview</Text>
                        </View>
                        <Text style={styles.previewText}>
                            "{name.trim()}, quanto gastei essa semana?"
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, !name.trim() && styles.buttonDisabled]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!name.trim() || isSaving}
            >
                <Text style={styles.buttonText}>
                    {isSaving ? 'Salvando...' : 'Continuar'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'ios' ? 120 : 100,
        paddingBottom: 60,
    },
    content: {
        alignItems: 'center',
    },
    glowCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.dark.micGlowOuter,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    glowInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.dark.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.dark.primary + '40',
    },
    emoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.dark.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
    input: {
        width: '100%',
        backgroundColor: Colors.dark.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        paddingVertical: 18,
        paddingHorizontal: 24,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.dark.text,
        textAlign: 'center',
        marginTop: 40,
    },
    inputActive: {
        borderColor: Colors.dark.primary + '60',
    },
    previewCard: {
        width: '100%',
        backgroundColor: Colors.dark.surfaceElevated,
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    previewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.dark.activeDot,
    },
    previewLabel: {
        fontSize: 11,
        color: Colors.dark.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    previewText: {
        fontSize: 15,
        color: Colors.dark.primary,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: Colors.dark.primary,
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.3,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
