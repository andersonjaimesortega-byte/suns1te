export class ConstructionValidator {
    static validateLog(title, description, category) {
        const errors = [];

        if (title.length < 5) {
            errors.push("El título debe ser más descriptivo (mínimo 5 caracteres).");
        }

        if (description.length < 10) {
            errors.push("La descripción parece muy corta para un registro de obra.");
        }

        // Lógica específica de ingeniería civil
        const techKeywords = ['concreto', 'hormigón', 'acero', 'losa', 'zapata', 'encofrado', 'viga', 'columna', 'nivel'];
        const hasTechTerm = techKeywords.some(keyword =>
            description.toLowerCase().includes(keyword) || title.toLowerCase().includes(keyword)
        );

        if (!hasTechTerm) {
            // No bloqueamos, pero sugerimos ser más técnico
            errors.push("Sugerencia: Intenta incluir términos técnicos (ej: nivel, elemento estructural, material).");
        }

        return {
            isValid: errors.length === 0 || (errors.length === 1 && errors[0].includes("Sugerencia")),
            errors: errors.filter(e => !e.startsWith("Sugerencia")),
            suggestions: errors.filter(e => e.startsWith("Sugerencia"))
        };
    }
}
