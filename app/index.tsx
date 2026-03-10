import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';

export default function Index() {
    const { user, isOnboarded } = useAuthStore();

    if (!user) return <Redirect href="/auth/login" />;
    if (!isOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)/chat" />;
}
