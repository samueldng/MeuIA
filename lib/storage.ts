import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PREFIX = 'meuia_';

export const storage = {
    async get(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(`${PREFIX}${key}`);
        }
        return SecureStore.getItemAsync(`${PREFIX}${key}`);
    },

    async set(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(`${PREFIX}${key}`, value);
            return;
        }
        await SecureStore.setItemAsync(`${PREFIX}${key}`, value);
    },

    async remove(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(`${PREFIX}${key}`);
            return;
        }
        await SecureStore.deleteItemAsync(`${PREFIX}${key}`);
    },

    async getJSON<T>(key: string): Promise<T | null> {
        const raw = await this.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    },

    async setJSON<T>(key: string, value: T): Promise<void> {
        await this.set(key, JSON.stringify(value));
    },
};
