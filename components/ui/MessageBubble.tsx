import { AgentSlug } from '@/constants/Agents';
import { Colors } from '@/constants/Colors';
import type { ChatMessage } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AgentIndicator } from './AgentIndicator';

interface MessageBubbleProps {
    message: ChatMessage;
    isLastAiMessage?: boolean;
}

export const MessageBubble = memo(({ message, isLastAiMessage = false }: MessageBubbleProps) => {
    // Determine if it's a user message based on the ID structure from the store
    const isUser = message.user._id !== 'ai';
    const agentSlug = (message.agent as AgentSlug) || 'general';

    if (isUser) {
        return (
            <View style={[styles.bubbleWrapper, styles.userWrapper]}>
                <View style={[styles.bubble, styles.userBubble]}>
                    <Text style={styles.userText}>{message.text}</Text>
                </View>
            </View>
        );
    }

    // AI Bubble (with Figma gradient)
    return (
        <View style={[styles.bubbleWrapper, styles.aiWrapper]}>
            <View style={styles.aiGlowBorder}>
                <LinearGradient
                    colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.bubble, styles.aiBubble]}
                >
                    <Text style={styles.aiText}>{message.text}</Text>
                </LinearGradient>
            </View>

            <AgentIndicator agentSlug={agentSlug} />
        </View>
    );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
    bubbleWrapper: {
        width: '100%',
        marginVertical: 6,
    },
    userWrapper: {
        alignItems: 'flex-end',
    },
    aiWrapper: {
        alignItems: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        maxWidth: '85%',
    },
    userBubble: {
        backgroundColor: Colors.dark.chatUserBubble,
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    aiGlowBorder: {
        maxWidth: '85%',
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.dark.bubbleBorder,
        shadowColor: 'rgba(88,60,180,1)', // Matching Figma glow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
    },
    userText: {
        color: Colors.dark.chatUserText,
        fontSize: 13.5,
        lineHeight: 18,
        fontFamily: 'Inter-Regular',
    },
    aiText: {
        color: Colors.dark.chatAiText,
        fontSize: 13.5,
        lineHeight: 18,
        fontFamily: 'Inter-Regular',
    },
});
