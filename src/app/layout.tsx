import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Calculadora de Cambio - ONCE App',
    description: 'Aplicación de calculadora accesible para la ONCE',
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
                    <I18nProvider>
                        <div className="bg-blobs">
                            <div className="blob blob-1"></div>
                            <div className="blob blob-2"></div>
                        </div>
                        <Navbar />
                        <main className="main-container">
                            {children}
                        </main>
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
