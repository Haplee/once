'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { announceVoice } from '@/lib/announcer';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const { t, language } = useI18n();

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            const msg = t('onlineMessage' as any) || 'Conexión restablecida';
            announceVoice(msg, language);
        };

        const handleOffline = () => {
            setIsOnline(false);
            const msg = t('offlineMessage' as any) || 'Sin conexión a internet';
            announceVoice(msg, language);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [language, t]);

    if (isOnline) return null;

    return (
        <div 
            className="offline-banner" 
            role="alert" 
            aria-live="assertive"
        >
            <WifiOff size={20} />
            <span>{t('offlineMessage' as any) || 'Sin conexión a internet. Algunas funciones pueden no estar disponibles.'}</span>
            <style jsx>{`
                .offline-banner {
                    background: #dc2626;
                    color: white;
                    padding: 0.5rem 1rem;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 9999;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}
