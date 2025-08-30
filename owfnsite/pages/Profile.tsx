import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Gem, Loader2, ShieldCheck, TrendingUp, Lock, Gift, User, Star, Award } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';
import { formatNumber } from '../lib/utils.ts';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
    { id: 'badge4', titleKey: 'badge_top_contributor', descriptionKey: 'badge_top_contributor_desc', icon: <Star /> },
];

const DashboardCard = ({ title, icon, children, className = '', animDelay = '0ms' }: { title: string, icon?: React.ReactNode, children: React.ReactNode, className?: string, animDelay?: string }) => (
    <div 
        className={`bg-surface border border-border p-6 rounded-lg shadow-lg animate-card-entry ${className}`}
        style={{ animationDelay: animDelay }}
    >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            {icon}
            {title}
        </h2>
        {children}
    </div>
);

const StatItem = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="flex items-center space-x-3">
        <div className="text-primary flex-shrink-0">{icon}</div>
        <div>
            <p className="text-sm text-foreground-muted">{title}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
    </div>
);


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats, stakedBalance, earnedRewards } = solana;
    
    const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;
    
    const totalUsdValue = useMemo(() => {
        if (loading || !userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens, loading]);

    if (!connected || !address) {
        return (
            <div className="text-center p-12 bg-surface border border-border rounded-lg shadow-lg animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-primary mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-foreground-muted mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 hover:bg-primary/90"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    const userVestingSchedule = userStats.vestingSchedule;
    let vestingProgress = 0;
    if (userVestingSchedule) {
        const totalDuration = userVestingSchedule.endDate.getTime() - userVestingSchedule.startDate.getTime();
        const elapsedDuration = Math.max(0, new Date().getTime() - userVestingSchedule.startDate.getTime());
        vestingProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);
    }
    
    return (
        <div className="space-y-8">
            {/* --- Profile Header --- */}
            <div className="bg-surface border border-border p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up">
                <WalletAvatar address={address} className="w-24 h-24 flex-shrink-0" />
                <div className="flex-grow text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                         <h1 className="text-3xl font-bold text-foreground">{t('impact_dashboard_title')}</h1>
                         {isAdmin && <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full"><ShieldCheck size={14}/> Admin</div>}
                    </div>
                    <AddressDisplay address={address} className="justify-center sm:justify-start"/>
                    <div className="mt-2 text-4xl font-bold text-primary">
                        {loading ? <Loader2 className="w-8 h-8 animate-spin inline-block" /> : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <p className="text-sm text-foreground-muted -mt-1">{t('total_value')}</p>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* --- Left Column: My Tokens --- */}
                <div className="lg:col-span-2 space-y-8">
                     <DashboardCard title={t('my_tokens')} icon={<User size={20}/>} className="lg:col-span-2">
                         {loading ? (
                            <div className="text-center py-8 text-foreground-muted flex items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>{t('profile_loading_tokens')}</span>
                            </div>
                        ) : userTokens.length > 0 ? (
                            <div className="space-y-1">
                                <div className="grid grid-cols-3 gap-4 px-2 py-2 text-xs text-foreground-muted/80 font-bold uppercase">
                                    <span>{t('asset')}</span>
                                    <span className="text-right">{t('balance')}</span>
                                    <span className="text-right">{t('value_usd')}</span>
                                </div>
                                {userTokens.map(token => (
                                <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                    <a className="grid grid-cols-3 gap-4 items-center p-2 rounded-lg hover:bg-border/50 transition-colors duration-200 cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                                                {token.logo}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{token.symbol}</p>
                                                <p className="text-xs text-foreground-muted truncate max-w-[120px]">{token.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono">
                                            <p className="font-semibold text-foreground">{formatNumber(token.balance)}</p>
                                        </div>
                                        <div className="text-right font-semibold font-mono text-foreground">
                                            ${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    </a>
                                </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-foreground-muted">
                                <p>{t('profile_no_tokens')}</p>
                            </div>
                        )}
                    </DashboardCard>
                    
                    <DashboardCard title={t('impact_trophies_nfts')} icon={<Gem size={20} />} animDelay="300ms">
                        <ComingSoonWrapper>
                            <div className="h-40 flex items-center justify-center text-foreground-muted">
                                <p>Your Impact NFTs will be displayed here.</p>
                            </div>
                        </ComingSoonWrapper>
                    </DashboardCard>
                </div>
                
                {/* --- Right Column: Stats & Actions --- */}
                <div className="space-y-8">
                     <DashboardCard title={t('my_impact_stats')} animDelay="100ms">
                        <ComingSoonWrapper>
                            <div className="space-y-4">
                                <StatItem icon={<DollarSign size={20} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                                <StatItem icon={<HandHeart size={20} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                                <StatItem icon={<Vote size={20} />} title={t('votes_cast')} value={userStats.votesCast} />
                            </div>
                        </ComingSoonWrapper>
                    </DashboardCard>
                    
                     <DashboardCard title={t('staking')} icon={<TrendingUp size={20}/>} animDelay="200ms">
                        <ComingSoonWrapper>
                            <div className="space-y-4">
                                <StatItem icon={<TrendingUp size={20} />} title={t('my_staked_balance')} value={`${stakedBalance.toLocaleString(undefined, {maximumFractionDigits: 2})} OWFN`} />
                                <StatItem icon={<Gift size={20} />} title={t('claim_rewards')} value={`${earnedRewards.toLocaleString(undefined, {maximumFractionDigits: 4})} OWFN`} />
                                <Link to="/staking">
                                    <a className="block w-full text-center bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-2">
                                        {t('go_to_staking', { defaultValue: 'Go to Staking' })}
                                    </a>
                                </Link>
                            </div>
                        </ComingSoonWrapper>
                    </DashboardCard>

                    <DashboardCard title={t('vesting')} icon={<Lock size={20}/>} animDelay="300ms">
                         <ComingSoonWrapper>
                             {userVestingSchedule ? (
                                <div className="space-y-4">
                                    <ProgressBar progress={vestingProgress} label={t('vesting_progress')} />
                                    <Link to="/vesting">
                                        <a className="block w-full text-center bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-2">
                                            {t('view_vesting_details', { defaultValue: 'View Vesting Details' })}
                                        </a>
                                    </Link>
                                </div>
                             ) : (
                                <p className="text-foreground-muted text-center py-4">{t('no_vesting_schedule')}</p>
                             )}
                         </ComingSoonWrapper>
                    </DashboardCard>
                    
                    <DashboardCard title={t('impact_badges')} icon={<Award size={20}/>} animDelay="400ms">
                         <ComingSoonWrapper>
                             <div className="grid grid-cols-4 gap-4">
                                {MOCK_BADGES.map(badge => (
                                    <div key={badge.id} className="group relative flex flex-col items-center text-center">
                                        <div className="bg-border rounded-full p-3 text-secondary group-hover:scale-110 group-hover:shadow-card-glow transition-all duration-300">
                                            {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 24 })}
                                        </div>
                                        <div className="absolute bottom-full mb-2 w-40 bg-foreground text-background text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <p className="font-bold">{t(badge.titleKey)}</p>
                                            <p>{t(badge.descriptionKey)}</p>
                                            <svg className="absolute text-foreground h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </ComingSoonWrapper>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
}