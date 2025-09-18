

import React from 'react';
import { Handshake, Building, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';

export default function Partnerships() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up text-center py-8 max-w-4xl mx-auto space-y-12">
            <div>
                <Handshake className="mx-auto w-24 h-24 text-accent-500 dark:text-darkAccent-400 mb-6" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-300">{t('partnerships_title')}</h1>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d text-left">
                <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200 mb-4">{t('partnerships_focus_title')}</h2>
                <p className="text-lg text-primary-600 dark:text-darkPrimary-400 leading-relaxed">
                    {t('partnerships_focus_desc')}
                </p>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400 font-semibold">
                    {t('partnerships_post_presale_intro')}
                </p>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d text-left">
                 <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200 mb-4">{t('partnerships_vision_title')}</h2>
                <p className="text-lg text-primary-600 dark:text-darkPrimary-400 leading-relaxed">
                    {t('partnerships_vision_desc')}
                </p>
                <div className="mt-6 border-t border-primary-200 dark:border-darkPrimary-700 pt-6">
                    <h3 className="text-xl font-semibold mb-4">{t('partnerships_ideal_partner_title')}</h3>
                    <ul className="space-y-3 text-primary-600 dark:text-darkPrimary-400">
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_1')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_2')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_3')}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-accent-100/30 dark:bg-darkAccent-900/30 border-l-4 border-accent-500 dark:border-darkAccent-500 p-6 rounded-md text-left">
                 <h2 className="text-2xl font-bold text-accent-800 dark:text-darkAccent-200 mb-2">{t('partnerships_invitation_title')}</h2>
                 <p className="text-lg text-accent-700 dark:text-darkAccent-300">
                    {t('partnerships_invitation_desc')}
                </p>
                <p className="mt-4 font-semibold text-accent-800 dark:text-darkAccent-200">
                    partnerships@owfn.org
                </p>
            </div>
             <p className="text-md text-primary-500 dark:text-darkPrimary-500 pt-4">
                {t('partnerships_thank_you')}
            </p>
        </div>
    );
}