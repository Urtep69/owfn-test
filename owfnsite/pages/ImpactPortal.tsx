import React, { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { CaseCard } from '../components/CaseCard.tsx';
import { PlusCircle } from 'lucide-react';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';

export default function ImpactPortal() {
    const { t, socialCases, solana } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<'all' | 'health' | 'education' | 'basic-needs'>('all');

    const filteredCases = useMemo(() => {
        if (activeCategory === 'all') {
            return socialCases;
        }
        return socialCases.filter(c => c.category === activeCategory);
    }, [socialCases, activeCategory]);

    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;

    const categories = ['all', 'health', 'education', 'basic-needs'];

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_portal')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('social_cases_desc')}
                </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeCategory === cat ? 'bg-accent-500 text-white dark:bg-darkAccent-500 dark:text-darkPrimary-950' : 'bg-primary-200 dark:bg-darkPrimary-700 hover:bg-primary-300 dark:hover:bg-darkPrimary-600'}`}
                    >
                        {cat === 'all' ? t('faq_category_all') : t(`category_${cat}`)}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCases.map(c => <CaseCard key={c.id} socialCase={c} />)}
            </div>
        </div>
    );
}
