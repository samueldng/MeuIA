import { ActivitiesList } from '@/components/dashboard/ActivitiesList';
import { CloseMonthModal } from '@/components/dashboard/CloseMonthModal';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Colors } from '@/constants/Colors';
import { FinanceAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Lancamento } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const CATEGORY_ICONS: Record<string, string> = {
    alimentação: '🍔', transporte: '🚗', moradia: '🏠', lazer: '🎮',
    saúde: '💊', educação: '📚', compras: '🛒', receita: '💰',
    salário: '💼', outro: '📋',
};

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getIcon(category: string): string {
    return CATEGORY_ICONS[category.toLowerCase()] ?? '📋';
}

function mapTipo(tipo: string): 'income' | 'expense' {
    return tipo === 'ganho' ? 'income' : 'expense';
}

const TransactionItem = React.memo(({ item }: { item: Lancamento }) => {
    const type = mapTipo(item.tipo);
    // Adicionamos timezone UTC p/ evitar off-by-one errors se o dado vier do backend YYYY-MM-DD
    const dateStr = new Date(item.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC'
    });

    return (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionIcon}>{getIcon(item.categoria)}</Text>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{item.categoria}</Text>
                <Text style={styles.transactionDesc}>
                    {item.descricao ?? '—'} · {dateStr}
                </Text>
            </View>
            <Text
                style={[
                    styles.transactionAmount,
                    { color: type === 'income' ? Colors.dark.success : Colors.dark.error },
                ]}
            >
                {type === 'income' ? '+' : '-'} R${Number(item.valor).toFixed(2)}
            </Text>
        </View>
    );
});

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [monthTotal, setMonthTotal] = useState({ income: 0, expense: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Segmented Control State
    const TABS = ['Financeiro', 'Atividades'];
    const [activeTab, setActiveTab] = useState(TABS[0]);

    // Ciclo Mensal State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    // UI Modal e Loading do botão Fechar
    const [showCloseMonthModal, setShowCloseMonthModal] = useState(false);
    const [isClosingMonth, setIsClosingMonth] = useState(false);

    const loadData = useCallback(async (silent = false) => {
        if (!user) return;
        if (!silent) setIsLoading(true);
        setError(null);

        try {
            const response = await FinanceAPI.getEntries();
            const data = response.data.data;
            setLancamentos(data);

            const totals = data.reduce(
                (acc, l) => {
                    const val = Number(l.valor) || 0;
                    if (l.tipo === 'ganho') acc.income += val;
                    else acc.expense += val;
                    return acc;
                },
                { income: 0, expense: 0 },
            );
            setMonthTotal(totals);
        } catch (err) {
            setError('Não foi possível carregar os dados financeiros.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user, selectedMonth, selectedYear]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadData(true);
    }, [loadData]);
    
    const handleCloseMonth = async () => {
        if (!user) return;
        setIsClosingMonth(true);
        try {
            const response = await FinanceAPI.closeMonth();
            const res = response.data.data;
            if (res.success !== false) { // Assuming success or undefined means OK
                setShowCloseMonthModal(false);
                Alert.alert('Sucesso', 'Mês fechado e saldo transportado.');
                
                // Mover para o próximo mês
                let nextMonth = selectedMonth + 1;
                let nextYear = selectedYear;
                if (nextMonth > 12) {
                    nextMonth = 1;
                    nextYear += 1;
                }
                setSelectedMonth(nextMonth);
                setSelectedYear(nextYear);
            } else {
                setError(res.message || 'Falha ao fechar o mês.');
                setShowCloseMonthModal(false);
            }
        } catch (err: any) {
            setError('Falha na comunicação com o servidor para fechar o mês.');
            setShowCloseMonthModal(false);
        } finally {
            setIsClosingMonth(false);
        }
    };

    const balance = monthTotal.income - monthTotal.expense;
    
    const currentDate = new Date();
    const isPastMonth = selectedYear < currentDate.getFullYear() || 
                        (selectedYear === currentDate.getFullYear() && selectedMonth < currentDate.getMonth() + 1);

    const renderItem = useCallback(
        ({ item }: { item: Lancamento }) => <TransactionItem item={item} />,
        [],
    );
    const keyExtractor = useCallback(
        (item: Lancamento, index: number) => item.id?.toString() ?? `l-${index}`,
        [],
    );

    if (isLoading && lancamentos.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
                <Text style={styles.loadingText}>Carregando painel...</Text>
            </View>
        );
    }

    // Componente Interno do Financeiro
    const renderFinanceiroView = () => (
        <Animated.View entering={FadeIn} style={{ flex: 1 }}>
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
            )}

            <MonthSelector 
                month={selectedMonth} 
                year={selectedYear} 
                onMonthChange={(m, y) => {
                    setSelectedMonth(m);
                    setSelectedYear(y);
                }} 
            />

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

            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <FlatList
                data={lancamentos}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.dark.primary}
                        colors={[Colors.dark.primary]}
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                         <View style={styles.empty}>
                            <ActivityIndicator size="small" color={Colors.dark.primary} />
                         </View>
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>💸</Text>
                            <Text style={styles.emptyText}>
                                Nenhuma transação.{'\n'}Diga no chat: "Gastei R$30 no almoço"
                            </Text>
                        </View>
                    )
                }
            />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Painel</Text>
                
                {activeTab === 'Financeiro' && isPastMonth && (
                    <TouchableOpacity 
                        style={styles.closeMonthHeaderBtn}
                        onPress={() => setShowCloseMonthModal(true)}
                    >
                        <Text style={styles.closeMonthIcon}>🔒</Text>
                    </TouchableOpacity>
                )}
            </View>

            <SegmentedControl
                tabs={TABS}
                activeTab={activeTab}
                onTabPress={(tab) => setActiveTab(tab)}
            />

            {activeTab === 'Financeiro' ? renderFinanceiroView() : <ActivitiesList />}
            
            <CloseMonthModal 
                visible={showCloseMonthModal}
                monthName={MONTHS[selectedMonth - 1]}
                year={selectedYear}
                isLoading={isClosingMonth}
                onConfirm={handleCloseMonth}
                onCancel={() => setShowCloseMonthModal(false)}
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.background,
    },
    loadingText: {
        color: Colors.dark.textSecondary,
        fontSize: 14,
        marginTop: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.dark.text,
        letterSpacing: -0.5,
    },
    closeMonthHeaderBtn: {
        backgroundColor: Colors.dark.surface,
        padding: 8,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    closeMonthIcon: {
        fontSize: 20,
    },
    errorBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: Colors.dark.error + '18',
        borderRadius: 12,
        padding: 12,
        borderWidth: 0.5,
        borderColor: Colors.dark.error + '40',
    },
    errorText: {
        color: Colors.dark.error,
        fontSize: 13,
        textAlign: 'center',
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
