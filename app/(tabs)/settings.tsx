import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user, signOut } = useAuthStore();
    const { aiName, memoryLimit, setAIName, setMemoryLimit, syncToSupabase, loadFromSupabase } =
        useSettingsStore();
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(aiName);

    useEffect(() => {
        if (user) loadFromSupabase(user.id);
    }, [user]);

    useEffect(() => {
        setTempName(aiName);
    }, [aiName]);

    const saveAIName = async () => {
        if (!tempName.trim() || !user) return;
        setAIName(tempName.trim());
        setEditingName(false);
        await syncToSupabase(user.id);
    };

    const handleMemoryChange = async (value: number) => {
        if (!user) return;
        setMemoryLimit(value);
        await syncToSupabase(user.id);
    };

    const handleSignOut = () => {
        Alert.alert('Sair', 'Deseja realmente sair da conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚙️ Ajustes</Text>

            {/* AI Name */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nome da sua IA</Text>
                <Text style={styles.sectionDesc}>
                    Mude o nome a qualquer momento. Sua IA é única.
                </Text>
                {editingName ? (
                    <View style={styles.editRow}>
                        <TextInput
                            style={styles.input}
                            value={tempName}
                            onChangeText={setTempName}
                            maxLength={20}
                            autoCapitalize="words"
                            autoFocus
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={saveAIName}>
                            <Text style={styles.saveBtnText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.fieldRow} onPress={() => setEditingName(true)}>
                        <Text style={styles.fieldValue}>{aiName || '(não definido)'}</Text>
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Memory Limit */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Limite de Memória</Text>
                <Text style={styles.sectionDesc}>
                    Mensagens anteriores no contexto da conversa.
                </Text>
                <View style={styles.memoryRow}>
                    {[10, 25, 50, 100].map((val) => (
                        <TouchableOpacity
                            key={val}
                            style={[styles.memoryBtn, memoryLimit === val && styles.memoryBtnActive]}
                            onPress={() => handleMemoryChange(val)}
                        >
                            <Text style={[styles.memoryBtnText, memoryLimit === val && styles.memoryBtnTextActive]}>
                                {val}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Account */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta</Text>
                <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={styles.fieldValue}>{user?.email ?? '—'}</Text>
                </View>
                <View style={[styles.fieldRow, { marginTop: 8 }]}>
                    <Text style={styles.fieldLabel}>User ID</Text>
                    <Text style={[styles.fieldValue, { fontSize: 11 }]} selectable>{user?.id ?? '—'}</Text>
                </View>
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sair da conta</Text>
            </TouchableOpacity>

            <Text style={styles.version}>MeuIA v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    content: {
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 24,
    },
    section: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    sectionDesc: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        marginTop: 4,
        marginBottom: 16,
        lineHeight: 18,
    },
    editRow: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.dark.surfaceElevated,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.dark.text,
        borderWidth: 1,
        borderColor: Colors.dark.primary + '60',
    },
    saveBtn: {
        backgroundColor: Colors.dark.primary,
        borderRadius: 14,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    fieldLabel: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    editIcon: {
        fontSize: 16,
    },
    memoryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    memoryBtn: {
        flex: 1,
        backgroundColor: Colors.dark.surfaceElevated,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
        minHeight: 48, // touch target ≥ 48dp per mobile-design-thinking
    },
    memoryBtnActive: {
        borderColor: Colors.dark.primary,
        backgroundColor: Colors.dark.primary + '15',
    },
    memoryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
    },
    memoryBtnTextActive: {
        color: Colors.dark.primary,
    },
    signOutBtn: {
        backgroundColor: Colors.dark.error + '12',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 0.5,
        borderColor: Colors.dark.error + '25',
        minHeight: 52,
    },
    signOutText: {
        color: Colors.dark.error,
        fontWeight: '700',
        fontSize: 15,
    },
    version: {
        textAlign: 'center',
        color: Colors.dark.textMuted,
        fontSize: 12,
        marginTop: 24,
    },
});
