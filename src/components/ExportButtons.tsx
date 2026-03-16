'use client';

import React from 'react';
import { FileDown, FileText } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { OperationHistory } from '@/module_bindings';
import { announceVoice } from '@/lib/announcer';

interface Props {
    operations: OperationHistory[];
}

export default function ExportButtons({ operations }: Props) {
    const { t, language } = useI18n();

    const handleCSV = () => {
        exportToCSV(operations, t);
        announceVoice(t('exportSuccessCSV' as any) || "Archivo CSV descargado con éxito", language);
    };

    const handlePDF = async () => {
        await exportToPDF(operations, t);
        announceVoice(t('exportSuccessPDF' as any) || "Archivo PDF descargado con éxito", language);
    };

    return (
        <div className="d-flex gap-2">
            <button 
                className="btn btn-icon" 
                onClick={handleCSV}
                title={t('exportCSV' as any) || "Exportar a CSV"}
                aria-label={t('exportCSV' as any) || "Exportar historial a formato CSV"}
            >
                <FileDown size={20} aria-hidden="true" />
                <span className="sr-only">CSV</span>
            </button>
            <button 
                className="btn btn-icon" 
                onClick={handlePDF}
                title={t('exportPDF' as any) || "Exportar a PDF"}
                aria-label={t('exportPDF' as any) || "Exportar historial a formato PDF"}
            >
                <FileText size={20} aria-hidden="true" />
                <span className="sr-only">PDF</span>
            </button>
        </div>
    );
}
