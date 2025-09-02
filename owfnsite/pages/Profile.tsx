import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Award, Gem, Loader2, ArrowRight } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';
import { formatNumber } from '../lib/utils.ts';
import { AnimatedNumber } from '../components/AnimatedNumber.tsx';
import { ImpactNarrative } from '../components/ImpactNarrative.tsx';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const StatCard = ({ icon, title, value, gridClass = '' }: { icon: React.ReactNode, title: string, value: string | number, gridClass?: string }) => (
    <div className={`bg-primary-100 dark:bg-darkPrimary-800/50 p-6 rounded-2xl flex flex-col justify-center items-center text-center ${gridClass}`}>
        <div className="text-accent-500 dark:text-darkAccent-400 mb-2">{icon}</div>
        <p className="text-4xl font-bold"><AnimatedNumber value={typeof value === 'string' ? parseFloat(value) : value} /></p>
        <p className="text-sm font-semibold text-primary-600 dark:text-darkPrimary-400 mt-1">{title}</p>
    </div>
);

export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats } = solana;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) {
            return 0;
        }
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 btn-tactile"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold font-serif text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d flex flex-col justify-center">
                    <p className="text-lg text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400 my-2">
                        {loading ? '-' : `$`}<AnimatedNumber value={totalUsdValue} />
                    </p>
                    <p className="text-sm text-primary-500 dark:text-darkPrimary-500">{t('token_types')}: {loading ? '-' : userTokens.length}</p>
                </div>
                
                <ImpactNarrative userStats={userStats} isParentLoading={loading} />

                <ComingSoonWrapper showMessage={false}>
                    <StatCard icon={<DollarSign size={32} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                </ComingSoonWrapper>
                
                <ComingSoonWrapper showMessage={false}>
                    <StatCard icon={<HandHeart size={32} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                </ComingSoonWrapper>

                <ComingSoonWrapper showMessage={false}>
                    <StatCard icon={<Vote size={32} />} title={t('votes_cast')} value={userStats.votesCast} />
                </ComingSoonWrapper>

                <ComingSoonWrapper showMessage={false}>
                    <div className="md:col-span-3 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                        <h2 className="text-xl font-bold mb-4">{t('impact_badges')}</h2>
                         <div className="flex justify-around items-center h-full">
                            {MOCK_BADGES.map(badge => (
                                 <div key={badge.id} className="group relative flex flex-col items-center text-center w-24 perspective-1000">
                                    <div className="transform-style-3d transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-x-12">
                                        <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-full p-4 text-accent-500 dark:text-darkAccent-400">
                                            {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                                        </div>
                                        <p className="text-sm font-semibold mt-2">{t(badge.titleKey)}</p>
                                    </div>
                                    <div className="absolute bottom-full mb-2 w-48 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {t(badge.descriptionKey)}
                                        <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ComingSoonWrapper>
                
                <div className="md:col-span-3 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                    {loading ? (
                        <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{t('profile_loading_tokens')}</span>
                        </div>
                    ) : userTokens.length > 0 ? (
                        <div className="space-y-1">
                            {userTokens.map(token => (
                               <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                    <a className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                        <div className="flex items-center space-x-4 col-span-1">
                                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                                {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                                <p className="text-sm text-primary-600 dark:text-darkPrimary-400 hidden md:block">{token.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono hidden md:block">
                                            <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
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
            </div>
        </div>
    );
}