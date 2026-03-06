import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function WebSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    if (Platform.OS !== 'web') return null;

    const navItems = [
        { label: 'Panel Principal', icon: '📊', path: '/' },
        { label: 'Nuevo Reporte', icon: '➕', path: '/new-log' },
        { label: 'Configuración', icon: '⚙️', path: '/settings' },
    ];

    return (
        <View style={styles.sidebar}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🏗️ SunSite</Text>
            </View>

            <View style={styles.navContainer}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <TouchableOpacity
                            key={item.path}
                            style={[styles.navItem, isActive && styles.navItemActive]}
                            onPress={() => router.push(item.path)}
                        >
                            <Text style={styles.navIcon}>{item.icon}</Text>
                            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0 Premium</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 280,
        backgroundColor: '#1e293b',
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: '#334155',
        padding: 24,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D99CC',
    },
    navContainer: {
        flex: 1,
        gap: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    navItemActive: {
        backgroundColor: 'rgba(29, 153, 204, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(29, 153, 204, 0.3)',
    },
    navIcon: {
        fontSize: 20,
    },
    navLabel: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    },
    navLabelActive: {
        color: '#1D99CC',
        fontWeight: '700',
    },
    footer: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    version: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
    },
});
