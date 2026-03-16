'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import AuthButton from './AuthButton';

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useI18n();

    return (
        <nav className="navbar glass-panel" aria-label={t('navAriaLabel' as any) || 'Navegación principal'}>
            <Link href="/" className="logo">
                <img src="/static/img/logo.png" alt="ONCE" height="42"
                    onError={(e) => {
                        (e.target as any).style.display = 'none';
                        (e.target as any).nextElementSibling.style.display = 'block';
                    }} />
                <span style={{ display: 'none', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '1px' }}>ONCE</span>
            </Link>
            <div className="nav-links">
                <Link href="/" className={pathname === '/' ? 'active' : ''} aria-current={pathname === '/' ? 'page' : undefined}>
                    {t('navCalculator')}
                </Link>
                <Link href="/history" className={pathname === '/history' ? 'active' : ''} aria-current={pathname === '/history' ? 'page' : undefined}>
                    {t('navHistory')}
                </Link>
                <Link href="/configuracion" className={pathname === '/configuracion' ? 'active' : ''} aria-current={pathname === '/configuracion' ? 'page' : undefined}>
                    {t('navSettings')}
                </Link>
            </div>
            <div className="nav-actions" style={{ marginLeft: '1rem' }}>
                <AuthButton />
            </div>
        </nav>
    );
}
