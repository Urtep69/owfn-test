import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { DISTRIBUTION_WALLETS } from '../lib/constants.js';
import type { Wallet, Token } from '../lib/types.js';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';

const WalletCard = ({ walletInfo }: { walletInfo: Omit<Wallet, 'balances' | 'totalUsdValue'> }) => {
    const { t, solana } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<Token[]>([]);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true);
            const fetchedBalances = await solana.getWalletBalances(walletInfo.address);
            setBalances(fetchedBalances);
            setTotalValue(fetchedBalances.reduce((sum, token) => sum + token.usdValue, 0));
            setLoading(false);
        };
        fetchBalances();
    }, [walletInfo.address, solana.getWalletBalances]);

    return (
        <div className="bg-dextools-card border border-dextools-border p-6 rounded-md">
            <h3 className="text-xl font-bold mb-1 text-dextools-text-primary">{walletInfo.name}</h3>
            <div className="mb-4">
                <AddressDisplay address={walletInfo.address} />
            </div>
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="h-12 bg-dextools-border rounded"></div>
                        <div className="h-12 bg-dextools-border rounded"></div>
                    </div>
                    <div className="h-8 bg-dextools-border rounded w-full"></div>
                    <div className="h-8 bg-dextools-border rounded w-full"></div>
                    <div className="h-8 bg-dextools-border rounded w-full"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-dextools-background rounded-lg">
                        <div>
                            <p className="text-sm text-dextools-text-secondary">{t('token_types')}</p>
                            <p className="text-2xl font-bold text-dextools-text-primary">{balances.length}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-dextools-text-secondary">{t('total_value')}</p>
                            <p className="text-2xl font-bold text-dextools-accent-green">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                        {balances.length > 0 ? balances.map(token => (
                             <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/dashboard`}>
                                <a className="grid grid-cols-2 gap-4 items-center py-2 px-2 rounded-md hover:bg-dextools-border transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{token.logo}</div>
                                        <div>
                                            <p className="font-semibold text-dextools-text-primary">{token.symbol}</p>
                                            <p className="text-xs text-dextools-text-secondary">
                                                @ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold font-mono text-dextools-text-primary">{formatNumber(token.balance)}</p>
                                        <p className="text-xs text-dextools-text-secondary">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </a>
                            </Link>
                        )) : (
                             <div className="text-center py-8 text-dextools-text-secondary">
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
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('wallet_monitor')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-dextools-text-secondary">
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