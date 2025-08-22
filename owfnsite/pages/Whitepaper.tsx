import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { TOKEN_DETAILS, TOKEN_ALLOCATIONS, DISTRIBUTION_WALLETS, ROADMAP_DATA, PROJECT_LINKS } from '../constants.ts';
import { AllocationChart } from '../components/AllocationChart.tsx';
import { OwfnIcon } from '../components/IconComponents.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { CheckCircle, Users, BarChart2, Map as MapIcon, Star, Link as LinkIcon, FileText } from 'lucide-react';

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <section className="glassmorphism p-8 rounded-xl mb-12">
        <div className="flex items-center mb-6">
            <div className="bg-surface-2 text-accent rounded-full p-3 mr-4">
                {icon}
            </div>
            <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
        </div>
        <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed prose-strong:text-text-primary prose-headings:text-text-primary">
            {children}
        </div>
    </section>
);

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-border-color">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-semibold text-text-primary text-left sm:text-right">{value}</span>
    </div>
);

export default function Whitepaper() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up">
            <header className="text-center mb-16">
                <FileText className="mx-auto w-20 h-20 text-accent mb-4" />
                <h1 className="text-5xl font-display font-extrabold text-accent">{t('whitepaper_title')}</h1>
                <p className="mt-4 text-xl text-text-secondary max-w-3xl mx-auto">
                    {t('whitepaper_subtitle')}
                </p>
            </header>

            <Section title={t('about_mission_title')} icon={<CheckCircle />}>
                <p>{t('about_mission_desc')}</p>
                <p className="mt-4">{t('about_vision_desc')}</p>
            </Section>

            <Section title={t('tokenomics_title')} icon={<BarChart2 />}>
                <h3 className="text-2xl font-bold mb-4">{t('tokenomics_details_title')}</h3>
                <div className="space-y-2 mb-8">
                    <DetailItem 
                        label={t('total_supply')} 
                        value={
                            <div className="flex items-center justify-start sm:justify-end space-x-2">
                                <span>{TOKEN_DETAILS.totalSupply.toLocaleString()} B</span>
                                <OwfnIcon className="w-5 h-5" />
                                <span>OWFN</span>
                            </div>
                        } />
                    <DetailItem label={t('token_decimals')} value={TOKEN_DETAILS.decimals} />
                    <DetailItem label={t('token_standard')} value={TOKEN_DETAILS.standard} />
                    <DetailItem label={t('token_extensions')} value={TOKEN_DETAILS.extensions} />
                    <DetailItem label={t('presale_price')} value={TOKEN_DETAILS.presalePrice} />
                    <DetailItem label={t('launch_price')} value={TOKEN_DETAILS.dexLaunchPrice} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('tokenomics_allocation_title')}</h3>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <AllocationChart />
                    </div>
                    <div className="space-y-3">
                        {TOKEN_ALLOCATIONS.map(alloc => (
                            <div key={alloc.name} className="flex items-center space-x-3">
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: alloc.color }}></div>
                                <span className="text-base">{alloc.name} - <strong>{alloc.percentage}%</strong></span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section title={t('wallet_monitor')} icon={<Users />}>
                <p className="mb-6">{t('wallet_monitor_desc')}</p>
                <div className="space-y-4">
                    <DetailItem label={t('wallet_name_presale')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.presale} />} />
                    <DetailItem label={t('wallet_name_impact_treasury')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.impactTreasury} />} />
                    <DetailItem label={t('wallet_name_community')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.community} />} />
                    <DetailItem label={t('wallet_name_team')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.team} />} />
                    <DetailItem label={t('wallet_name_marketing')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.marketing} />} />
                    <DetailItem label={t('wallet_name_advisors')} value={<AddressDisplay address={DISTRIBUTION_WALLETS.advisors} />} />
                </div>
            </Section>

            <Section title={t('roadmap_title')} icon={<MapIcon />}>
                <div className="relative border-l-2 border-border-color ml-4 pl-8 space-y-8">
                    {ROADMAP_DATA.map((phase) => (
                        <div key={phase.quarter} className="relative">
                             <div className="absolute -left-[42px] top-1 w-6 h-6 bg-accent rounded-full border-4 border-background"></div>
                            <p className="font-semibold text-accent">{phase.quarter}</p>
                            <h4 className="font-bold text-xl">{t(`${phase.key_prefix}_title`)}</h4>
                            <p>{t(`${phase.key_prefix}_description`)}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title={t('whitepaper_features_title')} icon={<Star />}>
                <p className="mb-4">{t('whitepaper_features_desc')}</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>{t('presale')}:</strong> {t('whitepaper_feature_presale')}</li>
                    <li><strong>{t('donations')}:</strong> {t('whitepaper_feature_donations')}</li>
                    <li><strong>{t('dashboard')}:</strong> {t('whitepaper_feature_dashboard')}</li>
                    <li><strong>{t('impact_portal')}:</strong> {t('whitepaper_feature_impact_portal')}</li>
                </ul>
            </Section>
            
            <Section title={t('whitepaper_community_title')} icon={<LinkIcon />}>
                <p className="mb-4">{t('whitepaper_community_desc')}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <a href={PROJECT_LINKS.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Website</a>
                    <a href={PROJECT_LINKS.x} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">X.com (Twitter)</a>
                    <a href={PROJECT_LINKS.telegramGroup} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Telegram Group</a>
                    <a href={PROJECT_LINKS.discord} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Discord</a>
                </div>
            </Section>
        </div>
    );
}