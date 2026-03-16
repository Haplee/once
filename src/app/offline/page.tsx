'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="glass-panel text-center p-4">
            <WifiOff size={64} className="mb-2 text-error" />
            <h1>Estás sin conexión</h1>
            <p>Lo sentimos, esta página requiere una conexión a internet para funcionar correctamente.</p>
            <p>La calculadora básica e historial local podrían seguir disponibles si se han cacheado previamente.</p>
            <button 
                className="btn btn-primary mt-4" 
                onClick={() => window.location.reload()}
            >
                Reintentar
            </button>
        </div>
    );
}
