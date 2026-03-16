'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import { LogIn, LogOut, User } from "lucide-react";

export default function AuthButton() {
    const { data: session, status } = useSession();
    const { t } = useI18n();

    if (status === "loading") {
        return <div className="btn btn-icon opacity-50" aria-hidden="true">...</div>;
    }

    if (session) {
        return (
            <div className="d-flex align-items-center gap-2">
                <span className="sr-only">{t('authWelcome' as any)} {session.user?.name}</span>
                {session.user?.image && (
                    <img 
                        src={session.user.image} 
                        alt="" 
                        className="rounded-full w-8 h-8" 
                        aria-hidden="true" 
                    />
                )}
                <button
                    onClick={() => signOut()}
                    className="btn btn-icon"
                    title={t('authSignOut' as any)}
                    aria-label={t('authSignOut' as any)}
                >
                    <LogOut size={20} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn()}
            className="btn btn-icon"
            title={t('authSignIn' as any)}
            aria-label={t('authSignIn' as any)}
        >
            <LogIn size={20} />
        </button>
    );
}
