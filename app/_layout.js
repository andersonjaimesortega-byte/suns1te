import { Slot, useRouter, useSegments, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AuthRepository } from '../src/features/auth/data/repositories/AuthRepository';
import { View, ActivityIndicator, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebSidebar from '../src/shared/components/WebSidebar';

export default function Layout() {
    const segments = useSegments();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const authRepo = new AuthRepository();

    const isWeb = Platform.OS === 'web';
    const isLargeScreen = width > 768;
    const showSidebar = isWeb && isLargeScreen;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authRepo.getSession();
                const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'landing';

                if (!session?.is_logged_in && !inAuthGroup) {
                    if (segments.length > 0) {
                        router.replace('/login');
                    }
                }
                else if (session?.is_logged_in && inAuthGroup) {
                    router.replace('/');
                }
            } catch (error) {
                console.error('Layout: Error verificando sesión:', error);
            } finally {
                setIsAuthLoaded(true);
            }
        };
        checkAuth();
    }, [segments]);

    if (!isAuthLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#1D99CC" />
            </View>
        );
    }

    // Auth flows (login, register, landing) should NOT have the sidebar
    const isAuthPage = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'landing' || !segments[0];

    const content = (
        <Stack
            screenOptions={{
                headerShown: !showSidebar, // Hide header if sidebar is shown
                headerStyle: { backgroundColor: '#0f172a' },
                headerTintColor: '#1D99CC',
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: '#0f172a' },
            }}
        />
    );

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                {showSidebar && !isAuthPage && <WebSidebar />}
                <View style={styles.mainContent}>
                    {content}
                </View>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#0f172a',
    },
    mainContent: {
        flex: 1,
    }
});
