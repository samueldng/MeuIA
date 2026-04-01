import { Colors } from '@/constants/Colors';
import { fetchAtividades } from '@/lib/api';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
} from 'react-native-reanimated';

export interface ActivityEvent {
    id: string;
    dateGroup: string;
    time: string;
    title: string;
    type: 'meeting' | 'task' | string;
}

// Grouping helper
function groupActivities(data: ActivityEvent[]) {
    const groups: Record<string, ActivityEvent[]> = {};
    data.forEach((evt) => {
        if (!groups[evt.dateGroup]) {
            groups[evt.dateGroup] = [];
        }
        groups[evt.dateGroup].push(evt);
    });

    return Object.keys(groups).map((key) => ({
        title: key,
        data: groups[key].sort((a, b) => a.time.localeCompare(b.time)),
    }));
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'meeting':
            return { icon: '📅', color: Colors.dark.primary };
        case 'task':
            return { icon: '✅', color: Colors.dark.success };
        default:
            return { icon: '🕒', color: Colors.dark.textSecondary };
    }
};

const ActivityItem = React.memo(({ item }: { item: ActivityEvent }) => {
    const { icon, color } = getEventIcon(item.type);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Aviso', 'Detalhes do evento em breve');
    };

    return (
        <Animated.View layout={LinearTransition}>
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handlePress}
                android_ripple={{ color: 'rgba(255,255,255, 0.05)' }}
            >
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardTime}>{item.time}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
});

export function ActivitiesList() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ title: string; data: ActivityEvent[] }[]>([]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setIsLoading(true);
        setError(null);

        try {
            const atividades = await fetchAtividades();

            const dataArray: ActivityEvent[] = Array.isArray(atividades) ? atividades : [atividades];
            const groupedData = groupActivities(dataArray);

            setData(groupedData);
        } catch (err: any) {
            console.error('Erro na agenda:', err);
            setError(`Erro: ${err.message || 'Falha ao buscar atividades.'}`);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData(true);
    }, [fetchData]);

    if (isLoading) {
        return (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.centerContainer}>
                {/* Skeleton Loading representation */}
                <View style={styles.skeletonGroup}>
                    <View style={styles.skeletonHeader} />
                    <View style={styles.skeletonCard} />
                    <View style={styles.skeletonCard} />
                </View>
                <View style={styles.skeletonGroup}>
                    <View style={styles.skeletonHeader} />
                    <View style={styles.skeletonCard} />
                </View>
            </Animated.View>
        );
    }

    if (error) {
        return (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.centerContainer}>
                <Text style={styles.errorIcon}>☁️❌</Text>
                <Text style={styles.errorTitle}>Desconectado</Text>
                <Text style={styles.errorSubtitle}>
                    Não foi possível buscar a agenda agora.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }}>
            <SectionList
                sections={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityItem item={item} />}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.dark.primary}
                        colors={[Colors.dark.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎉</Text>
                        <Text style={styles.emptyTitle}>Tudo Limpo!</Text>
                        <Text style={styles.emptySubtitle}>Nenhuma atividade para os próximos dias.</Text>
                    </View>
                }
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginRight: 14,
    },
    icon: {
        fontSize: 20,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
        marginBottom: 4,
    },
    cardTime: {
        fontSize: 13,
        color: Colors.dark.textMuted,
        fontWeight: '500',
    },
    // Error State
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: Colors.dark.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 54,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
    },
    // Skeleton Styles
    skeletonGroup: {
        width: '100%',
        marginBottom: 30,
    },
    skeletonHeader: {
        width: 140,
        height: 18,
        backgroundColor: Colors.dark.surface,
        borderRadius: 6,
        marginBottom: 14,
    },
    skeletonCard: {
        width: '100%',
        height: 70,
        backgroundColor: Colors.dark.surface,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
    },
});
