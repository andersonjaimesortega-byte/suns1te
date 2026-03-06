import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthRepository } from '../src/features/auth/data/repositories/AuthRepository';

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const authRepo = new AuthRepository();

    const handleRegister = async () => {
        if (!fullName || !username || !password || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await authRepo.register(fullName, username, password);
            if (result.success) {
                Alert.alert(
                    '¡Éxito!',
                    'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
                    [{ text: 'OK', onPress: () => router.replace('/login') }]
                );
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error inesperado durante el registro.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nueva Cuenta</Text>
                    <Text style={styles.tagline}>Únete a la red SunSite</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Nombre Completo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Ing. Juan Pérez"
                        placeholderTextColor="#64748b"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <Text style={styles.label}>Usuario</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="usuario_sunsite"
                        placeholderTextColor="#64748b"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor="#64748b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirmar Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor="#64748b"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.registerBtn, isLoading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerBtnText}>
                            {isLoading ? "Creando..." : "Crear Cuenta"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backBtnText}>Ya tengo cuenta, ingresar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1D99CC',
    },
    tagline: {
        color: '#B3B3B3',
        fontSize: 16,
        marginTop: 8,
    },
    form: {
        backgroundColor: '#1e293b',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    label: {
        color: '#B3B3B3',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    registerBtn: {
        backgroundColor: '#3BB339',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    registerBtnText: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#1D99CC',
        fontSize: 14,
        fontWeight: '600',
    }
});
