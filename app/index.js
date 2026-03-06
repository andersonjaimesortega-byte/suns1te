import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { WorkLogRepository } from '../src/features/log/data/repositories/WorkLogRepository';
import { SettingsRepository } from '../src/features/log/data/repositories/SettingsRepository';
import { AuthRepository } from '../src/features/auth/data/repositories/AuthRepository';
import { PdfGenerator } from '../src/shared/utils/PdfGenerator';
import { ReportBuilder } from '../src/features/log/domain/logic/ReportBuilder';
import { Alert } from 'react-native';

export default function HomeScreen() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [logs, setLogs] = useState([]);
    const [residentName, setResidentName] = useState('Ingeniero Residente');

    const repository = new WorkLogRepository();
    const settingsRepo = new SettingsRepository();
    const authRepo = new AuthRepository();

    useEffect(() => {
        const init = async () => {
            try {
                console.log('HomeScreen: Verificando sesión...');
                const session = await authRepo.getSession();
                setIsLoggedIn(!!session?.is_logged_in);
                if (session?.is_logged_in) {
                    await loadData();
                }
            } catch (error) {
                console.error('HomeScreen: Error en inicialización:', error);
                // Fallback to landing if DB fails
                setIsLoggedIn(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };
        init();
    }, []);

    const loadData = async () => {
        await repository.init();
        await settingsRepo.init();
        const [logsData, name] = await Promise.all([
            repository.getAll(),
            settingsRepo.getResidentName()
        ]);
        setLogs(logsData);
        setResidentName(name);
    };

    const handleEditName = () => {
        Alert.prompt(
            "Nombre del Residente",
            "Introduce tu nombre para los reportes:",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Guardar",
                    onPress: async (name) => {
                        if (name) {
                            await settingsRepo.setResidentName(name);
                            setResidentName(name);
                        }
                    }
                }
            ],
            "plain-text",
            residentName
        );
    };

    const handleGenerateDailyReport = async () => {
        if (logs.length === 0) {
            Alert.alert("Sin registros", "No hay registros hoy para generar un reporte.");
            return;
        }

        try {
            const schema = ReportBuilder.buildConsolidatedSchema(logs, residentName);
            await PdfGenerator.generateReport(schema);
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el reporte diario.");
            console.error(error);
        }
    };

    const handleLogout = async () => {
        const logoutAction = async () => {
            await authRepo.logout();
            setIsLoggedIn(false);
            router.replace('/');
        };

        if (Platform.OS === 'web') {
            if (confirm("¿Estás seguro que deseas salir?")) {
                logoutAction();
            }
        } else {
            Alert.alert(
                "Cerrar Sesión",
                "¿Estás seguro que deseas salir?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Salir", style: "destructive", onPress: logoutAction }
                ]
            );
        }
    };

    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#1D99CC" />
            </View>
        );
    }

    // WEB LANDING VIEW
    if (Platform.OS === 'web' && !isLoggedIn) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.hero}>
                    <Text style={styles.landingTitle}>🏗️ SunSite</Text>
                    <Text style={styles.landingSubtitle}>La plataforma inteligente para el control de obra</Text>

                    <View style={styles.actionCard}>
                        <Text style={styles.cardTitle}>Control de Obra Profesional</Text>
                        <Text style={styles.cardText}>Digitaliza tus bitácoras y genera reportes PDF técnicos al instante desde cualquier navegador.</Text>

                        <TouchableOpacity style={styles.primaryBtnWeb} onPress={() => router.push('/login')}>
                            <Text style={styles.primaryBtnTextWeb}>Acceder a la Versión Web →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtnWeb} onPress={() => router.push('/register')}>
                            <Text style={styles.secondaryBtnTextWeb}>Crear una cuenta nueva</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🎙️</Text>
                        <Text style={styles.featureTitle}>Dictado por Voz</Text>
                        <Text style={styles.featureDesc}>Escribe tus reportes sin usar las manos mediante inteligencia artificial.</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✍️</Text>
                        <Text style={styles.featureTitle}>Firma Digital</Text>
                        <Text style={styles.featureDesc}>Captura la firma del ingeniero directamente en la pantalla de su celular.</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📄</Text>
                        <Text style={styles.featureTitle}>PDF Instantáneo</Text>
                        <Text style={styles.featureDesc}>Genera informes técnicos legales con branding corporativo en un clic.</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 SunSite Engine. Todos los derechos reservados.</Text>
                </View>
            </ScrollView>
        );
    }

    const { width } = useWindowDimensions();

    // DASHBOARD VIEW (APP or LOGGED IN WEB)
    return (
        <View style={styles.container}>
            <View style={[styles.header, width > 768 && styles.headerWeb]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.title}>SunSite</Text>
                            {Platform.OS !== 'web' && (
                                <TouchableOpacity onPress={handleLogout}>
                                    <Text style={{ fontSize: 20 }}>🚪</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity onPress={handleEditName}>
                            <Text style={styles.subtitle}>👤 {residentName} ✏️</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {Platform.OS === 'web' && (
                            <TouchableOpacity
                                style={styles.newLogBtnWeb}
                                onPress={() => router.push('/new-log')}
                            >
                                <Text style={styles.newLogBtnTextWeb}>+ Nuevo Registro</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.dailyBtn}
                            onPress={handleGenerateDailyReport}
                        >
                            <Text style={styles.dailyBtnText}>PDF Diario</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                key={width > 768 ? 'grid' : 'list'} // Force re-render when changing columns
                numColumns={width > 1200 ? 3 : width > 768 ? 2 : 1}
                columnWrapperStyle={width > 768 ? styles.columnWrapper : null}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No hay registros hoy.</Text>
                        <Text style={styles.emptySub}>Presiona el botón "+" para empezar.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.logCard, width > 768 && styles.logCardWeb]}
                        onPress={() => {
                            if (Platform.OS === 'web') {
                                router.push({ pathname: '/new-log', params: { id: item.id } });
                            } else {
                                router.push({ pathname: '/new-log', params: { id: item.id } });
                            }
                        }}
                    >
                        <View style={styles.logHeader}>
                            <Text style={styles.logCategory}>{item.category}</Text>
                            <Text style={styles.logDate}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                        </View>
                        <Text style={styles.logTitle}>{item.title}</Text>
                        <Text style={styles.logDesc} numberOfLines={3}>{item.description}</Text>

                        {Platform.OS === 'web' && (
                            <View style={styles.cardFooterWeb}>
                                <Text style={styles.viewMoreWeb}>Ver detalles →</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            />

            {Platform.OS !== 'web' && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/new-log')}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1D99CC',
    },
    subtitle: {
        fontSize: 14,
        color: '#B3B3B3',
        marginTop: 4,
    },
    dailyBtn: {
        backgroundColor: 'rgba(29, 153, 204, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1D99CC',
    },
    dailyBtnText: {
        color: '#1D99CC',
        fontWeight: 'bold',
        fontSize: 13,
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    logCard: {
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    logCategory: {
        color: '#3BB339',
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: 'rgba(59, 179, 57, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    logDate: {
        color: '#64748b',
        fontSize: 12,
    },
    logTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    logDesc: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySub: {
        color: '#64748b',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        backgroundColor: '#3BB339',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#3BB339',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    // LANDING STYLES
    hero: {
        padding: 60,
        alignItems: 'center',
        backgroundColor: 'rgba(29, 153, 204, 0.05)',
    },
    landingTitle: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#1D99CC',
        marginBottom: 10,
        textAlign: 'center',
    },
    landingSubtitle: {
        fontSize: 20,
        color: '#B3B3B3',
        marginBottom: 40,
        textAlign: 'center',
    },
    actionCard: {
        backgroundColor: '#1e293b',
        padding: 40,
        borderRadius: 30,
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 15,
    },
    cardText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
        marginBottom: 20,
    },
    primaryBtnWeb: {
        backgroundColor: '#1D99CC',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    },
    primaryBtnTextWeb: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtnWeb: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    secondaryBtnTextWeb: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 60,
        gap: 30,
    },
    featureItem: {
        width: 300,
        padding: 30,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 40,
        marginBottom: 20,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    featureDesc: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        padding: 40,
        borderTopWidth: 1,
        borderTopColor: '#334155',
        alignItems: 'center',
    },
    footerText: {
        color: '#475569',
        fontSize: 14,
    },
    // WEB SPECIFIC DASHBOARD STYLES
    headerWeb: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'transparent',
        paddingTop: 40,
        paddingBottom: 20,
    },
    columnWrapper: {
        gap: 20,
    },
    logCardWeb: {
        flex: 1,
        minWidth: 300,
        maxWidth: '100%',
        height: 200,
        justifyContent: 'space-between',
        transitionProperty: 'all',
        transitionDuration: '200ms',
    },
    cardFooterWeb: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    viewMoreWeb: {
        color: '#1D99CC',
        fontSize: 12,
        fontWeight: 'bold',
    },
    newLogBtnWeb: {
        backgroundColor: '#3BB339',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    newLogBtnTextWeb: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
