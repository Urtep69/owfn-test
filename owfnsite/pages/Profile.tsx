import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Vote, Gem, Loader2, ChevronDown, Info, ShoppingCart, Gift, HelpCircle } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ImpactBadge, PresaleHistoryTransaction, DonationHistoryTransaction } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.js';
import { formatNumber } from '../lib/utils.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.js';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const ActivityAccordion = ({ title, summary, children, defaultOpen = false }: { title: string, summary: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-primary-50 dark:bg-darkPrimary-800/50 rounded-lg border border-primary-200 dark:border-darkPrimary-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">{title}</span>
                    <div className="hidden sm:block">{summary}</div>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const ActivitySkeletonLoader = () => (
    <div className="space-y-4">
        <div className="h-16 bg-primary-200 dark:bg-darkPrimary-700 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-primary-200 dark:bg-darkPrimary-700 rounded-lg animate-pulse"></div>
    </div>
);


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats, getPresaleHistory, getDonationHistory } = solana;
    
    const [presaleHistory, setPresaleHistory] = useState<PresaleHistoryTransaction[]>([]);
    const [donationHistory, setDonationHistory] = useState<DonationHistoryTransaction[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [donationTab, setDonationTab] = useState('All');
    
    useEffect(() => {
        const fetchActivity = async () => {
            if (connected) {
                setLoadingActivity(true);
                const [presaleData, donationData] = await Promise.all([
                    getPresaleHistory(),
                    getDonationHistory()
                ]);
                setPresaleHistory(presaleData);
                setDonationHistory(donationData);
                setLoadingActivity(false);
            }
        };
        fetchActivity();
    }, [connected, getPresaleHistory, getDonationHistory]);

    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);
    
    const presaleByPhase = useMemo(() => {
        return presaleHistory.reduce((acc, tx) => {
            (acc[tx.phase] = acc[tx.phase] || []).push(tx);
            return acc;
        }, {} as Record<number, PresaleHistoryTransaction[]>);
    }, [presaleHistory]);

    const filteredDonations = useMemo(() => {
        if (donationTab === 'All') return donationHistory;
        return donationHistory.filter(tx => tx.tokenSymbol === donationTab);
    }, [donationHistory, donationTab]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    const donationTabs = ['All', 'SOL', 'USDC', 'USDT', 'OWFN'];
    const DONATION_ICONS: { [key: string]: React.ReactNode } = { SOL: <SolIcon />, USDC: <UsdcIcon />, USDT: <UsdtIcon />, OWFN: <OwfnIcon /> };

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg">
                    <div>
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('token_types')}</p>
                        <p className="text-2xl font-bold">{loading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {loading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-primary-500 dark:text-darkPrimary-500 font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>
                                    <div className="text-right font-semibold font-mono text-primary-900 dark:text-darkPrimary-100">
                                        ${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </a>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400">
                        <p>{t('profile_no_tokens')}</p>
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('my_activity')}</h2>
                {loadingActivity ? <ActivitySkeletonLoader /> : (
                <div className="space-y-6">
                    {/* Presale Section */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-3"><ShoppingCart/> {t('my_presale_contributions')}</h3>
                        {Object.keys(presaleByPhase).length > 0 ? (
                        <div className="space-y-3">
                        {Object.entries(presaleByPhase).map(([phase, txs]) => (
                            <ActivityAccordion 
                                key={phase} 
                                title={`${t('phase_dynamic', { phase })}`}
                                summary={<span className="text-sm font-semibold bg-primary-200 dark:bg-darkPrimary-700 px-2 py-1 rounded-md">{t('total_contributed_short', { amount: txs.reduce((sum, tx) => sum + tx.solAmount, 0).toFixed(4) })}</span>}
                            >
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-primary-500 dark:text-darkPrimary-500">
                                        <tr>
                                            <th className="text-left py-2 px-2">{t('date')}</th>
                                            <th className="text-right py-2 px-2">{t('sol_contributed')}</th>
                                            <th className="text-right py-2 px-2">{t('owfn_received')}</th>
                                            {/* FIX: The `title` prop is invalid for lucide-react icons. Wrapped the icon in a `span` with a `title` attribute to show a tooltip on hover. */}
                                            <th className="text-right py-2 px-2 flex items-center justify-end gap-1">{t('value_usd_current')} <span title={t('value_usd_tooltip')}><HelpCircle size={14} className="cursor-help" /></span></th>
                                            <th className="text-right py-2 px-2">{t('transaction')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {txs.map(tx => (
                                        <tr key={tx.signature} className="border-t border-primary-200 dark:border-darkPrimary-700">
                                            <td className="py-3 px-2">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                            <td className="text-right py-3 px-2 font-mono">{tx.solAmount.toFixed(4)}</td>
                                            <td className="text-right py-3 px-2 font-mono">{tx.owfnAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                            <td className="text-right py-3 px-2 font-mono">${tx.usdValue.toFixed(2)}</td>
                                            <td className="py-3 px-2 flex justify-end"><AddressDisplay address={tx.signature} type="tx" /></td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </ActivityAccordion>
                        ))}
                        </div>
                        ) : <p className="text-primary-600 dark:text-darkPrimary-400 p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-md">{t('profile_no_presale')}</p> }
                    </div>
                    {/* Donation Section */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-3"><Gift/> {t('my_donation_history')}</h3>
                        {donationHistory.length > 0 ? (
                        <div className="bg-primary-50 dark:bg-darkPrimary-800/50 rounded-lg border border-primary-200 dark:border-darkPrimary-700 p-4">
                            <div className="border-b border-primary-200 dark:border-darkPrimary-700 flex flex-wrap">
                                {donationTabs.map(tab => (
                                <button key={tab} onClick={() => setDonationTab(tab)} className={`px-4 py-2 text-sm font-semibold transition-colors ${donationTab === tab ? 'border-b-2 border-accent-500 text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400'}`}>{tab}</button>
                                ))}
                            </div>
                            <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr><th className="text-left py-2 px-2">{t('date')}</th><th className="text-right py-2 px-2">{t('amount_donated')}</th>{/* FIX: The `title` prop is invalid for lucide-react icons. Wrapped the icon in a `span` with a `title` attribute to show a tooltip on hover. */}
<th className="text-right py-2 px-2 flex items-center justify-end gap-1">{t('value_usd_current')} <span title={t('value_usd_tooltip')}><HelpCircle size={14} className="cursor-help" /></span></th><th className="text-right py-2 px-2">{t('transaction')}</th></tr></thead>
                                <tbody>
                                {filteredDonations.length > 0 ? filteredDonations.map(tx => (
                                    <tr key={tx.signature} className="border-t border-primary-200 dark:border-darkPrimary-700">
                                    <td className="py-3 px-2">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                    <td className="text-right py-3 px-2 font-mono flex items-center justify-end gap-2">{tx.amount.toLocaleString(undefined, {maximumFractionDigits: 4})} {DONATION_ICONS[tx.tokenSymbol]}</td>
                                    <td className="text-right py-3 px-2 font-mono">${tx.usdValue.toFixed(2)}</td>
                                    <td className="py-3 px-2 flex justify-end"><AddressDisplay address={tx.signature} type="tx" /></td>
                                    </tr>
                                )) : <tr><td colSpan={4} className="text-center py-8 text-primary-500">{t('profile_no_donations_token', { token: donationTab })}</td></tr>}
                                </tbody>
                            </table>
                            </div>
                        </div>
                        ) : <p className="text-primary-600 dark:text-darkPrimary-400 p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-md">{t('profile_no_donations')}</p> }
                    </div>
                </div>
                )}
            </div>

            <ComingSoonWrapper>
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                        <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                        <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                    </div>
                </div>
            </ComingSoonWrapper>
        </div>
    );
}