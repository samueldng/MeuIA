import { Agents, AgentSlug } from '@/constants/Agents';
import { Colors } from '@/constants/Colors';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AgentIndicatorProps {
    agentSlug: AgentSlug;
}

export const AgentIndicator = memo(({ agentSlug }: AgentIndicatorProps) => {
    const agent = Agents[agentSlug] || Agents.general;

    return (
        <View style={styles.container}>
            <View style={[styles.dot, { backgroundColor: agent.color || Colors.dark.activeDot }]} />
            <Text style={styles.text}>
                Agente Ativo: {agent.name} {agent.icon}
            </Text>
        </View>
    );
});

AgentIndicator.displayName = 'AgentIndicator';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 16,
        marginLeft: 8,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        color: Colors.dark.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter-Medium', // Assuming Inter is available, fallback to system if not
        letterSpacing: 0.3,
    },
});
