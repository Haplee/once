'use client';

import React, { useEffect } from 'react';
import { announceVoice } from '@/lib/announcer';
import { useI18n } from '@/lib/i18n';

interface Props {
    message: string;
    critical?: boolean;
}

export default function ApiErrorMessage({ message, critical = false }: Props) {
    const { language } = useI18n();

    useEffect(() => {
        if (message) {
            announceVoice(message, language);
        }
    }, [message, language]);

    return (
        <div 
            className={`api-error-message p-2 mt-2 ${critical ? 'critical' : 'polite'}`}
            role="alert" 
            aria-live={critical ? 'assertive' : 'polite'}
        >
            <p className="flex items-center gap-2">
                <span aria-hidden="true">⚠️</span>
                {message}
            </p>
            <style jsx>{`
                .api-error-message {
                    border-radius: 8px;
                    font-weight: 500;
                }
                .critical {
                    background: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #ef4444;
                }
                .polite {
                    background: #fef3c7;
                    color: #92400e;
                    border: 1px solid #f59e0b;
                }
            `}</style>
        </div>
    );
}
