import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Award, Gem, Loader2, LogIn, Shield, Users } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, ImpactNFT } from '../types.ts';
import { formatNumber } from '../lib/utils.ts';
import { AnimatedNumber } from '../components/AnimatedNumber.tsx';

// Mock data, to be replaced by actual data later
const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation_title', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter_title', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_early_supporter_title', descriptionKey: 'badge_early_supporter_desc', icon: <Shield /> },
    { id: 'badge4', titleKey: 'badge_diverse_donor_title', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const MOCK_NFTS: ImpactNFT[] = [
    { id: 'nft1', caseId: '1', caseTitle: 'Clean Water Initiative', imageUrl: 'https://picsum.photos/seed/nft1/300/300', date: '2025-09-15' },
    { id: 'nft2', caseId: '2', caseTitle: 'School Building Fund', imageUrl: 'https://picsum.photos/seed/nft2/300/300', date: '2025-10-01' },
];

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value: string | number, isLoading?: boolean }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-800/50 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
        <div className="text-accent-500 dark:text-darkAccent-400 mb-2">{icon}</div>
        {isLoading ? <div className="h-9 w-24 bg-primary-200 dark:bg-darkPrimary-700 rounded-md animate-pulse"></div> : <p className="text-4xl font-bold"><AnimatedNumber value={typeof value === 'string' ? parseFloat(value) : value} /></p>}
        <p className="text-sm font-semibold text-primary-600 dark:text-darkPrimary-400 mt-1">{title}</p>
    </div>
);

const NotAuthenticatedView = () => {
    const { t, solana, siws, setWalletModalOpen } = useAppContext();
    const { connected, connecting } = solana;
    const { signIn, isLoading: isSiwsLoading } = siws;

    return (
        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
            <Users className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_sign_in_prompt')}</p>
            {!connected ? (
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={connecting}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 btn-tactile"
                >
                    {connecting ? t('connecting') : t('connect_wallet')}
                </button>
            ) : (
                <button
                    onClick={signIn}
                    disabled={isSiwsLoading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 btn-tactile flex items-center justify-center mx-auto gap-2"
                >
                    {isSiwsLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20}/>}
                    {isSiwsLoading ? t('authenticating') : t('sign_in')}
                </button>
            )}
        </div>
    );
}


export default function Profile() {
    const { t, solana, siws } = useAppContext();
    const { address, userTokens, loading, userStats } = solana;
    const { isAuthenticated, isSessionLoading } = siws;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);
    
    if (isSessionLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (!isAuthenticated) {
        return <NotAuthenticatedView />;
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d flex flex-col justify-center">
                    <p className="text-lg text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400 my-2">
                        {loading ? '-' : `$`}<AnimatedNumber value={totalUsdValue} />
                    </p>
                    <p className="text-sm text-primary-500 dark:text-darkPrimary-500">{t('token_types')}: {loading ? '-' : userTokens.length}</p>
                </div>
                
                <StatCard icon={<DollarSign size={32} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} isLoading={loading} />
                <StatCard icon={<HandHeart size={32} />} title={t('projects_supported')} value={userStats.projectsSupported} isLoading={loading} />
            </div>
            
             <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('impact_badges')}</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {MOCK_BADGES.map(badge => (
                         <div key={badge.id} className="group relative flex flex-col items-center text-center p-4 bg-primary-50 dark:bg-darkPrimary-800/50 rounded-lg">
                            <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-full p-4 text-accent-500 dark:text-darkAccent-400">
                                {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                            </div>
                            <p className="text-sm font-semibold mt-2">{t(badge.titleKey)}</p>
                            <div className="absolute bottom-full mb-2 w-48 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {t(badge.descriptionKey)}
                                <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                    {loading ? (
                        <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{t('profile_loading_tokens')}</span>
                        </div>
                    ) : userTokens.length > 0 ? (
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {userTokens.map(token => (
                               <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                    <a className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                        <div className="flex items-center space-x-4 col-span-1">
                                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                                {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono col-span-1">
                                            <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                        </div>
                                        <div className="text-right font-semibold font-mono text-primary-900 dark:text-darkPrimary-100 col-span-1">
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
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">My Impact NFTs</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {MOCK_NFTS.map(nft => (
                            <div key={nft.id} className="rounded-lg overflow-hidden group">
                                <img src={nft.imageUrl} alt={nft.caseTitle} className="w-full h-auto aspect-square object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="p-2 bg-primary-100 dark:bg-darkPrimary-700">
                                    <p className="font-bold text-sm truncate">{nft.caseTitle}</p>
                                    <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{nft.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}