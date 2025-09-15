import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Vote, Gem, Loader2 } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ImpactBadge } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.js';
import { formatNumber } from '../lib/utils.js';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-dextools-background p-4 rounded-lg flex items-center space-x-4">
        <div className="text-dextools-accent-blue">{icon}</div>
        <div>
            <p className="text-sm text-dextools-text-secondary">{title}</p>
            <p className="text-xl font-bold text-dextools-text-primary">{value}</p>
        </div>
    </div>
);

export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats } = solana;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-dextools-card border border-dextools-border rounded-md animate-fade-in">
                <Wallet className="mx-auto w-16 h-16 text-dextools-accent-blue mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-dextools-text-primary">{t('my_profile')}</h1>
                <p className="text-dextools-text-secondary mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-dextools-special text-white font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-dextools-text-secondary">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="bg-dextools-card border border-dextools-border p-6 rounded-md">
                <h2 className="text-2xl font-bold mb-4 text-dextools-text-primary">{t('my_tokens')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-dextools-background rounded-lg">
                    <div>
                        <p className="text-sm text-dextools-text-secondary">{t('token_types')}</p>
                        <p className="text-2xl font-bold text-dextools-text-primary">{loading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-dextools-text-secondary">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-dextools-accent-green">
                            {loading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center py-8 text-dextools-text-secondary flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-dextools-text-secondary font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-dextools-border transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-dextools-text-primary">{token.symbol}</p>
                                            <p className="text-sm text-dextools-text-secondary">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-dextools-text-primary">{formatNumber(token.balance)}</p>
                                        <p className="text-sm text-dextools-text-secondary">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>
                                    <div className="text-right font-semibold font-mono text-dextools-text-primary">${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </a>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-dextools-text-secondary"><p>{t('profile_no_tokens')}</p></div>
                )}
            </div>
            
            <ComingSoonWrapper>
                <div className="bg-dextools-card border border-dextools-border p-6 rounded-md">
                    <h2 className="text-2xl font-bold mb-4 text-dextools-text-primary">{t('my_impact_stats')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                        <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                        <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                    </div>
                </div>
            </ComingSoonWrapper>

            <div className="grid lg:grid-cols-2 gap-8">
                <ComingSoonWrapper showMessage={false}>
                    <div className="bg-dextools-card border border-dextools-border p-6 rounded-md">
                        <h2 className="text-2xl font-bold mb-4 text-dextools-text-primary">{t('impact_trophies_nfts')}</h2>
                    </div>
                </ComingSoonWrapper>
                 <ComingSoonWrapper showMessage={false}>
                    <div className="bg-dextools-card border border-dextools-border p-6 rounded-md">
                        <h2 className="text-2xl font-bold mb-4 text-dextools-text-primary">{t('impact_badges')}</h2>
                         <div className="flex flex-wrap gap-4">
                            {MOCK_BADGES.map(badge => (
                                 <div key={badge.id} className="group relative flex flex-col items-center text-center w-24">
                                    <div className="bg-dextools-background rounded-full p-4 text-dextools-accent-blue group-hover:scale-110 transition-transform">
                                        {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                                    </div>
                                    <p className="text-sm font-semibold mt-2 text-dextools-text-primary">{t(badge.titleKey)}</p>
                                    <div className="absolute bottom-full mb-2 w-48 bg-dextools-card text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-dextools-border">
                                        {t(badge.descriptionKey)}
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