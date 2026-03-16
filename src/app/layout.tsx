import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import { SpacetimeDBProvider } from '@/providers/SpacetimeDBProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import NextAuthProvider from '@/providers/NextAuthProvider';
import OfflineBanner from '@/components/OfflineBanner';
import SkipLink from '@/components/SkipLink';

export const metadata: Metadata = {
    title: 'Calculadora de Cambio - ONCE App',
    description: 'Aplicación de calculadora accesible para la ONCE',
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    themeColor: '#00853F',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                    <NextAuthProvider>
                        <I18nProvider>
                            <ErrorBoundary>
                                <SpacetimeDBProvider>
                                    <div id="a11y-announcer" className="sr-only" aria-live="polite" aria-atomic="true"></div>
                                    <SkipLink />
                                    <OfflineBanner />
                                    <div className="bg-blobs">
                                        <div className="blob blob-1"></div>
                                        <div className="blob blob-2"></div>
                                    </div>
                                    <Navbar />
                                    <main className="main-container" id="main-content" role="main" aria-label="Contenido principal">
                                        {children}
                                    </main>
                                </SpacetimeDBProvider>
                            </ErrorBoundary>
                        </I18nProvider>
                    </NextAuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
