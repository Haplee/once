'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface SpacetimeContextType {
    isConnected: boolean;
}

const SpacetimeContext = createContext<SpacetimeContextType | undefined>(undefined);

export function SpacetimeDBProvider({ children }: { children: ReactNode }) {
    // Implementación mínima para asegurar que el children se renderice mientras el SDK se configura
    return (
        <SpacetimeContext.Provider value={{ isConnected: true }}>
            {children}
        </SpacetimeContext.Provider>
    );
}

export const useSpacetime = () => {
    const context = useContext(SpacetimeContext);
    if (!context) throw new Error('useSpacetime debe usarse dentro de SpacetimeDBProvider');
    return context;
};
