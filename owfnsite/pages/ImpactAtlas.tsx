import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Globe } from 'lucide-react';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';

// This will be a placeholder for a more complex component
const AtlasComponent = () => {
    const { t } = useAppContext();
    return (
        <div className="w-full h-[60vh] bg-primary-200 dark:bg-darkPrimary-800 rounded-lg flex items-center justify-center">
            <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold">{t('coming_soon_title')}...</p>
        </div>
    );
};

export default function ImpactAtlas() {
    const { t } = useAppContext();
    
    return (
         <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_atlas_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('impact_atlas_subtitle')}
                </p>
            </div>
            
            <ComingSoonWrapper>
                <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d">
                    <AtlasComponent />
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>{t('active_project')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>{t('completed_project')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                            <span>{t('recent_donation')}</span>
                        </div>
                    </div>
                </div>
            </ComingSoonWrapper>
        </div>
    );
}
