'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { announceVoice } from '@/lib/announcer';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    language?: string;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        
        // Anuncio auditivo crítico
        const message = this.props.language === 'en' 
            ? 'An error has occurred. Please reload the application.' 
            : 'Ha ocurrido un error. Por favor, recarga la aplicación.';
        
        announceVoice(message, this.props.language);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-fallback p-4 text-center glass-panel" role="alert" aria-live="assertive">
                    <h2 className="text-error">Algo ha salido mal</h2>
                    <p>La aplicación ha encontrado un error inesperado.</p>
                    <button 
                        className="btn btn-primary mt-2" 
                        onClick={() => window.location.reload()}
                        aria-label="Recargar aplicación"
                    >
                        Reintentar
                    </button>
                    <style jsx>{`
                        .error-fallback {
                            border: 2px solid red;
                            background: rgba(255, 0, 0, 0.1);
                        }
                        h2 { color: #d32f2f; }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
