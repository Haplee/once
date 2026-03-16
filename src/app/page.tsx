'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Mic, Calculator as CalcIcon } from 'lucide-react';
import { API_ROUTES } from '@/lib/constants';
import { announceVoice } from '@/lib/announcer';
import ApiErrorMessage from '@/components/ApiErrorMessage';

export default function Home() {
    const { t, language } = useI18n();
    const [total, setTotal] = useState('');
    const [received, setReceived] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                announceVoice(t('voiceStart' as any) || 'Escuchando...', language);
            };
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                parseVoiceInput(transcript);
            };
        }
    }, [language, t]);

    const parseVoiceInput = (text: string) => {
        const numbers = text.match(/[\d]+([.,][\d]+)?/g);
        if (numbers && numbers.length >= 2) {
            setReceived(numbers[0].replaceAll(',', '.'));
            setTotal(numbers[1].replaceAll(',', '.'));
            announceVoice(t('voiceRecognized' as any) || 'Valores reconocidos', language);
        }
    };

    const calculate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setApiError(null);
        
        const tVal = parseFloat(total);
        const rVal = parseFloat(received);

        if (isNaN(tVal) || isNaN(rVal)) return;

        try {
            const resp = await fetch(API_ROUTES.CALCULATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total: tVal, received: rVal }),
            });
            const data = await resp.json();
            
            if (data.success) {
                setResult(data.change);
                const voiceMsg = `${t('speechChangeResultText')} ${data.change} euros`;
                announceVoice(voiceMsg, language);
            } else {
                setApiError(data.error);
            }
        } catch (err) {
            setApiError('Error de conexión');
        }
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.lang = language === 'en' ? 'en-US' : language === 'ca' ? 'ca-ES' : 'es-ES';
                recognitionRef.current.start();
            }
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h1 id="calculator-heading">{t('calculatorTitle')}</h1>
            
            <p className="sr-only" id="calc-instructions">
                Introduce el precio y el importe recibido para calcular el cambio. Puedes usar la voz pulsando el botón de micrófono.
            </p>

            <form onSubmit={calculate} className="form-centered" aria-labelledby="calculator-heading">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="total">{t('totalToPayLabel')}</label>
                    <input
                        type="number"
                        id="total"
                        className="form-input"
                        step="0.01"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        placeholder={t('totalToPayPlaceholder')}
                        aria-describedby="calc-instructions"
                        required
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="received">{t('amountReceivedLabel')}</label>
                    <input
                        type="number"
                        id="received"
                        className="form-input"
                        step="0.01"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                        placeholder={t('amountReceivedPlaceholder')}
                        required
                    />
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" id="calculate-btn" className="btn btn-primary w-100">
                        {t('calculateButton')}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-icon ${isListening ? 'listening' : ''}`}
                        onClick={toggleMic}
                        aria-label={t('voiceInputButtonLabel')}
                        aria-pressed={isListening}
                    >
                        <Mic size={24} aria-hidden="true" />
                    </button>
                </div>
            </form>

            {apiError && <ApiErrorMessage message={apiError} critical={true} />}

            <div 
                className="result-box mt-4" 
                role="region" 
                aria-live="polite" 
                aria-atomic="true"
                aria-label="Resultado del cálculo"
            >
                <p className="text-muted">
                    {t('changeResultText', { change: result !== null ? result.toFixed(2) : '--' })}
                </p>
                <div className="result-value">
                    {result !== null ? `€ ${result.toFixed(2)}` : '--'}
                </div>
            </div>
        </div>
    );
}
