

import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2 } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, ImpactNFT } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
    <div className="bg-surface-light p-4 rounded-lg flex items-center space-x-4 border border-border-color">
        <div className="text-accent-light">{icon}</div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
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

    if (!connected) {
        return (
            <div className="text-center p-12 glassmorphism rounded-lg animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-light mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-text-secondary mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-accent-light hover:bg-accent-hover text-accent-foreground font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-display font-bold text-accent-light">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-text-secondary">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="glassmorphism p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surface-dark rounded-lg border border-border-color">
                    <div>
                        <p className="text-sm text-text-secondary">{t('token_types')}</p>
                        <p className="text-2xl font-bold">{loading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-success">
                            {loading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center py-8 text-text-secondary flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-text-secondary font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {/* Token List */}
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-surface-light transition-colors duration-200 cursor-pointer">
                                    {/* Column 1: Asset Info */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary">{token.symbol}</p>
                                            <p className="text-sm text-text-secondary">{token.name}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Balance */}
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-text-primary">{token.balance.toLocaleString(undefined, {maximumFractionDigits: 4})}</p>
                                        <p className="text-sm text-text-secondary">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>

                                    {/* Column 3: Value */}
                                    <div className="text-right font-semibold font-mono text-text-primary">
                                        ${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </a>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-text-secondary">
                        <p>{t('profile_no_tokens')}</p>
                    </div>
                )}
            </div>
            
            <ComingSoonWrapper>
                <div className="glassmorphism p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                        <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={String(userStats.projectsSupported)} />
                        <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={String(userStats.votesCast)} />
                    </div>
                </div>
            </ComingSoonWrapper>

            <div className="grid lg:grid-cols-2 gap-8">
                <ComingSoonWrapper>
                    <div className="glassmorphism p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">{t('impact_trophies_nfts')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {/* Live NFT data would be populated here */}
                        </div>
                    </div>
                </ComingSoonWrapper>
                 <ComingSoonWrapper>
                    <div className="glassmorphism p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">{t('impact_badges')}</h2>
                         <div className="flex flex-wrap gap-4">
                            {MOCK_BADGES.map(badge => (
                                 <div key={badge.id} className="group relative flex flex-col items-center text-center w-24">
                                    <div className="bg-surface-light rounded-full p-4 text-accent-light group-hover:scale-110 transition-transform">
                                        {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                                    </div>
                                    <p className="text-sm font-semibold mt-2">{t(badge.titleKey)}</p>
                                    <div className="absolute bottom-full mb-2 w-48 bg-surface-dark text-text-primary text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {t(badge.descriptionKey)}
                                        <svg className="absolute text-surface-dark h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ComingSoonWrapper>
            </div>
        </div>
    );
}