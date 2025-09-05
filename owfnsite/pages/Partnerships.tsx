import React from 'react';
import { Handshake, Building, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function Partnerships() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up text-center py-8 max-w-4xl mx-auto space-y-12">
            <div>
                <Handshake className="mx-auto w-24 h-24 text-primary mb-6" />
                <h1 className="text-4xl font-bold text-text-primary">{t('partnerships_title')}</h1>
            </div>

            <div className="bg-surface border border-border p-8 rounded-lg text-left">
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('partnerships_focus_title')}</h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                    {t('partnerships_focus_desc')}
                </p>
                <p className="mt-4 text-lg text-text-secondary font-semibold">
                    {t('partnerships_post_presale_intro')}
                </p>
            </div>

            <div className="bg-surface border border-border p-8 rounded-lg text-left">
                 <h2 className="text-2xl font-bold text-text-primary mb-4">{t('partnerships_vision_title')}</h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                    {t('partnerships_vision_desc')}
                </p>
                <div className="mt-6 border-t border-border pt-6">
                    <h3 className="text-xl font-semibold mb-4">{t('partnerships_ideal_partner_title')}</h3>
                    <ul className="space-y-3 text-text-secondary">
                        <li className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_1')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_2')}</span>
                        </li>
                        <li className="flex items-start">
                             <CheckCircle className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-1" />
                            <span>{t('partnerships_ideal_item_3')}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-md text-left">
                 <h2 className="text-2xl font-bold text-primary mb-2">{t('partnerships_invitation_title')}</h2>
                 <p className="text-lg text-text-secondary">
                    {t('partnerships_invitation_desc')}
                </p>
                <p className="mt-4 font-semibold text-text-primary">
                    partnerships@owfn.org
                </p>
            </div>
             <p className="text-md text-text-secondary pt-4">
                {t('partnerships_thank_you')}
            </p>
        </div>
    );
}