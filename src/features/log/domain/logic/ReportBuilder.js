export class ReportBuilder {
    static buildSchema(workLog, engineerName = "Ingeniero Residente", extraInfo = {}) {
        const data = workLog.toJSON();
        const { employeeId = "N/A", miniGranja = "SunSite Engine" } = extraInfo;

        // Default sections if none provided
        const defaultSections = {
            avances: [],
            actividades: [data.description],
            retos: [],
            pendientes: []
        };

        const sections = data.sections || defaultSections;

        return {
            header: {
                projectName: miniGranja,
                engineer: engineerName,
                employeeId: employeeId,
                date: new Date(data.timestamp).toLocaleDateString(),
                reportId: `B-LL-${data.id.slice(-6).toUpperCase()}`
            },
            sections: {
                avances: (sections.avances || []).filter(a => a.task || a.progress),
                actividades: (sections.actividades || []).filter(a => a && a.trim() !== ""),
                retos: (sections.retos || []).filter(r => r && r.trim() !== ""),
                pendientes: (sections.pendientes || []).filter(p => p && p.trim() !== "")
            },
            signature: data.signature,
            folId: data.id
        };
    }

    static buildConsolidatedSchema(workLogs, engineerName = "Ingeniero Residente") {
        if (!workLogs || workLogs.length === 0) return null;

        const consolidated = {
            avances: [],
            actividades: [],
            retos: [],
            pendientes: []
        };

        workLogs.forEach(log => {
            const data = log.toJSON();
            // Default sections if none provided in workLog
            const sections = data.sections || {
                avances: [],
                actividades: [data.description],
                retos: [],
                pendientes: []
            };

            if (sections.avances) consolidated.avances.push(...sections.avances);
            if (sections.actividades) consolidated.actividades.push(...sections.actividades);
            if (sections.retos) consolidated.retos.push(...sections.retos);
            if (sections.pendientes) consolidated.pendientes.push(...sections.pendientes);
        });

        // Use the date of the first log for the header
        const baseDate = new Date(workLogs[0].timestamp).toLocaleDateString();

        return {
            header: {
                projectName: "SunSite - REPORTE DIARIO",
                engineer: engineerName,
                date: baseDate,
                reportId: `DAILY-${baseDate.replace(/\//g, '')}`
            },
            sections: {
                avances: consolidated.avances.filter(a => a.task || a.progress),
                actividades: consolidated.actividades.filter(a => a && a.trim() !== ""),
                retos: consolidated.retos.filter(r => r && r.trim() !== ""),
                pendientes: consolidated.pendientes.filter(p => p && p.trim() !== "")
            },
            signature: workLogs[workLogs.length - 1].signature, // Use latest signature
            folId: "CONSOLIDATED"
        };
    }
}
