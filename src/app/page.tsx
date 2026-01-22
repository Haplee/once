'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Mic, Calculator as CalcIcon } from 'lucide-react';

export default function Home() {
    const { t, language } = useI18n();
    const [total, setTotal] = useState('');
    const [received, setReceived] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                parseVoiceInput(transcript);
            };
            recognitionRef.current.onerror = (e: any) => {
                console.error('Recognition error:', e);
                setIsListening(false);
            };
        }
    }, [language]);

    const parseVoiceInput = (text: string) => {
        const numbers = text.match(/[\d]+([.,][\d]+)?/g);
        if (numbers && numbers.length >= 2) {
            setReceived(numbers[0].replace(',', '.'));
            setTotal(numbers[1].replace(',', '.'));
            // Auto-calculate after state updates (need a way to trigger sync calculation or use effect)
        }
    };

    const calculate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const tVal = parseFloat(total);
        const rVal = parseFloat(received);

        if (isNaN(tVal) || isNaN(rVal)) return;

        try {
            const resp = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total: tVal, received: rVal }),
            });
            const data = await resp.json();
            if (data.success) {
                setResult(data.change);
                announceResult(data.change);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const announceResult = (change: number) => {
        const text = `${t('speechChangeResultText')} ${change} euros`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
        window.speechSynthesis.speak(utterance);
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.lang = language === 'en' ? 'en-US' : 'es-ES';
                recognitionRef.current.start();
            } else {
                alert(t('voiceErrorUnsupported'));
            }
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h1 className="text-center">{t('calculatorTitle')}</h1>

            <form onSubmit={calculate} className="form-centered">
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
                        title={t('voiceInputButtonLabel')}
                    >
                        <Mic size={24} />
                    </button>
                </div>
            </form>

            <div className="result-box">
                <span className="text-muted">
                    {t('changeResultText').replace('{change}', result !== null ? result.toFixed(2) : '--')}
                </span>
                <span id="result-value" className="result-value">
                    {result !== null ? `€ ${result.toFixed(2)}` : '--'}
                </span>
            </div>
        </div>
    );
}
