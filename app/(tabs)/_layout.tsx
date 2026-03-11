import { BarChartIcon, ChatIcon, SettingsTabIcon } from '@/components/ui/Icons';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

function TabIcon({ label, focused, IconComponent }: { label: string; focused: boolean; IconComponent: React.ComponentType<{ active?: boolean }> }) {
  return (
    <View style={styles.tabItem}>
      <IconComponent active={focused} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.dark.primary,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Chat" focused={focused} IconComponent={ChatIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Painel" focused={focused} IconComponent={BarChartIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Ajustes" focused={focused} IconComponent={SettingsTabIcon} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.dark.surface,
    borderTopColor: Colors.dark.surfaceElevated,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    elevation: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 60,
  },
  tabIcon: {
    // Removed since we use Ionicons direct sizing
  },
  tabIconFocused: {
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: Colors.dark.primaryLight,
    fontWeight: '700',
  },
});
