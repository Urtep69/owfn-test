import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import type { Wallet, Token } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';

const WalletCard = ({ walletInfo }: { walletInfo: Omit<Wallet, 'balances' | 'totalUsdValue'> }) => {
    const { t, solana } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<{ tokens: Token[], nfts: any[] } | null>(null);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        const fetchBalances = async () => {
            if (!solana.fetchWalletAssets) return;
            setLoading(true);
            try {
                // Correctly use fetchWalletAssets which is available in the hook
                const fetchedAssets = await solana.fetchWalletAssets(walletInfo.address);
                setAssets(fetchedAssets);
                const value = fetchedAssets.tokens.reduce((sum, token) => sum + token.usdValue, 0);
                setTotalValue(value);
            } catch (error) {
                console.error(`Failed to fetch assets for ${walletInfo.name}:`, error);
                setAssets(null);
                setTotalValue(0);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [walletInfo.address, solana.fetchWalletAssets, walletInfo.name]);

    return (
        <div className="glassmorphism p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col">
            <h3 className="text-xl font-bold mb-1 text-text-primary font-display">{walletInfo.name}</h3>
            <div className="mb-4">
                <AddressDisplay address={walletInfo.address} />
            </div>
            {loading ? (
                 <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-light" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-surface-dark rounded-xl border border-border-color">
                        <div>
                            <p className="text-sm text-text-secondary flex items-center gap-1.5"><TrendingUp size={14}/> {t('token_types')}</p>
                            <p className="text-2xl font-bold font-display">{assets?.tokens.length ?? 0}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-text-secondary flex items-center justify-end gap-1.5"><DollarSign size={14}/> {t('total_value')}</p>
                            <p className="text-2xl font-bold text-success font-display">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2 flex-grow">
                        {assets && assets.tokens.length > 0 ? assets.tokens.slice(0, 10).map(token => ( // Show top 10 tokens
                             <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/dashboard`}>
                                <a className="grid grid-cols-2 gap-4 items-center py-2 px-2 rounded-lg hover:bg-surface-dark transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{token.logo}</div>
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{token.symbol}</p>
                                            <p className="text-xs text-text-secondary truncate">
                                                @ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold font-mono">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                                        <p className="text-xs text-text-secondary">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </a>
                            </Link>
                        )) : (
                             <div className="flex justify-center items-center h-full text-text-secondary">
                                <p>{t('profile_no_tokens')}</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default function Dashboard() {
    const { t } = useAppContext();
    const wallets: Omit<Wallet, 'balances' | 'totalUsdValue'>[] = [
        { name: t('wallet_name_presale'), address: DISTRIBUTION_WALLETS.presale },
        { name: t('wallet_name_impact_treasury'), address: DISTRIBUTION_WALLETS.impactTreasury },
        { name: t('wallet_name_community'), address: DISTRIBUTION_WALLETS.community },
        { name: t('wallet_name_team'), address: DISTRIBUTION_WALLETS.team },
        { name: t('wallet_name_marketing'), address: DISTRIBUTION_WALLETS.marketing },
        { name: t('wallet_name_advisors'), address: DISTRIBUTION_WALLETS.advisors },
    ];

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">{t('wallet_monitor')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                    {t('wallet_monitor_desc')}
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map(wallet => (
                    <WalletCard key={wallet.address} walletInfo={wallet} />
                ))}
            </div>
        </div>
    );
}