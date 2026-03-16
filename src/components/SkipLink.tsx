'use client';

import React from 'react';

export default function SkipLink() {
    return (
        <a 
            href="#main-content" 
            className="skip-link"
            aria-label="Saltar al contenido principal"
        >
            Saltar al contenido
            <style jsx>{`
                .skip-link {
                    position: absolute;
                    top: -100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--primary);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    z-index: 10000;
                    text-decoration: none;
                    font-weight: 700;
                    transition: top 0.2s ease;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                .skip-link:focus {
                    top: 0;
                    outline: 3px solid var(--accent);
                }
            `}</style>
        </a>
    );
}
