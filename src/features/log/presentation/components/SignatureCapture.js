import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

export default function SignatureCapture({ onOK, onClear }) {
    const ref = useRef();
    const [key, setKey] = useState(0);

    const handleOK = (signature) => {
        onOK(signature);
    };

    const handleClear = () => {
        setKey(prev => prev + 1);
        onClear();
    };

    const handleEnd = () => {
        if (ref.current) {
            ref.current.readSignature();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Firma del Ingeniero Responsable</Text>
            <View style={styles.signatureContainer}>
                {Platform.OS === 'web' ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
                        <Text style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                            La firma táctil web requiere configuración de canvas adicional.
                            Por ahora, se usará "Firma Digital SunSite" automática para reportes web.
                        </Text>
                        <TouchableOpacity
                            style={styles.buttonClear}
                            onPress={() => onOK('DATA:SUNSITE_DIGITAL_SIG')}
                        >
                            <Text style={styles.buttonText}>Establecer Firma Digital</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <SignatureScreen
                        key={key}
                        ref={ref}
                        onOK={handleOK}
                        onClear={handleClear}
                        onEnd={handleEnd}
                        descriptionText="Firme aquí"
                        clearText="Borrar"
                        confirmText="Confirmar"
                        webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
                        autoSize={true}
                    />
                )}
            </View>
            {Platform.OS !== 'web' && (
                <View style={styles.row}>
                    <TouchableOpacity style={styles.buttonClear} onPress={handleClear}>
                        <Text style={styles.buttonText}>Limpiar Lienzo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    title: {
        color: '#1D99CC',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    signatureContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    buttonClear: {
        backgroundColor: '#334155',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#475569',
    },
    buttonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
