import { Agents } from '@/constants/Agents';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, Composer, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';

export default function ChatScreen() {
    const { messages, isTyping, activeAgent, sendTextMessage } = useChatStore();
    const { user, profile } = useAuthStore();
    const { aiName } = useSettingsStore();
    const router = useRouter();

    const agentInfo = Agents[activeAgent];
    const displayAIName = aiName || profile?.ai_name || 'MeuIA';

    useEffect(() => {
        if (user) {
            useChatStore.getState().loadHistory(user.id);
            useSettingsStore.getState().loadFromSupabase(user.id);
        }
    }, [user]);

    const onSend = useCallback(
        (newMessages: IMessage[] = []) => {
            if (!user || !newMessages[0]?.text) return;
            sendTextMessage(newMessages[0].text, user.id, displayAIName);
        },
        [user, displayAIName, sendTextMessage]
    );

    const giftedMessages: IMessage[] = messages.map((m) => ({
        _id: m._id,
        text: m.text,
        createdAt: m.createdAt,
        user: {
            _id: m.user._id,
            name: m.user.name ?? (m.user._id === 'ai' ? displayAIName : 'Você'),
        },
    }));

    return (
        <View style={styles.container}>
            {/* Header — Figma: avatar left, "Meu AI" center, settings right */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
                    <Text style={styles.avatarText}>👤</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        Meu<Text style={styles.headerTitleAccent}> AI</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => router.push('/(tabs)/settings')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Chat */}
            <GiftedChat
                messages={giftedMessages}
                onSend={onSend}
                user={{ _id: user?.id ?? '' }}
                isTyping={isTyping}
                renderBubble={(props) => {
                    const isAI = props.currentMessage?.user._id === 'ai';
                    const messageAgent = (props.currentMessage as any)?.agent;

                    return (
                        <View>
                            <Bubble
                                {...props}
                                wrapperStyle={{
                                    left: styles.aiBubbleWrapper,
                                    right: styles.userBubbleWrapper,
                                }}
                                textStyle={{
                                    left: styles.aiBubbleText,
                                    right: styles.userBubbleText,
                                }}
                            />
                            {isAI && messageAgent && (
                                <View style={styles.agentIndicator}>
                                    <View style={styles.agentDot} />
                                    <Text style={styles.agentIndicatorText}>
                                        Agente Ativo: {Agents[messageAgent as keyof typeof Agents]?.name ?? 'General'}{' '}
                                        {Agents[messageAgent as keyof typeof Agents]?.icon ?? '🤖'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                }}
                renderInputToolbar={(props) => (
                    <InputToolbar
                        {...props}
                        containerStyle={styles.inputToolbar as any}
                        primaryStyle={styles.inputPrimary as any}
                    />
                )}
                renderComposer={(props) => (
                    <Composer
                        {...props}
                        textInputProps={{
                            ...props.textInputProps,
                            style: styles.composer,
                            placeholderTextColor: Colors.dark.textMuted,
                            placeholder: 'Fale ou Digite...',
                        }}
                    />
                )}
                renderSend={(props) => (
                    <Send {...props}>
                        <View style={styles.sendContainer}>
                            <Text style={styles.sendButton}>➤</Text>
                        </View>
                    </Send>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.dark.background,
    },
    avatarBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    avatarText: { fontSize: 18 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.dark.text,
        letterSpacing: 0.5,
    },
    headerTitleAccent: {
        color: Colors.dark.primary,
        fontSize: 18,
        fontWeight: '400',
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsIcon: { fontSize: 22 },

    // Chat Bubbles
    userBubbleWrapper: {
        backgroundColor: Colors.dark.chatUserBubble,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    userBubbleText: { color: Colors.dark.chatUserText, fontSize: 15 },
    aiBubbleWrapper: {
        backgroundColor: Colors.dark.chatAiBubble,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        borderWidth: 0.5,
        borderColor: Colors.dark.primary + '30',
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    aiBubbleText: { color: Colors.dark.chatAiText, fontSize: 15 },

    // Agent Indicator
    agentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        marginTop: 4,
        marginBottom: 8,
        gap: 6,
    },
    agentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.dark.activeDot,
    },
    agentIndicatorText: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        fontWeight: '500',
    },

    // Input area
    inputToolbar: {
        backgroundColor: Colors.dark.surface,
        borderTopWidth: 0.5,
        borderTopColor: Colors.dark.border,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    inputPrimary: { alignItems: 'center' },
    composer: {
        backgroundColor: Colors.dark.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        color: Colors.dark.text,
        fontSize: 15,
        marginRight: 4,
    },
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
    },
    sendButton: {
        fontSize: 20,
        color: Colors.dark.primary,
    },
});
