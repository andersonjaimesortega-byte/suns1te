import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

export class PdfGenerator {
    static async generateReport(reportData) {
        try {
            const { header, sections, signature } = reportData;

            // Render table helper
            const renderTable = (title, items, type = 'list') => {
                if (!items || items.length === 0) return '';
                let content = '';
                if (type === 'avances') {
                    content = `
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f1f5f9;">
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; color: #1e293b;">Ítem / Actividad</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #1e293b; width: 80px;">Avance</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #1e293b; width: 80px;">Unidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(i => `
                                    <tr>
                                        <td style="border: 1px solid #e2e8f0; padding: 8px; color: #334155;">${i.task}</td>
                                        <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; color: #334155;">${i.progress}</td>
                                        <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; color: #334155;">${i.unit || '%'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                } else {
                    content = `
                        <div style="background-color: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                            <ul style="margin: 0; padding-left: 20px; color: #334155;">
                                ${items.map(i => `<li style="margin-bottom: 5px; line-height: 1.4; word-wrap: break-word;">${i}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
                return `
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #0f172a; text-transform: uppercase; font-size: 14px; border-left: 4px solid #3BB339; padding-left: 10px; margin-bottom: 12px;">${title}</h3>
                        ${content}
                    </div>
                `;
            };

            const html = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            @page { margin: 20mm; }
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; }
                            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
                            .header-title { color: #0f172a; font-size: 24px; font-weight: bold; margin: 0; }
                            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 40px; font-size: 13px; }
                            .meta-item { color: #64748b; }
                            .meta-value { color: #1e293b; font-weight: bold; }
                            .footer { margin-top: 60px; display: flex; justify-content: flex-end; }
                            .sig-box { text-align: center; width: 250px; }
                            .sig-img { width: 200px; height: 80px; object-fit: contain; border-bottom: 1px solid #0f172a; margin-bottom: 5px; }
                            .app-tag { margin-top: 100px; text-align: center; font-size: 10px; color: #94a3b8; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <h1 class="header-title">INFORME TÉCNICO DIARIO</h1>
                                <div style="color: #1D99CC; font-weight: bold; font-size: 14px; margin-top: 5px;">${header.projectName}</div>
                            </div>
                            <div style="text-align: right; font-size: 12px;">
                                <div><strong>FOLIO:</strong> ${header.reportId}</div>
                                <div><strong>FECHA:</strong> ${header.date}</div>
                            </div>
                        </div>
                        <div class="meta-grid">
                            <div class="meta-item">RESIDENTE: <span class="meta-value">${header.engineer}</span></div>
                            <div class="meta-item">ID EMPLEADO: <span class="meta-value">${header.employeeId}</span></div>
                        </div>
                        ${renderTable('1. Avances Físicos', sections.avances, 'avances')}
                        ${renderTable('2. Actividades Realizadas', sections.actividades)}
                        ${renderTable('3. Retos y Riesgos Detectados', sections.retos)}
                        ${renderTable('4. Pendientes Próximo Turno', sections.pendientes)}
                        <div class="footer">
                            <div class="sig-box">
                                ${signature === 'DATA:SUNSITE_DIGITAL_SIG'
                    ? `<div style="height: 80px; display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #0f172a; margin-bottom: 5px; font-family: 'Courier New', Courier, monospace; color: #1D99CC; font-weight: bold; font-size: 14px;">
                                         /// FIRMA DIGITAL SUNSITE RECONOCIDA ///
                                       </div>`
                    : (signature ? `<img src="${signature}" class="sig-img" />` : '<div style="height: 80px; border-bottom: 1px solid #0f172a; margin-bottom: 5px;"></div>')
                }
                                <div style="font-size: 12px; font-weight: bold; color: #0f172a;">${header.engineer}</div>
                                <div style="font-size: 10px; color: #64748b;">Firma de Responsabilidad</div>
                            </div>
                        </div>
                        <div class="app-tag">Este documento es una bitácora técnica legal generada digitalmente por SunSite.</div>
                    </body>
                </html>
            `;

            if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.print();

                // Web Share API support
                if (navigator.share) {
                    try {
                        const blob = new Blob([html], { type: 'text/html' });
                        const file = new File([blob], `Reporte_${header.reportId}.html`, { type: 'text/html' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Reporte SunSite',
                                text: `Reporte diario de obra: ${header.projectName}`,
                            });
                        }
                    } catch (e) {
                        console.warn('Web Share failed:', e);
                    }
                }
                return;
            }

            console.log('PDF: Generando archivo temporal...');
            const { uri: tempUri } = await Print.printToFileAsync({ html });

            // Mover a cache con nombre limpio
            const fileName = `Reporte_${header.reportId}.pdf`;
            const finalUri = `${FileSystem.cacheDirectory}${fileName}`;
            await FileSystem.moveAsync({ from: tempUri, to: finalUri });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                console.log('PDF: Iniciando compartido...');
                await Sharing.shareAsync(finalUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Enviar Reporte'
                });
            } else {
                throw new Error('Sistema de compartir no disponible');
            }

        } catch (error) {
            console.error('Error detallado en PdfGenerator:', error);
            throw error;
        }
    }

    static async debugTest() {
        try {
            const { uri } = await Print.printToFileAsync({ html: '<h1>Test</h1>' });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error('PDF: Error en debugTest:', error);
        }
    }
}
