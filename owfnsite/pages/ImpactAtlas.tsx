import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ImpactAtlasComponent } from '../components/ImpactAtlas.tsx';

export default function ImpactAtlas() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-serif text-accent-600 dark:text-darkAccent-400">{t('impact_atlas_title')}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('impact_atlas_subtitle')}
                </p>
            </div>
            
            <ImpactAtlasComponent />
        </div>
    );
}