import { ChatInputForm } from '@/components/ui/ChatInputForm';
import { HeaderGearIcon, ProfileIcon } from '@/components/ui/Icons';
import { MessageBubble } from '@/components/ui/MessageBubble';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { ChatMessage } from '@/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { messages, sendTextMessage, sendVoiceMessage } = useChatStore();
    const { user, profile } = useAuthStore();
    const { aiName } = useSettingsStore();
    const router = useRouter();

    const [isRecording, setIsRecording] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const displayAIName = aiName || profile?.ai_name || 'MeuIA';
    const userName = profile?.name || user?.email?.split('@')[0] || 'Usuário';

    useEffect(() => {
        if (user) {
            useChatStore.getState().loadHistory(user.id);
            useSettingsStore.getState().loadFromSupabase(user.id);
        }
    }, [user]);

    const handleSendText = useCallback((text: string) => {
        if (!user) return;
        sendTextMessage(text, user.id, displayAIName, userName);
    }, [user, displayAIName, userName, sendTextMessage]);

    const handleSendAudio = useCallback(() => {
        if (isRecording) {
            // Stop recording and send the audio
            setIsRecording(false);
            if (user) {
                sendVoiceMessage('base64_audio_mock', user.id, displayAIName, userName);
            }
        } else {
            // Start recording
            setIsRecording(true);
        }
    }, [isRecording, user, displayAIName, sendVoiceMessage]);

    // renderItem memoized
    const renderItem = useCallback(({ item, index }: { item: ChatMessage, index: number }) => {
        // Is it the last AI message in the list? 
        // Since list is inverted, index 0 is the newest message
        const isAi = item.user._id === 'ai';
        const isLastAiMessage = isAi && index === 0;

        return (
            <MessageBubble
                message={item}
                isLastAiMessage={isLastAiMessage}
            />
        );
    }, []);

    const keyExtractor = useCallback((item: ChatMessage) => String(item._id), []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
            >
                {/* Header — Figma: avatar left, "Meu AI" center, settings right */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
                        <ProfileIcon />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.headerTitle}>Meu</Text>
                            <Text style={styles.headerTitleAccent}>AI</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/(tabs)/settings')}
                        activeOpacity={0.7}
                    >
                        <HeaderGearIcon />
                    </TouchableOpacity>
                </View>

                {/* Chat Message List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    inverted
                    showsVerticalScrollIndicator={false}
                    // Performance optimizations
                    removeClippedSubviews={Platform.OS === 'android'}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />

                {/* Input Area */}
                <ChatInputForm
                    onSendText={handleSendText}
                    onSendAudio={handleSendAudio}
                    isRecording={isRecording}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 20 : 44, // Using SafeAreaView makes this safer
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.dark.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.surfaceElevated,
    },
    avatarBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {}, // Deprecated but kept to prevent errors if referenced
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    headerTitleAccent: {
        color: '#a78bfa',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 2,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsIcon: {}, // Deprecated
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
});
