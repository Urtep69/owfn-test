

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import type { Wallet, Token } from '../types.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';

const walletDisplayTokens = [
    { symbol: 'OWFN', name: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', name: 'Solana', icon: <SolIcon /> },
    { symbol: 'USDC', name: 'USD Coin', icon: <UsdcIcon /> },
    { symbol: 'USDT', name: 'Tether', icon: <UsdtIcon /> },
];

const WalletCard = ({ wallet }: { wallet: Wallet }) => {
    const { t } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<Token[]>([]);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true);
            await new Promise(res => setTimeout(res, 500 + Math.random() * 1000));
            
            const mockBalances = walletDisplayTokens.map(displayToken => ({
                name: displayToken.name,
                symbol: displayToken.symbol,
                mintAddress: '...', // Mock address
                logo: displayToken.icon,
                balance: Math.random() * (displayToken.symbol === 'SOL' ? 100 : 1e8),
                usdValue: Math.random() * (displayToken.symbol === 'SOL' ? 15000 : 1e5),
            }));

            setBalances(mockBalances);
            setTotalValue(mockBalances.reduce((sum, token) => sum + token.usdValue, 0));
            setLoading(false);
        };
        fetchBalances();
    }, [wallet.address]);

    return (
        <div className="bg-primary-800 p-6 rounded-lg shadow-3d">
            <h3 className="text-xl font-bold mb-1">{wallet.name}</h3>
            <div className="mb-4">
                <AddressDisplay address={wallet.address} />
            </div>
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-primary-700 rounded w-3/4"></div>
                    <div className="h-4 bg-primary-700 rounded w-1/2"></div>
                    <div className="h-4 bg-primary-700 rounded w-5/6"></div>
                    <div className="h-4 bg-primary-700 rounded w-2/3"></div>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <span className="font-bold text-2xl">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-primary-400 ml-2">{t('total_value')}</span>
                    </div>
                    <div className="space-y-1">
                        {balances.map(token => (
                            <Link to={`/dashboard/token/${token.symbol}?from=/dashboard`} key={token.symbol} className="block -mx-2">
                                <div className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-primary-700/50 cursor-pointer transition-colors duration-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center">{token.logo}</div>
                                        <span className="font-semibold">{token.symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        <p className="text-xs text-primary-400">${token.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
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
                <h1 className="text-4xl font-bold text-accent-400">{t('wallet_monitor')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-400">
                    {t('wallet_monitor_desc')}
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map(wallet => (
                    <WalletCard key={wallet.address} wallet={{...wallet, balances: [], totalUsdValue: 0}} />
                ))}
            </div>
        </div>
    );
}
