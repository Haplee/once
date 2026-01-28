'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { HistoryItem } from '@/types/models';

export default function HistoryPage() {
    const { t } = useI18n();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const resp = await fetch('/api/history');
            if (!resp.ok) throw new Error('Failed to fetch');
            const data = await resp.json();
            setHistory(data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h1>{t('historyTitle')}</h1>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>{t('historyHeaderDate')}</th>
                            <th>{t('historyHeaderTotal')}</th>
                            <th>{t('historyHeaderReceived')}</th>
                            <th>{t('historyHeaderChange')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="text-center">{t('historyLoadError')}</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan={4} className="text-center">{t('noHistory')}</td></tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item.id}>
                                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                                    <td>€ {item.total_amount.toFixed(2)}</td>
                                    <td>€ {item.amount_received.toFixed(2)}</td>
                                    <td><strong>€ {item.change_returned.toFixed(2)}</strong></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
