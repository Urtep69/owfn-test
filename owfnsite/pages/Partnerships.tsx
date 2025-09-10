


import React from 'react';
import { Handshake, Building, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function Partnerships() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up text-center py-8 max-w-4xl mx-auto space-y-12">
            <div>
                <Handshake className="mx-auto w-24 h-24 text-primary-500 dark:text-primary-400 mb-6" />
                <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-300">{t('partnerships_title')}</h1>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg text-left">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('partnerships_focus_title')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('partnerships_focus_desc')}
                </p>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-semibold">
                    {t('partnerships_post_presale_intro')}
                </p>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg text-left">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('partnerships_vision_title')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('partnerships_vision_desc')}
                </p>
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-xl font-semibold mb-4">{t('partnerships_ideal_partner_title')}</h3>
                    <ul className="space-y-3 text-slate-600 dark:text-slate-400">
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

            <div className="bg-primary-500/10 border-l-4 border-primary-500 p-6 rounded-md text-left">
                 <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-2">{t('partnerships_invitation_title')}</h2>
                 <p className="text-lg text-primary-700 dark:text-primary-300">
                    {t('partnerships_invitation_desc')}
                </p>
                <p className="mt-4 font-semibold text-primary-800 dark:text-primary-200">
                    partnerships@owfn.org
                </p>
            </div>
             <p className="text-md text-slate-500 pt-4">
                {t('partnerships_thank_you')}
            </p>
        </div>
    );
}