import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import type { Wallet, Token } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { Loader2 } from 'lucide-react';

const WalletCard = ({ walletInfo }: { walletInfo: Omit<Wallet, 'balances' | 'totalUsdValue'> }) => {
    const { t, solana } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<Token[]>([]);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        const fetchBalances = async () => {
            if (!solana.fetchWalletAssets) return;
            setLoading(true);
            try {
                const { tokens } = await solana.fetchWalletAssets(walletInfo.address);
                setBalances(tokens);
                setTotalValue(tokens.reduce((sum, token) => sum + token.usdValue, 0));
            } catch (error) {
                console.error(`Failed to fetch assets for ${walletInfo.name}:`, error);
                setBalances([]);
                setTotalValue(0);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [walletInfo.address, solana.fetchWalletAssets, walletInfo.name]);

    return (
        <div className="glassmorphism p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-1 text-text-primary">{walletInfo.name}</h3>
            <div className="mb-4">
                <AddressDisplay address={walletInfo.address} />
            </div>
            {loading ? (
                 <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-light" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-surface-dark rounded-lg">
                        <div>
                            <p className="text-sm text-text-secondary">{t('token_types')}</p>
                            <p className="text-2xl font-bold">{balances.length}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-text-secondary">{t('total_value')}</p>
                            <p className="text-2xl font-bold text-success">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                        {balances.length > 0 ? balances.map(token => (
                             <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/dashboard`}>
                                <a className="grid grid-cols-2 gap-4 items-center py-2 px-2 rounded-md hover:bg-surface-light transition-colors cursor-pointer">
                                    {/* Asset Info */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{token.logo}</div>
                                        <div>
                                            <p className="font-semibold">{token.symbol}</p>
                                            <p className="text-xs text-text-secondary">
                                                @ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Balance & Value */}
                                    <div className="text-right">
                                        <p className="font-semibold font-mono">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                                        <p className="text-xs text-text-secondary">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </a>
                            </Link>
                        )) : (
                             <div className="text-center py-8 text-text-secondary">
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
                <h1 className="text-4xl font-display font-bold text-accent-light">{t('wallet_monitor')}</h1>
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