
import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2 } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ImpactBadge, ImpactNFT } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.js';
import { formatNumber } from '../lib/utils.js';

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-surface/50 dark:bg-dark-surface p-4 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg flex items-center space-x-4">
        <div className="text-accent dark:text-dark-accent">{icon}</div>
        <div>
            <p className="text-sm text-secondary dark:text-dark-secondary">{title}</p>
            <p className="text-xl font-bold text-primary dark:text-dark-primary">{value}</p>
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

    if (!connected) {
        return (
            <div className="text-center p-12 bg-surface/50 dark:bg-dark-surface backdrop-blur-lg border border-white/10 dark:border-dark-border rounded-lg shadow-glass animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent dark:text-dark-accent mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-primary dark:text-dark-primary">{t('my_profile')}</h1>
                <p className="text-secondary dark:text-dark-secondary mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-accent hover:bg-accent-hover text-white dark:bg-dark-accent dark:hover:bg-dark-accent-hover dark:text-dark-background font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-accent dark:text-dark-accent">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-secondary dark:text-dark-secondary">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg">
                     <p className="text-sm text-secondary dark:text-dark-secondary">{t('total_value')}</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {loading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                </div>
                 <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg">
                     <p className="text-sm text-secondary dark:text-dark-secondary">{t('token_types')}</p>
                    <p className="text-4xl font-bold text-primary dark:text-dark-primary">{loading ? '-' : userTokens.length}</p>
                </div>
            </div>

            <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg">
                <h2 className="text-2xl font-bold mb-4 text-primary dark:text-dark-primary">{t('my_tokens')}</h2>
                
                {loading ? (
                    <div className="text-center py-8 text-secondary dark:text-dark-secondary flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 px-4 py-2 text-xs text-secondary dark:text-dark-secondary font-bold uppercase">
                            <span className="col-span-2 md:col-span-2">{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="hidden md:block text-right">{t('price_per_token')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {/* Token List */}
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center p-4 rounded-lg hover:bg-white/5 dark:hover:bg-dark-surface/80 transition-colors duration-200 cursor-pointer">
                                    {/* Column 1: Asset Info */}
                                    <div className="flex items-center space-x-4 col-span-2 md:col-span-2">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary dark:text-dark-primary">{token.symbol}</p>
                                            <p className="text-sm text-secondary dark:text-dark-secondary">{token.name}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Balance */}
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-primary dark:text-dark-primary">{formatNumber(token.balance)}</p>
                                    </div>
                                    
                                    {/* Column 3: Price */}
                                     <div className="hidden md:block text-right font-mono text-sm text-secondary dark:text-dark-secondary">
                                        ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                    </div>

                                    {/* Column 4: Value */}
                                    <div className="text-right font-semibold font-mono text-primary dark:text-dark-primary">
                                        ${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </a>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-secondary dark:text-dark-secondary">
                        <p>{t('profile_no_tokens')}</p>
                    </div>
                )}
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg">
                     <h2 className="text-2xl font-bold mb-4 text-primary dark:text-dark-primary">{t('my_impact_stats')}</h2>
                    <ComingSoonWrapper>
                        <div className="grid md:grid-cols-1 gap-4">
                            <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                            <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                            <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                        </div>
                    </ComingSoonWrapper>
                </div>
                 <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg">
                    <h2 className="text-2xl font-bold mb-4 text-primary dark:text-dark-primary">{t('impact_trophies_nfts')}</h2>
                     <ComingSoonWrapper>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {/* Live NFT data would be populated here */}
                        </div>
                    </ComingSoonWrapper>
                </div>
            </div>
        </div>
    );
}