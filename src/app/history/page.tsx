'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { OperationHistory } from '@/module_bindings';
import { API_ROUTES } from '@/lib/constants';
import { Trash2, RefreshCcw } from 'lucide-react';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import ExportButtons from '@/components/ExportButtons';

export default function HistoryPage() {
    const { t } = useI18n();
    const [history, setHistory] = useState<OperationHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_ROUTES.HISTORY);
            if (!resp.ok) {
                if (resp.status === 429) throw new Error(t('errorRateLimit' as any));
                throw new Error(t('historyLoadError'));
            }
            const data = await resp.json();
            setHistory(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        if (!confirm(t('historyClearConfirm' as any) || "¿Borrar todo el historial?")) return;
        try {
            const resp = await fetch(API_ROUTES.HISTORY, { method: 'DELETE' });
            if (resp.ok) {
                setHistory([]);
            }
        } catch (err) {
            setError(t('historyClearError' as any) || "Error al borrar historial");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <h1 id="history-heading">{t('historyTitle')}</h1>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-icon" 
                        onClick={fetchHistory} 
                        aria-label="Recargar historial"
                        title="Recargar"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    {history.length > 0 && (
                        <>
                            <ExportButtons operations={history} />
                            <button 
                                className="btn btn-icon text-error" 
                                onClick={clearHistory} 
                                aria-label="Limpiar historial"
                                title="Borrar historial"
                            >
                                <Trash2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && <ApiErrorMessage message={error} critical={true} />}

            {loading ? (
                <div className="text-center p-4" aria-busy="true">
                    <div className="spinner" aria-hidden="true"></div>
                    <p>{t('loading' as any) || "Cargando..."}</p>
                </div>
            ) : history.length === 0 ? (
                <p className="text-center text-muted" role="status">{t('noHistory')}</p>
            ) : (
                <div className="table-container">
                    <table className="w-100" aria-labelledby="history-heading">
                        <caption className="sr-only">Listado de operaciones calculadas recientemente</caption>
                        <thead>
                            <tr>
                                <th scope="col">{t('historyHeaderDate')}</th>
                                <th scope="col">{t('historyHeaderTotal')}</th>
                                <th scope="col">{t('historyHeaderReceived')}</th>
                                <th scope="col">{t('historyHeaderChange')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id.toString()}>
                                    <td>{new Date(Number(item.timestamp)).toLocaleString()}</td>
                                    <td>€ {item.price.toFixed(2)}</td>
                                    <td>€ {item.amountGiven.toFixed(2)}</td>
                                    <td className="text-primary font-bold">€ {item.change.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
