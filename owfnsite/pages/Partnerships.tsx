import React from 'react';
import { Handshake, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';

export default function Partnerships() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in text-center py-8 max-w-4xl mx-auto space-y-12">
            <div>
                <Handshake className="mx-auto w-24 h-24 text-dextools-accent-blue mb-6" />
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('partnerships_title')}</h1>
            </div>

            <div className="bg-dextools-card border border-dextools-border p-8 rounded-md text-left">
                <h2 className="text-2xl font-bold text-dextools-text-primary mb-4">{t('partnerships_focus_title')}</h2>
                <p className="text-lg text-dextools-text-secondary leading-relaxed">
                    {t('partnerships_focus_desc')}
                </p>
                <p className="mt-4 text-lg text-dextools-text-secondary font-semibold">
                    {t('partnerships_post_presale_intro')}
                </p>
            </div>

            <div className="bg-dextools-card border border-dextools-border p-8 rounded-md text-left">
                 <h2 className="text-2xl font-bold text-dextools-text-primary mb-4">{t('partnerships_vision_title')}</h2>
                <p className="text-lg text-dextools-text-secondary leading-relaxed">
                    {t('partnerships_vision_desc')}
                </p>
                <div className="mt-6 border-t border-dextools-border pt-6">
                    <h3 className="text-xl font-semibold mb-4 text-dextools-text-primary">{t('partnerships_ideal_partner_title')}</h3>
                    <ul className="space-y-3 text-dextools-text-secondary">
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-dextools-accent-green mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_1')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-dextools-accent-green mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_2')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-dextools-accent-green mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_3')}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-dextools-special/10 border-l-4 border-dextools-special p-6 rounded-md text-left">
                 <h2 className="text-2xl font-bold text-dextools-text-primary mb-2">{t('partnerships_invitation_title')}</h2>
                 <p className="text-lg text-dextools-text-secondary">
                    {t('partnerships_invitation_desc')}
                </p>
                <p className="mt-4 font-semibold text-dextools-accent-blue">
                    partnerships@owfn.org
                </p>
            </div>
             <p className="text-md text-dextools-text-secondary pt-4">
                {t('partnerships_thank_you')}
            </p>
        </div>
    );
}