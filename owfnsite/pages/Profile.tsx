import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2, Star, Image as ImageIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, ImpactNFT } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="glass-card p-4 flex items-center space-x-4">
        <div className="text-neon-cyan">{icon}</div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const TierDisplay = ({ tier }: { tier: string }) => {
    const tierStyles: { [key: string]: string } = {
        'Bronze': 'text-yellow-400 border-yellow-400 bg-yellow-900/50',
        'Silver': 'text-gray-300 border-gray-300 bg-gray-700/50',
        'Gold': 'text-amber-400 border-amber-400 bg-amber-900/50',
        'Platinum': 'text-cyan-400 border-cyan-400 bg-cyan-900/50',
    }
    return <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${tierStyles[tier]}`}>{tier}</span>;
}

const NftCard = ({ nft }: { nft: ImpactNFT }) => (
    <div className="glass-card card-3d-hover group overflow-hidden">
        <img src={nft.imageUrl} alt={nft.caseTitle} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" />
        <div className="p-3">
            <p className="font-bold text-sm truncate">{nft.caseTitle}</p>
            <p className="text-xs text-text-secondary">{nft.date}</p>
        </div>
    </div>
);

const BadgeDisplay = ({ badge, t }: { badge: ImpactBadge, t: (key: string, replacements?: Record<string, string | number>) => string }) => (
    <div className="group relative flex flex-col items-center text-center w-24">
        <div className="bg-dark-card border border-dark-border rounded-full p-4 text-neon-cyan group-hover:scale-110 transition-transform cursor-pointer" style={{ boxShadow: '0 0 15px rgba(0,255,255,0.2)'}}>
            {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
        </div>
        <p className="text-sm font-semibold mt-2 text-text-primary">{t(badge.titleKey)}</p>
        <div className="absolute bottom-full mb-2 w-48 bg-dark-bg text-text-primary border border-dark-border text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {t(badge.descriptionKey)}
        </div>
    </div>
);

export default function Profile() {
    const { t, solana, setWalletModalOpen, isVerified } = useAppContext();
    const { connected, address, userTokens, loading, userStats } = solana;

    const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) {
            return 0;
        }
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (!connected || !isVerified) {
        return (
            <div className="text-center p-12 glass-card max-w-md mx-auto animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-neon-cyan mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-text-secondary mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="font-bold py-3 px-6 rounded-full text-lg neon-button disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-text-primary">{t('impact_dashboard_title')}</h1>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-text-secondary">{t('connected_as')}:</span>
                        {address && <AddressDisplay address={address} />}
                    </div>
                </div>
                <div className="flex items-center gap-4 glass-card p-4 card-3d-hover">
                    <div className="text-right">
                        <p className="font-bold text-lg text-text-primary">{t('my_impact_stats')}</p>
                        <p className="flex items-center justify-end gap-2 text-3xl font-bold text-neon-cyan" style={{ textShadow: '0 0 10px var(--neon-cyan)'}}>
                           <Star className="text-amber-400" /> {userStats.impactScore.toLocaleString()}
                        </p>
                    </div>
                     <TierDisplay tier={userStats.memberTier} />
                </div>
            </div>
            
            {/* My Impact Stats */}
            <div className="glass-card p-6 card-3d-hover">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">{t('my_impact_stats')}</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                    <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                    <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                </div>
            </div>

            {/* My Tokens Section */}
            <div className="glass-card p-6 card-3d-hover">
                <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-dark-bg/50 rounded-lg border border-dark-border">
                    <div>
                        <p className="text-sm text-text-secondary">{t('token_types')}</p>
                        <p className="text-2xl font-bold">{loading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-green-400">
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
                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-dark-card transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary">{token.symbol}</p>
                                            <p className="text-sm text-text-secondary truncate">{token.name}</p>
                                        </div>
                                    </div>

                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-text-primary">{token.balance.toLocaleString(undefined, {maximumFractionDigits: 4})}</p>
                                        <p className="text-sm text-text-secondary">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>

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
            
            {/* Trophies & Badges */}
            <div className="grid lg:grid-cols-2 gap-8">
                 <div className="glass-card p-6 card-3d-hover">
                    <h2 className="text-2xl font-bold mb-4">{t('impact_badges')}</h2>
                     <div className="flex flex-wrap gap-4 justify-center">
                        {userStats.impactBadges.map(badge => (
                             <BadgeDisplay key={badge.id} badge={badge} t={t} />
                        ))}
                    </div>
                </div>
                 <div className="glass-card p-6 card-3d-hover">
                    <h2 className="text-2xl font-bold mb-4">{t('impact_trophies_nfts')}</h2>
                    {userStats.impactNFTs.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {userStats.impactNFTs.map(nft => <NftCard key={nft.id} nft={nft} />)}
                        </div>
                    ) : (
                         <div className="text-center py-8 text-text-secondary flex flex-col items-center justify-center gap-3 h-full">
                            <ImageIcon className="w-12 h-12" />
                            <p>No Impact NFTs earned yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}