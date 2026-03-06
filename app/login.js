import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AccessRepository } from '../src/features/auth/data/repositories/AccessRepository';
import { AuthRepository } from '../src/features/auth/data/repositories/AuthRepository';

const MINI_GRANJAS = ['Mini-Granja Alfa', 'Mini-Granja Beta', 'Mini-Granja Gamma'];

export default function GatekeeperScreen() {
    const router = useRouter();
    const [employeeId, setEmployeeId] = useState('');
    const [selectedGranja, setSelectedGranja] = useState(MINI_GRANJAS[0]);
    const [isValidating, setIsValidating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const accessRepo = new AccessRepository();
    const authRepo = new AuthRepository();

    useEffect(() => {
        const checkExistingAccess = async () => {
            const session = await authRepo.getSession();
            if (session?.is_logged_in) {
                router.replace('/');
            }
        };
        checkExistingAccess();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        const success = await accessRepo.syncIds();
        setIsSyncing(false);
        if (success) {
            Alert.alert('Sincronización', 'Lista de IDs actualizada correctamente.');
        } else {
            Alert.alert('Error', 'No se pudo sincronizar. Verifica tu conexión a internet.');
        }
    };

    const handleAccess = async () => {
        if (!employeeId.trim()) {
            Alert.alert('Campo Requerido', 'Por favor ingresa tu ID de Empleado.');
            return;
        }

        setIsValidating(true);
        try {
            const isValid = await accessRepo.validateAccess(employeeId.trim(), selectedGranja);
            if (isValid) {
                // Guardar sesión "provisional" para el MVP
                await authRepo.login(employeeId.trim(), 'pwa_access', true, selectedGranja);
                router.replace('/');
            } else {
                Alert.alert('Acceso Denegado', 'ID no encontrado o sin permisos para esta Mini-granja.');
            }
        } catch (error) {
            Alert.alert('Error de Validación', 'Ocurrió un error al verificar el ID.');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>🏗️ SunSite</Text>
                    <Text style={styles.tagline}>Gatekeeper: Control de Acceso</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Seleccionar Ubicación (Mini-Granja)</Text>
                    <View style={styles.granjaGrid}>
                        {MINI_GRANJAS.map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.granjaBtn, selectedGranja === g && styles.granjaBtnActive]}
                                onPress={() => setSelectedGranja(g)}
                            >
                                <Text style={[styles.granjaBtnText, selectedGranja === g && styles.granjaBtnTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>ID de Empleado</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: EMP-12345"
                        placeholderTextColor="#64748b"
                        value={employeeId}
                        onChangeText={setEmployeeId}
                        autoCapitalize="characters"
                    />

                    <TouchableOpacity
                        style={[styles.accessBtn, isValidating && { opacity: 0.7 }]}
                        onPress={handleAccess}
                        disabled={isValidating}
                    >
                        {isValidating ? (
                            <ActivityIndicator color="#0f172a" />
                        ) : (
                            <Text style={styles.accessBtnText}>Validar Acceso 🔓</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.syncBtn}
                        onPress={handleSync}
                        disabled={isSyncing}
                    >
                        <Text style={styles.syncBtnText}>
                            {isSyncing ? 'Sincronizando...' : '🔄 Sincronizar IDs (Requiere Internet)'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        La validación funciona offline una vez sincronizada la lista.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -1,
    },
    tagline: {
        color: '#1D99CC',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    form: {
        backgroundColor: '#0f172a',
        padding: 40,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        width: '100%',
        maxWidth: 450,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 20,
    },
    label: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#020617',
        color: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    accessBtn: {
        backgroundColor: '#1D99CC',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#1D99CC',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    accessBtnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    syncBtn: {
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(29, 153, 204, 0.2)',
        backgroundColor: 'rgba(29, 153, 204, 0.05)',
        alignItems: 'center',
    },
    syncBtnText: {
        color: '#1D99CC',
        fontSize: 13,
        fontWeight: '700',
    },
    granjaGrid: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 24,
    },
    granjaBtn: {
        backgroundColor: '#020617',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    granjaBtnActive: {
        borderColor: '#1D99CC',
        backgroundColor: 'rgba(29, 153, 204, 0.1)',
    },
    granjaBtnText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    granjaBtnTextActive: {
        color: '#1D99CC',
    },
    hint: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 30,
        lineHeight: 18,
    }
});
