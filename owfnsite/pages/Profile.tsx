import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2, LogIn } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, ImpactNFT } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';
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

export default function Profile() {
    const { t, solana, siws, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading: tokensLoading } = solana;
    const { isAuthenticated, isSessionLoading, isLoading: isSiwsLoading, signIn, signOut } = siws;
    
    const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;
    
    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (isSessionLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
            </div>
        );
    }
    
    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                    {t('connect_wallet')}
                </button>
            </div>
        );
    }

     if (!isAuthenticated) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <LogIn className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('authentication_required', {defaultValue: 'Authentication Required'})}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_sign_in_prompt', {defaultValue: 'Sign a message with your wallet to securely log in and view your Impact Dashboard.'})}</p>
                <button
                    onClick={signIn}
                    disabled={isSiwsLoading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center justify-center mx-auto gap-2"
                >
                    {isSiwsLoading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5"/>
                            {t('authenticating', {defaultValue: 'Authenticating...'})}
                        </>
                    ) : (
                        t('sign_in_with_wallet', {defaultValue: 'Sign In with Wallet'})
                    )}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                        {address && <AddressDisplay address={address} />}
                    </div>
                </div>
                <button onClick={signOut} className="text-sm font-semibold text-primary-600 dark:text-darkPrimary-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    {t('disconnect_wallet')}
                </button>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                 <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg">
                    <div>
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('token_types')}</p>
                        <p className="text-2xl font-bold">{tokensLoading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {tokensLoading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                 {tokensLoading ? (
                    <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                     <div className="space-y-1">
                        {userTokens.slice(0, 5).map(token => (
                           <div key={token.mintAddress} className="grid grid-cols-3 gap-4 items-center p-2 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 flex-shrink-0">{token.logo}</div>
                                    <div>
                                        <p className="font-bold text-sm">{token.symbol}</p>
                                        <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{token.name}</p>
                                    </div>
                                </div>
                                <div className="text-right font-mono text-sm">
                                    <p>{formatNumber(token.balance)}</p>
                                </div>
                                <div className="text-right font-mono text-sm">
                                    <p>${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400">
                        <p>{t('profile_no_tokens')}</p>
                    </div>
                )}
            </div>
             <ComingSoonWrapper>
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$0.00`} />
                        <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={0} />
                        <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={0} />
                    </div>
                </div>
            </ComingSoonWrapper>
        </div>
    );
}
