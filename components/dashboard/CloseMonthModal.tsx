import { Colors } from '@/constants/Colors';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CloseMonthModalProps {
    visible: boolean;
    monthName: string;
    year: number;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CloseMonthModal({
    visible,
    monthName,
    year,
    isLoading,
    onConfirm,
    onCancel,
}: CloseMonthModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={isLoading ? undefined : onCancel}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.icon}>🔒</Text>
                    <Text style={styles.title}>Fechar Mês de {monthName}?</Text>
                    
                    <Text style={styles.description}>
                        O saldo restante de {monthName} será transferido como "Saldo Anterior" para o mês seguinte.
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, isLoading && styles.disabledButton]}
                            onPress={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.confirmText}>Confirmar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    confirmButton: {
        backgroundColor: Colors.dark.primary,
    },
    disabledButton: {
        opacity: 0.7,
    },
    cancelText: {
        color: Colors.dark.text,
        fontWeight: '600',
        fontSize: 15,
    },
    confirmText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
});
