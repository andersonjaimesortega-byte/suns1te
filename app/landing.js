import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const router = useRouter();

    if (Platform.OS !== 'web') return null;

    const isLarge = width > 1024;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header / Navbar */}
            <View style={styles.navbar}>
                <Text style={styles.navLogo}>🏗️ SunSite</Text>
                <Link href="/login" asChild>
                    <TouchableOpacity style={styles.navLoginBtn}>
                        <Text style={styles.navLoginText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Hero Section */}
            <View style={[styles.hero, isLarge && styles.heroLarge]}>
                <View style={styles.heroContent}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>NUEVO: SunSite v2.0 disponible</Text>
                    </View>
                    <Text style={styles.title}>La bitácora digital que tu obra <Text style={styles.titleHighlight}>desatada</Text></Text>
                    <Text style={styles.subtitle}>
                        Automatiza tus reportes diarios con voz, captura firmas digitales y genera PDFs profesionales en segundos. Todo sincronizado en la nube.
                    </Text>

                    <View style={styles.ctaGroup}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/register')}>
                            <Text style={styles.primaryBtnText}>Comenzar Gratis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/login')}>
                            <Text style={styles.secondaryBtnText}>Ver Demo Web →</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isLarge && (
                    <View style={styles.heroImagePlaceholder}>
                        <View style={styles.glassCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.dotRed} />
                                <View style={styles.dotYellow} />
                                <View style={styles.dotGreen} />
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.skeletonLineLong} />
                                <View style={styles.skeletonLineShort} />
                                <View style={styles.skeletonBox} />
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>10k+</Text>
                    <Text style={styles.statLabel}>Reportes generados</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>500+</Text>
                    <Text style={styles.statLabel}>Obras activas</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4.9/5</Text>
                    <Text style={styles.statLabel}>Rating de ingenieros</Text>
                </View>
            </View>

            {/* Features Section */}
            <View style={styles.features}>
                <Text style={styles.sectionTitle}>Todo lo que necesitas en sitio</Text>
                <View style={[styles.featureGrid, isLarge && styles.featureGridLarge]}>
                    <View style={styles.featureCard}>
                        <Text style={styles.featureIcon}>🎙️</Text>
                        <Text style={styles.featureTitle}>Dictado IA</Text>
                        <Text style={styles.featureDesc}>No más escritura lenta. Dicta tus avances y deja que nuestra IA organice la información.</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Text style={styles.featureIcon}>✍️</Text>
                        <Text style={styles.featureTitle}>Firma Legal</Text>
                        <Text style={styles.featureDesc}>Capacidad de firma táctil certificada para validar reportes directamente en campo.</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Text style={styles.featureIcon}>🌩️</Text>
                        <Text style={styles.featureTitle}>Sincro Offline</Text>
                        <Text style={styles.featureDesc}>¿Sin señal? No hay problema. SunSite guarda todo localmente y sincroniza al detectar red.</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerBrand}>🏗️ SunSite Engine</Text>
                <Text style={styles.footerText}>© 2026 SunSite Engine. La nueva era de la construcción digital.</Text>
                <View style={styles.socialLinks}>
                    <Text style={styles.socialText}>LinkedIn</Text>
                    <Text style={styles.socialText}>Twitter</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    scrollContent: {
        paddingBottom: 0,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 24,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    navLogo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    navLoginBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    navLoginText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    hero: {
        paddingTop: 160,
        paddingBottom: 80,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    heroLarge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        maxWidth: 1200,
        alignSelf: 'center',
        gap: 60,
    },
    heroContent: {
        flex: 1,
        alignItems: 'flex-start',
    },
    badge: {
        backgroundColor: 'rgba(29, 153, 204, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(29, 153, 204, 0.3)',
        marginBottom: 24,
    },
    badgeText: {
        color: '#1D99CC',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 64,
        fontWeight: '900',
        color: '#ffffff',
        lineHeight: 72,
        marginBottom: 24,
        letterSpacing: -1,
    },
    titleHighlight: {
        color: '#1D99CC',
    },
    subtitle: {
        fontSize: 20,
        color: '#94a3b8',
        lineHeight: 32,
        marginBottom: 40,
        maxWidth: 600,
    },
    ctaGroup: {
        flexDirection: 'row',
        gap: 16,
    },
    primaryBtn: {
        backgroundColor: '#1D99CC',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#1D99CC',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 16,
    },
    secondaryBtnText: {
        color: '#94a3b8',
        fontSize: 18,
        fontWeight: '600',
    },
    heroImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glassCard: {
        width: 400,
        height: 300,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        backdropFilter: 'blur(10px)', // Valid on some browser environments via CSS
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 30,
    },
    dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' },
    dotYellow: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#f59e0b' },
    dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981' },
    skeletonLineLong: { height: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 12, width: '80%' },
    skeletonLineShort: { height: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 30, width: '40%' },
    skeletonBox: { height: 100, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 60,
        paddingVertical: 60,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.01)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 40,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    features: {
        padding: 80,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 60,
    },
    featureGrid: {
        gap: 30,
        width: '100%',
    },
    featureGridLarge: {
        flexDirection: 'row',
        maxWidth: 1200,
    },
    featureCard: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 40,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    featureIcon: {
        fontSize: 48,
        marginBottom: 30,
    },
    featureTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    featureDesc: {
        fontSize: 16,
        color: '#94a3b8',
        lineHeight: 24,
    },

    footer: {
        padding: 80,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    footerBrand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    footerText: {
        color: '#475569',
        fontSize: 16,
        marginBottom: 40,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 30,
    },
    socialText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    }
});
