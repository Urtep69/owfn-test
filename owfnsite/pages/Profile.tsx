import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Gem, Loader2, ShieldCheck } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';
import { formatNumber } from '../lib/utils.ts';
import { WalletAvatar } from '../components/WalletAvatar.tsx';

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

    if (!connected || !address) {
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
            {/* --- Profile Header --- */}
            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d-lg flex items-center gap-6">
                <WalletAvatar address={address} className="w-20 h-20 flex-shrink-0" />
                <div className="flex-grow">
                    <div className="flex items-center gap-4">
                         <h1 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200">{t('impact_dashboard_title')}</h1>
                         {isAdmin && <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 px-2 py-1 rounded-full"><ShieldCheck size={14}/> Admin</div>}
                    </div>
                    <AddressDisplay address={address} />
                    <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                        {loading ? '...' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <p className="text-sm text-primary-600 dark:text-darkPrimary-400 -mt-1">{t('total_value')}</p>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* --- Left Column: My Tokens --- */}
                <div className="lg:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                     {loading ? (
                        <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{t('profile_loading_tokens')}</span>
                        </div>
                    ) : userTokens.length > 0 ? (
                        <div className="space-y-1">
                            {/* Header */}
                            <div className="grid grid-cols-3 gap-4 px-2 py-2 text-xs text-primary-500 dark:text-darkPrimary-500 font-bold uppercase">
                                <span>{t('asset')}</span>
                                <span className="text-right">{t('balance')}</span>
                                <span className="text-right">{t('value_usd')}</span>
                            </div>
                            {/* Token List */}
                            {userTokens.map(token => (
                            <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            <p className="text-xs text-primary-600 dark:text-darkPrimary-400 truncate max-w-[120px]">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
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
                
                {/* --- Right Column: Stats & Badges --- */}
                <div className="space-y-8">
                     <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                        <ComingSoonWrapper>
                             <div className="space-y-4">
                                <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                                <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                                <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                            </div>
                        </ComingSoonWrapper>
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-4">{t('impact_badges')}</h2>
                         <ComingSoonWrapper showMessage={false}>
                             <div className="grid grid-cols-3 gap-4">
                                {MOCK_BADGES.map(badge => (
                                    <div key={badge.id} className="group relative flex flex-col items-center text-center">
                                        <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-full p-4 text-accent-500 dark:text-darkAccent-400 group-hover:scale-110 transition-transform">
                                            {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 28 })}
                                        </div>
                                        <p className="text-xs font-semibold mt-2">{t(badge.titleKey)}</p>
                                        <div className="absolute bottom-full mb-2 w-40 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {t(badge.descriptionKey)}
                                            <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </ComingSoonWrapper>
                    </div>
                </div>
            </div>
            
             {/* --- Bottom Section: NFTs --- */}
             <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                 <h2 className="text-2xl font-bold mb-4">{t('impact_trophies_nfts')}</h2>
                <ComingSoonWrapper>
                    <div className="h-40 flex items-center justify-center text-primary-500 dark:text-darkPrimary-500">
                        {/* Placeholder for future NFT gallery */}
                        <p>Your Impact NFTs will be displayed here.</p>
                    </div>
                </ComingSoonWrapper>
            </div>
        </div>
    );
}