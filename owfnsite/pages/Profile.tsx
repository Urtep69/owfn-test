import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
// Fix: Import `HeartHandshake` and remove unused icons.
import { Wallet, DollarSign, Vote, Loader2, Heart, Trophy, HeartHandshake } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { formatNumber } from '../lib/utils.ts';

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);


const BadgeDisplay = ({ badge }: { badge: ImpactBadge }) => {
    const { t } = useAppContext();
    const isUnlocked = badge.unlocked;

    return (
        <div className="group relative flex flex-col items-center text-center w-24">
            <div className={`rounded-full p-4 transition-all duration-300 ${isUnlocked ? 'bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 group-hover:scale-110' : 'bg-primary-200 dark:bg-darkPrimary-600 text-primary-400 dark:text-darkPrimary-500 grayscale'}`}>
                {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
            </div>
            <p className={`text-sm font-semibold mt-2 ${isUnlocked ? 'text-primary-800 dark:text-darkPrimary-200' : 'text-primary-400 dark:text-darkPrimary-500'}`}>{t(badge.titleKey)}</p>
            <div className="absolute bottom-full mb-2 w-48 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {t(badge.descriptionKey)}
                <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </div>
        </div>
    );
};


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats } = solana;
    
    const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) {
            return 0;
        }
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    const badges: ImpactBadge[] = useMemo(() => [
        { id: 'first_donor', titleKey: 'badge_first_donor_title', descriptionKey: 'badge_first_donor_desc', icon: <Heart />, unlocked: userStats.donationCount > 0 },
        { id: 'health_hero', titleKey: 'badge_health_hero_title', descriptionKey: 'badge_health_hero_desc', icon: <HeartHandshake />, unlocked: true }, // Mocked as unlocked
        { id: 'active_voter', titleKey: 'badge_active_voter_title', descriptionKey: 'badge_active_voter_desc', icon: <Vote />, unlocked: userStats.votedProposalIds.length >= 5 },
    ], [userStats]);

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
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('my_profile')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('my_impact_dashboard')}</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <StatCard icon={<DollarSign size={24} />} title={t('total_donated_usd')} value={`$${userStats.totalDonatedUSD.toFixed(2)}`} />
                    <StatCard icon={<Trophy size={24} />} title={t('causes_supported')} value={userStats.causesSupported} />
                    <StatCard icon={<Heart size={24} />} title={t('number_of_donations')} value={userStats.donationCount} />
                </div>
            </div>
            
             <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('unlocked_badges')}</h2>
                 <div className="flex flex-wrap gap-4">
                    {badges.map(badge => (
                        <BadgeDisplay key={badge.id} badge={badge} />
                    ))}
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
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-primary-500 dark:text-darkPrimary-500 font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {/* Token List */}
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    {/* Column 1: Asset Info */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{token.name}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Balance */}
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>

                                    {/* Column 3: Value */}
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
    );
}