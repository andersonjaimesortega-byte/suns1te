import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { WorkLog } from '../../domain/entities/WorkLog';
import { WorkLogRepository } from '../../data/repositories/WorkLogRepository';
import { SettingsRepository } from '../../data/repositories/SettingsRepository';
import { ConstructionValidator } from '../../domain/validators/ConstructionValidator';
import { PdfGenerator } from '../../../../shared/utils/PdfGenerator';
import { ReportBuilder } from '../../domain/logic/ReportBuilder';
import { AuthRepository } from '../../../auth/data/repositories/AuthRepository';
import SignatureCapture from '../components/SignatureCapture';

const CATEGORIES = ['Hormigonado', 'Encofrado', 'Acero de Refuerzo', 'Excavación', 'Limpieza'];

export default function LogCaptureScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState('');

    // New Sections State
    const [avances, setAvances] = useState([{ task: '', progress: '', unit: '%' }]);
    const [retos, setRetos] = useState('');
    const [pendientes, setPendientes] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [signature, setSignature] = useState(null);
    const [showSignature, setShowSignature] = useState(false);
    const [residentName, setResidentName] = useState('Ingeniero Residente');
    const [isEditMode, setIsEditMode] = useState(false);

    const repository = new WorkLogRepository();
    const settingsRepo = new SettingsRepository();
    const authRepo = new AuthRepository();

    useEffect(() => {
        const loadInitialData = async () => {
            await repository.init();
            await settingsRepo.init();

            const name = await settingsRepo.getResidentName();
            setResidentName(name);

            if (id) {
                const logs = await repository.getAll();
                const existingLog = logs.find(l => l.id === id);
                if (existingLog) {
                    setTitle(existingLog.title || '');
                    setCategory(existingLog.category || CATEGORIES[0]);
                    setDescription(existingLog.description || '');
                    setSignature(existingLog.signature);
                    setIsEditMode(true);

                    if (existingLog.sections) {
                        setAvances(existingLog.sections.avances.length > 0 ? existingLog.sections.avances : [{ task: '', progress: '', unit: '%' }]);
                        setRetos(existingLog.sections.retos.join('\n'));
                        setPendientes(existingLog.sections.pendientes.join('\n'));
                    }
                }
            }
        };
        loadInitialData();
    }, [id]);

    const handleSpeech = async () => {
        if (Platform.OS !== 'web') {
            // Native fallback (future: expo-speech/voice)
            if (isListening) {
                setIsListening(false);
                return;
            }
            setIsListening(true);
            setTimeout(() => {
                setDescription(prev => prev + (prev.length > 0 ? " " : "") + "Verificación de niveles completada satisfactoriamente.");
                setIsListening(false);
            }, 1000);
            return;
        }

        // Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Alert.alert('Dictado no disponible', 'Tu navegador no soporta el dictado por voz.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setDescription(prev => prev + (prev.length > 0 ? " " : "") + transcript);
        };

        recognition.start();
    };

    const handleSave = async () => {
        const validation = ConstructionValidator.validateLog(title, description, category);

        if (validation.errors.length > 0) {
            Alert.alert('Validación de Ingeniería', validation.errors.join('\n'));
            return;
        }

        if (showSignature && !signature) {
            Alert.alert('Firma Requerida', 'Por favor confirma la firma antes de guardar.');
            return;
        }

        if (validation.suggestions.length > 0) {
            Alert.alert(
                'Sugerencia Técnica',
                validation.suggestions[0],
                [
                    { text: 'Editar', style: 'cancel' },
                    { text: 'Continuar', onPress: () => setShowSignature(true) }
                ]
            );
        } else {
            setShowSignature(true);
        }
    };

    const finalizeSave = async (isDraft = false) => {
        const intentionalDraft = isDraft === true;
        try {
            const sections = {
                avances: avances.filter(a => a.task && a.progress),
                actividades: [description],
                retos: retos.split('\n').filter(r => r.trim()),
                pendientes: pendientes.split('\n').filter(p => p.trim())
            };

            const logData = {
                id: id || Date.now().toString(),
                title,
                category,
                description,
                sections,
                signature
            };
            const newLog = new WorkLog(logData);
            await repository.save(newLog);

            if (intentionalDraft) {
                router.back();
                return;
            }

            // Automatizar generación de PDF para registros finales con ALERTAS DEBUG
            try {
                const session = await authRepo.getSession();
                const extraInfo = {
                    employeeId: session?.username || 'EXT-ERR',
                    miniGranja: session?.mini_granja || 'SunSite Engine'
                };

                const reportSchema = ReportBuilder.buildSchema(newLog, residentName, extraInfo);
                console.log('Report schema built with Gatekeeper:', reportSchema.header.employeeId, reportSchema.header.projectName);

                // Llamar al generador
                await PdfGenerator.generateReport(reportSchema);

                // Esperar un momento
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('Error en automatización de PDF:', error);
                Alert.alert('ERROR PDF', error.message);
            } finally {
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la bitácora.');
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
                {!showSignature ? (
                    <>
                        <Text style={styles.label}>Título del Registro</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Colado de losa Nivel 3"
                            placeholderTextColor="#64748b"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <View style={styles.categoryContainer}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>1. Avances Físicos (Opcional)</Text>
                        {avances.map((item, index) => (
                            <View key={index} style={styles.avanceRow}>
                                <TextInput
                                    style={[styles.input, { flex: 2, marginRight: 8 }]}
                                    placeholder="Actividad"
                                    placeholderTextColor="#64748b"
                                    value={item.task}
                                    onChangeText={(val) => {
                                        const newAv = [...avances];
                                        newAv[index].task = val;
                                        setAvances(newAv);
                                    }}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, textAlign: 'center' }]}
                                    placeholder="Cant."
                                    keyboardType="numeric"
                                    placeholderTextColor="#64748b"
                                    value={item.progress}
                                    onChangeText={(val) => {
                                        const newAv = [...avances];
                                        newAv[index].progress = val;
                                        setAvances(newAv);
                                    }}
                                />
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => setAvances([...avances, { task: '', progress: '', unit: '%' }])}
                        >
                            <Text style={styles.addBtnText}>+ Añadir Ítem de Avance</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>2. Actividades / Descripción</Text>
                        <View style={styles.descriptionContainer}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe las actividades diarias..."
                                placeholderTextColor="#64748b"
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                                spellCheck={true}
                                autoCorrect={true}
                            />
                            <View style={styles.micHintContainer}>
                                <Text style={styles.micHint}>💡 Tip: Usa el micro del teclado para dictar.</Text>
                                <TouchableOpacity
                                    style={[styles.micButton, isListening && styles.micButtonActive]}
                                    onPress={handleSpeech}
                                >
                                    <Text style={styles.micIcon}>{isListening ? "🛑" : "🪄"}</Text>
                                    <Text style={styles.micBtnText}>{isListening ? "Parar" : "Auto-Dictado"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.label}>3. Retos / Riesgos Detectados</Text>
                        <TextInput
                            style={[styles.input, styles.smallTextArea]}
                            placeholder="Maquinaria descompuesta, clima, falta de material..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={retos}
                            onChangeText={setRetos}
                        />

                        <Text style={styles.label}>4. Pendientes Próximo Turno</Text>
                        <TextInput
                            style={[styles.input, styles.smallTextArea]}
                            placeholder="Tareas críticas para mañana..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={pendientes}
                            onChangeText={setPendientes}
                        />

                        <View style={styles.actionContainer}>
                            <TouchableOpacity
                                style={styles.principalBtn}
                                onPress={handleSave}
                            >
                                <Text style={styles.principalBtnText}>Continuar a Firma ✍️</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => finalizeSave(true)}
                            >
                                <Text style={styles.secondaryBtnText}>Guardar como Borrador</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={{ marginTop: 20 }}>
                        <SignatureCapture
                            onOK={(sig) => setSignature(sig)}
                            onClear={() => setSignature(null)}
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, !signature && { opacity: 0.5 }]}
                            onPress={() => finalizeSave(false)}
                            disabled={!signature}
                        >
                            <Text style={styles.saveButtonText}>Guardar y Finalizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ alignSelf: 'center', marginTop: 10 }}
                            onPress={() => setShowSignature(false)}
                        >
                            <Text style={{ color: '#94a3b8' }}>Volver a edición</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#0f172a',
    },
    label: {
        color: '#1D99CC',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    categoryButton: {
        backgroundColor: '#1e293b',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    categoryButtonActive: {
        backgroundColor: '#1D99CC',
        borderColor: '#1D99CC',
    },
    categoryText: {
        color: '#B3B3B3',
        fontSize: 13,
    },
    categoryTextActive: {
        color: '#0f172a',
        fontWeight: 'bold',
    },
    avanceRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    addBtn: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#1D99CC',
        marginBottom: 16,
    },
    addBtnText: {
        color: '#1D99CC',
        fontSize: 12,
        fontWeight: 'bold',
    },
    smallTextArea: {
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    micHintContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
        marginBottom: 16,
    },
    micHint: {
        color: '#64748b',
        fontSize: 11,
        fontStyle: 'italic',
    },
    micButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(29, 153, 204, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1D99CC',
    },
    micButtonActive: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
    },
    micIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    micBtnText: {
        color: '#1D99CC',
        fontSize: 12,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#1D99CC',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionContainer: {
        marginTop: 32,
        gap: 12,
        marginBottom: 40,
    },
    principalBtn: {
        backgroundColor: '#3BB339',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3BB339',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    principalBtnText: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    secondaryBtnText: {
        color: '#B3B3B3',
        fontSize: 16,
        fontWeight: '600',
    },
});
