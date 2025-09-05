import React from 'react';
import { AllocationChart } from '../components/AllocationChart.tsx';
import { TOKEN_DETAILS, TOKEN_ALLOCATIONS } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from '../components/IconComponents.tsx';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-border">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary text-right">{value}</span>
    </div>
);

export default function Tokenomics() {
    const { t } = useAppContext();

    // Use a color map from the constants to apply to the text
    const allocationColorMap = TOKEN_ALLOCATIONS.reduce((acc, curr) => {
        acc[curr.name] = curr.color;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-primary">{t('tokenomics_title')}</h1>
                <p className="mt-4 text-lg text-text-secondary">
                    {t('tokenomics_subtitle')}
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">{t('tokenomics_details_title')}</h2>
                    <div className="space-y-2">
                        <DetailItem 
                            label={t('total_supply')} 
                            value={
                                <div className="flex items-center justify-end space-x-2">
                                    <span>{TOKEN_DETAILS.totalSupply.toLocaleString()}</span>
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

                <div className="lg:col-span-3 bg-surface border border-border p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">{t('tokenomics_allocation_title')}</h2>
                    <div className="space-y-3">
                        {TOKEN_ALLOCATIONS.map(alloc => (
                            <div key={alloc.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }}></div>
                                    <span className="text-sm text-text-primary">{alloc.name}</span>
                                </div>
                                <span className="font-semibold text-text-primary">{alloc.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-surface border border-border p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('tokenomics_chart_title')}</h2>
                <AllocationChart />
            </div>
        </div>
    );
}