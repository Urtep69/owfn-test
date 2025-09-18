import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Vote, Award, Gem, Loader2, Landmark } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';
import { PortfolioDonutChart } from '../components/PortfolioDonutChart.js';

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value: string | number, isLoading: boolean }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            {isLoading ? (
                <div className="h-7 w-24 bg-primary-200 dark:bg-darkPrimary-600 rounded-md animate-pulse mt-1"></div>
            ) : (
                <p className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
            )}
        </div>
    </div>
);

const ImpactBadgeDisplay = ({ icon, title, description, unlocked }: { icon: React.ReactNode, title: string, description: string, unlocked: boolean }) => (
    <div className="group relative flex flex-col items-center text-center w-24">
        <div className={`relative rounded-full p-4 transition-all duration-300 ${unlocked ? 'bg-accent-100 dark:bg-darkAccent-900 text-accent-500 dark:text-darkAccent-400 group-hover:scale-110' : 'bg-primary-200 dark:bg-darkPrimary-700 text-primary-400 dark:text-darkPrimary-500'}`}>
            {unlocked && <div className="absolute inset-0 rounded-full bg-current opacity-20 group-hover:animate-ping-slow"></div>}
            {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 32 })}
        </div>
        <p className={`text-sm font-semibold mt-2 ${unlocked ? 'text-primary-800 dark:text-darkPrimary-200' : 'text-primary-500 dark:text-darkPrimary-500'}`}>{title}</p>
        <div className="absolute bottom-full mb-2 w-48 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-2 px-3 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <span className="font-bold block">{title}</span>
            <span className="mt-1 block">{description}</span>
            <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
        </div>
    </div>
);


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats, loadingStats } = solana;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    // Badge unlocking logic
    const presalePioneerUnlocked = userStats.hasMadePresaleContribution;
    const firstDonorUnlocked = userStats.donations.length > 0;
    const diversifiedSupporterUnlocked = userStats.donatedTokenMints.size > 1;
    const communityVoterUnlocked = userStats.votesCast > 0;
    
    const badges = [
        { id: 'presale', titleKey: 'badge_presale_pioneer_title', descriptionKey: 'badge_presale_pioneer_desc', icon: <Landmark />, unlocked: presalePioneerUnlocked },
        { id: 'donor', titleKey: 'badge_first_donation_title', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart />, unlocked: firstDonorUnlocked },
        { id: 'voter', titleKey: 'badge_community_voter_title', descriptionKey: 'badge_community_voter_desc', icon: <Vote />, unlocked: communityVoterUnlocked },
        { id: 'diverse', titleKey: 'badge_diverse_donor_title', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem />, unlocked: diversifiedSupporterUnlocked },
    ];


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
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-6">
                     <h2 className="text-2xl font-bold">{t('my_tokens')}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                             <div className="grid grid-cols-2 gap-4 p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg">
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
                        </div>
                         <div className="h-48">
                             <h3 className="text-center text-sm font-bold text-primary-800 dark:text-darkPrimary-200 mb-2">{t('impact_portfolio_chart_title')}</h3>
                             <PortfolioDonutChart tokens={userTokens} />
                         </div>
                     </div>
                     {loading ? (
                        <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{t('profile_loading_tokens')}</span>
                        </div>
                    ) : userTokens.length > 0 ? (
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                            {userTokens.map(token => (
                            <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex-shrink-0">{token.logo}</div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100 text-sm">{token.symbol}</p>
                                            <p className="text-xs text-primary-600 dark:text-darkPrimary-400">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono text-sm">
                                        <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                        <p className="text-xs text-primary-600 dark:text-darkPrimary-400">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString() : token.pricePerToken.toPrecision(4)}</p>
                                    </div>
                                    <div className="text-right font-semibold font-mono text-sm text-primary-900 dark:text-darkPrimary-100">
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

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                        <div className="space-y-4">
                            <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonatedUsd.toFixed(2)}`} isLoading={loadingStats} />
                            <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} isLoading={loadingStats} />
                            <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} isLoading={loadingStats} />
                        </div>
                    </div>
                     <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-6">{t('impact_badges')}</h2>
                         <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
                            {badges.map(badge => (
                                 <ImpactBadgeDisplay 
                                     key={badge.id} 
                                     icon={badge.icon}
                                     title={t(badge.titleKey)}
                                     description={t(badge.descriptionKey)}
                                     unlocked={badge.unlocked}
                                 />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}