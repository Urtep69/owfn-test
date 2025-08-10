
import React from 'react';
import { Handshake } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function Partnerships() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up text-center py-16">
            <Handshake className="mx-auto w-24 h-24 text-accent-400 mb-6" />
            <h1 className="text-4xl font-bold text-accent-300">{t('partnerships_title')}</h1>
            <p className="mt-4 text-xl text-primary-400 max-w-2xl mx-auto">
                {t('partnerships_subtitle')}
            </p>
            <p className="mt-4 text-lg text-primary-500">
                {t('partnerships_contact_info')}
            </p>
        </div>
    );
}
