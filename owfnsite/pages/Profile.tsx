import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, LogOut, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { PortfolioDonutChart } from '../components/PortfolioDonutChart.js';
import { formatNumber } from '../lib/utils.js';

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
            <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('profile_connect_title')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

export default function Profile() {
    const { t, solana } = useAppContext();
    const { connected, address, userTokens, totalUsdValue, loading, disconnectWallet } = solana;

    if (!connected || !address) {
        return <ConnectWalletPrompt />;
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('profile_title')}</h1>
                    <AddressDisplay address={address} className="mt-2" />
                </div>
                <button
                    onClick={disconnectWallet}
                    className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                    <LogOut size={16} /> {t('disconnect_wallet')}
                </button>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('portfolio_overview')}</h2>
                    <div className="h-80">
                        {loading ? (
                             <div className="flex justify-center items-center h-full">
                                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
                            </div>
                        ) : (
                             <PortfolioDonutChart tokens={userTokens} />
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('balances')}</h2>
                    <div className="p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg mb-4">
                        <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('total_value')}</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-accent-500 dark:text-darkAccent-500" />
                            </div>
                        ) : userTokens.length > 0 ? userTokens.map(token => (
                            <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-2 gap-4 items-center p-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors cursor-pointer">
                                    {/* Asset Info */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{token.logo}</div>
                                        <div>
                                            <p className="font-semibold">{token.symbol}</p>
                                            <p className="text-xs text-primary-500 dark:text-darkPrimary-500">
                                                @ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Balance & Value */}
                                    <div className="text-right">
                                        <p className="font-semibold font-mono">{formatNumber(token.balance)}</p>
                                        <p className="text-xs text-primary-500 dark:text-darkPrimary-400">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </a>
                            </Link>
                        )) : (
                            <div className="text-center py-8 text-primary-500 dark:text-darkPrimary-400">
                                <p>{t('profile_no_tokens')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
