import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Transaction } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';

const CATEGORY_ICONS: Record<string, string> = {
    alimentação: '🍔', transporte: '🚗', moradia: '🏠', lazer: '🎮',
    saúde: '💊', educação: '📚', compras: '🛒', receita: '💰',
    salário: '💼', outro: '📋',
};

function getIcon(category: string): string {
    return CATEGORY_ICONS[category.toLowerCase()] ?? '📋';
}

const TransactionItem = React.memo(({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
        <Text style={styles.transactionIcon}>{getIcon(item.category)}</Text>
        <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDesc}>{item.description ?? '—'}</Text>
        </View>
        <Text
            style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? Colors.dark.success : Colors.dark.error },
            ]}
        >
            {item.type === 'income' ? '+' : '-'} R${Number(item.amount).toFixed(2)}
        </Text>
    </View>
));

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [monthTotal, setMonthTotal] = useState({ income: 0, expense: 0 });

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startOfMonth)
                .order('date', { ascending: false });

            if (data) {
                setTransactions(data);
                const totals = data.reduce(
                    (acc, t) => {
                        if (t.type === 'income') acc.income += Number(t.amount);
                        else acc.expense += Number(t.amount);
                        return acc;
                    },
                    { income: 0, expense: 0 }
                );
                setMonthTotal(totals);
            }
        };
        fetchData();
    }, [user]);

    const balance = monthTotal.income - monthTotal.expense;
    const renderItem = useCallback(({ item }: { item: Transaction }) => <TransactionItem item={item} />, []);
    const keyExtractor = useCallback((item: Transaction) => item.id, []);

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>📊 Painel Financeiro</Text>

            {/* Summary Cards */}
            <View style={styles.cardsRow}>
                <View style={[styles.card, styles.cardIncome]}>
                    <Text style={styles.cardLabel}>Receitas</Text>
                    <Text style={[styles.cardValue, { color: Colors.dark.success }]}>
                        R${monthTotal.income.toFixed(2)}
                    </Text>
                </View>
                <View style={[styles.card, styles.cardExpense]}>
                    <Text style={styles.cardLabel}>Despesas</Text>
                    <Text style={[styles.cardValue, { color: Colors.dark.error }]}>
                        R${monthTotal.expense.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Balance */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Saldo do Mês</Text>
                <Text
                    style={[
                        styles.balanceValue,
                        { color: balance >= 0 ? Colors.dark.success : Colors.dark.error },
                    ]}
                >
                    {balance >= 0 ? '+' : '-'} R${Math.abs(balance).toFixed(2)}
                </Text>
            </View>

            {/* Transaction List — memoized items per mobile-design-thinking */}
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>💸</Text>
                        <Text style={styles.emptyText}>
                            Nenhuma transação ainda.{'\n'}Diga no chat: "Gastei R$30 no almoço"
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.dark.text,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    cardsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        borderWidth: 0.5,
    },
    cardIncome: {
        backgroundColor: Colors.dark.success + '10',
        borderColor: Colors.dark.success + '25',
    },
    cardExpense: {
        backgroundColor: Colors.dark.error + '10',
        borderColor: Colors.dark.error + '25',
    },
    cardLabel: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 8,
    },
    balanceCard: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: Colors.dark.primary + '25',
    },
    balanceLabel: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
    },
    balanceValue: {
        fontSize: 34,
        fontWeight: '800',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    transactionIcon: {
        fontSize: 26,
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionCategory: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.dark.text,
        textTransform: 'capitalize',
    },
    transactionDesc: {
        fontSize: 12,
        color: Colors.dark.textMuted,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
