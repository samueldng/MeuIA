import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface SegmentedControlProps {
    tabs: string[];
    activeTab: string;
    onTabPress: (tab: string) => void;
}

export function SegmentedControl({ tabs, activeTab, onTabPress }: SegmentedControlProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useSharedValue(0);
    const tabWidthStr = `${100 / tabs.length}%`;
    const tabWidthPx = containerWidth / tabs.length;

    const activeIndex = tabs.indexOf(activeTab);

    useEffect(() => {
        if (containerWidth > 0 && activeIndex >= 0) {
            translateX.value = withSpring(activeIndex * tabWidthPx, {
                damping: 20,
                stiffness: 250,
            });
        }
    }, [activeIndex, containerWidth, tabWidthPx, translateX]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            width: tabWidthPx,
        };
    });

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    return (
        <View style={styles.container} onLayout={handleLayout}>
            {containerWidth > 0 && (
                <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />
            )}
            {tabs.map((tab) => (
                <Pressable
                    key={tab}
                    style={styles.tabButton}
                    onPress={() => {
                        if (activeTab !== tab) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onTabPress(tab);
                        }
                    }}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.05)', borderless: true }}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText,
                        ]}
                    >
                        {tab}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.dark.surface,
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        backgroundColor: Colors.dark.background,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.dark.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
    },
    activeTabText: {
        color: Colors.dark.text,
    },
});
