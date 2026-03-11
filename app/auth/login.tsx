import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Preencha email e senha.');
            return;
        }
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email: email.trim(), password });
                if (error) throw error;
                Alert.alert('Sucesso!', 'Verifique seu email para confirmar a conta.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
                if (error) throw error;
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message ?? 'Falha na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <View style={styles.content}>
                <View style={styles.logoGlow}>
                    <View style={styles.logoInner}>
                        <Text style={styles.logoEmoji}>🤖</Text>
                    </View>
                </View>

                <Text style={styles.title}>
                    Meu<Text style={styles.titleAccent}> AI</Text>
                </Text>
                <Text style={styles.subtitle}>Seu assistente pessoal inteligente</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor={Colors.dark.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.authButton, loading && styles.authButtonDisabled]}
                    onPress={handleAuth}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <Text style={styles.authButtonText}>
                        {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} activeOpacity={0.7}>
                    <Text style={styles.toggleText}>
                        {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>Seus dados ficam protegidos e privados.</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'ios' ? 140 : 120,
        paddingBottom: 60,
    },
    content: {
        alignItems: 'center',
    },
    logoGlow: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.dark.micGlowOuter,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.dark.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.dark.primary + '40',
    },
    logoEmoji: {
        fontSize: 44,
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.dark.text,
        letterSpacing: 1,
    },
    titleAccent: {
        color: Colors.dark.primary,
        fontSize: 28,
        fontWeight: '400',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.dark.textSecondary,
        marginTop: 8,
    },
    form: {
        gap: 12,
    },
    input: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: Colors.dark.text,
    },
    authButton: {
        backgroundColor: Colors.dark.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 4,
    },
    authButtonDisabled: {
        opacity: 0.5,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    toggleText: {
        fontSize: 14,
        color: Colors.dark.primaryLight,
        textAlign: 'center',
        marginTop: 4,
    },
    disclaimer: {
        fontSize: 12,
        color: Colors.dark.textMuted,
        textAlign: 'center',
        marginTop: 8,
    },
});
