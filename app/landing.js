import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const router = useRouter();

    const [employeeId, setEmployeeId] = React.useState('');
    const [reportName, setReportName] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [error, setError] = React.useState('');

    const accessRepo = React.useMemo(() => new (require('../src/features/auth/data/repositories/AccessRepository').AccessRepository)(), []);
    const authRepo = React.useMemo(() => new (require('../src/features/auth/data/repositories/AuthRepository').AuthRepository)(), []);

    if (Platform.OS !== 'web') return null;

    const isLarge = width > 1024;

    const handleVerify = async () => {
        if (!employeeId.trim() || !reportName.trim()) {
            setError('Por favor completa ambos campos.');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            // Sincronizar IDs primero (opcional pero recomendado)
            await accessRepo.syncIds();

            // Validar acceso (usamos reportName para mapear a mini_granja por ahora)
            const isValid = await accessRepo.validateAccess(employeeId.trim(), reportName.trim());

            if (isValid) {
                await authRepo.login(employeeId.trim(), 'pwa_access', true, reportName.trim());
                router.replace('/');
            } else {
                setError('ID o Nombre de Informe no válidos.');
            }
        } catch (err) {
            console.error('Error verificando acceso:', err);
            setError('Error de conexión con el servidor.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header / Navbar */}
            <View style={styles.navbar}>
                <Text style={styles.navLogo}>🏗️ SunSite</Text>
                <Link href="/login" asChild>
                    <TouchableOpacity style={styles.navLoginBtn}>
                        <Text style={styles.navLoginText}>Modo Admin</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Hero Section */}
            <View style={[styles.hero, isLarge && styles.heroLarge]}>
                <View style={styles.heroContent}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>SISTEMA DE VERIFICACIÓN ACTIVO</Text>
                    </View>
                    <Text style={styles.title}>Acceso Seguro a tu <Text style={styles.titleHighlight}>Proyecto</Text></Text>
                    <Text style={styles.subtitle}>
                        Ingresa tus credenciales autorizadas para gestionar bitácoras y generar reportes técnicos legales.
                    </Text>

                    <View style={styles.verificationForm}>
                        <Text style={styles.formLabel}>ID de Empleado</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Ej: EMP-1234"
                            placeholderTextColor="#64748b"
                            value={employeeId}
                            onChangeText={setEmployeeId}
                            autoCapitalize="characters"
                        />

                        <Text style={styles.formLabel}>Nombre o ID del Informe</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Ej: Mini-Granja Alfa"
                            placeholderTextColor="#64748b"
                            value={reportName}
                            onChangeText={setReportName}
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            style={[styles.verifyBtn, isVerifying && { opacity: 0.7 }]}
                            onPress={handleVerify}
                            disabled={isVerifying}
                        >
                            <Text style={styles.verifyBtnText}>
                                {isVerifying ? 'Verificando...' : 'Verificar y Entrar 🔓'}
                            </Text>
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
                <View style={statItem}>
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
    verificationForm: {
        backgroundColor: '#0f172a',
        padding: 32,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        width: '100%',
        maxWidth: 450,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 30,
    },
    formLabel: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#020617',
        color: '#ffffff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '600',
    },
    verifyBtn: {
        backgroundColor: '#1D99CC',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#1D99CC',
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    verifyBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
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
