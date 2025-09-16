
import React from 'react';
import { AllocationChart } from '../components/AllocationChart.js';
import { TOKEN_DETAILS, TOKEN_ALLOCATIONS } from '../lib/constants.js';
import { useAppContext } from '../contexts/AppContext.js';
import { OwfnIcon } from '../components/IconComponents.js';
import { SEO } from '../components/SEO.js';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-primary-200 dark:border-darkPrimary-700">
        <span className="text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <span className="font-semibold text-primary-900 dark:text-darkPrimary-100 text-right">{value}</span>
    </div>
);

export default function Tokenomics() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up">
            <SEO titleKey="seo_tokenomics_title" descriptionKey="seo_tokenomics_description" />
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('tokenomics_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('tokenomics_subtitle')}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-6">{t('tokenomics_details_title')}</h2>
                    <div className="space-y-2">
                        <DetailItem 
                            label={t('total_supply')} 
                            value={
                                <div className="flex items-center justify-end space-x-2">
                                    <span>{TOKEN_DETAILS.totalSupply.toLocaleString()} B</span>
                                    <OwfnIcon className="w-5 h-5" />
                                    <span>OWFN</span>
                                </div>
                            } 
                        />
                        <DetailItem label={t('token_decimals')} value={TOKEN_DETAILS.decimals} />
                        <DetailItem label={t('token_standard')} value={TOKEN_DETAILS.standard} />
                        <DetailItem label={t('token_extensions')} value={TOKEN_DETAILS.extensions} />
                        <DetailItem label={t('presale_price')} value={TOKEN_DETAILS.presalePrice} />
                        <DetailItem label={t('launch_price')} value={TOKEN_DETAILS.dexLaunchPrice} />
                    </div>
                </div>

                <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-6">{t('tokenomics_allocation_title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TOKEN_ALLOCATIONS.map(alloc => (
                            <div key={alloc.name} className="flex items-center space-x-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: alloc.color }}></div>
                                <span className="text-sm">{alloc.name} ({alloc.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('tokenomics_chart_title')}</h2>
                <AllocationChart />
            </div>
        </div>
    );
}