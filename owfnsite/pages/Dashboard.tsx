import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS, OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES } from '../constants.ts';
import type { Wallet, Token } from '../types.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';

type WalletData = {
    loading: boolean;
    tokens: Token[];
    totalValue: number;
}

const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
    [OWFN_MINT_ADDRESS]: <OwfnIcon />,
    [KNOWN_TOKEN_MINT_ADDRESSES.SOL]: <SolIcon />,
    [KNOWN_TOKEN_MINT_ADDRESSES.USDC]: <UsdcIcon />,
    [KNOWN_TOKEN_MINT_ADDRESSES.USDT]: <UsdtIcon />,
};

const WalletCard = ({ name, address, data }: { name: string, address: string, data: WalletData }) => {
    const { t } = useAppContext();
    const { loading, tokens, totalValue } = data;

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
            <h3 className="text-xl font-bold mb-1">{name}</h3>
            <div className="mb-4">
                <AddressDisplay address={address} />
            </div>
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="h-12 bg-primary-200 dark:bg-darkPrimary-700 rounded"></div>
                        <div className="h-12 bg-primary-200 dark:bg-darkPrimary-700 rounded"></div>
                    </div>
                    <div className="h-8 bg-primary-200 dark:bg-darkPrimary-700 rounded w-full"></div>
                    <div className="h-8 bg-primary-200 dark:bg-darkPrimary-700 rounded w-full"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg">
                        <div>
                            <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('token_types')}</p>
                            <p className="text-2xl font-bold">{tokens.length}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('total_value')}</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                        {tokens.length > 0 ? tokens.map(token => (
                             <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/dashboard`}>
                                <a className="grid grid-cols-2 gap-4 items-center py-2 px-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <GenericTokenIcon uri={token.logo as string} className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{token.symbol}</p>
                                            <p className="text-xs text-primary-500 dark:text-darkPrimary-500">
                                                @ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold font-mono">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
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
    
    const [walletsData, setWalletsData] = useState<Record<string, WalletData>>(() => {
        const initialState: Record<string, WalletData> = {};
        wallets.forEach(w => {
            initialState[w.address] = { loading: true, tokens: [], totalValue: 0 };
        });
        return initialState;
    });

    const fetchAllBalances = useCallback(async () => {
        try {
            const addresses = wallets.map(w => w.address);
            const response = await fetch('/api/batch-wallet-balances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresses }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch batch balances');
            }

            const data: Record<string, any[]> = await response.json();
            
            const newState: Record<string, WalletData> = {};
            for (const address in data) {
                const rawTokens = data[address];
                const tokens: Token[] = rawTokens.map((token: any) => ({
                    ...token,
                    logo: KNOWN_TOKEN_ICONS[token.mintAddress] || <GenericTokenIcon uri={token.logoUri} />,
                }));

                const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
                newState[address] = { loading: false, tokens, totalValue };
            }
            setWalletsData(prevState => ({...prevState, ...newState}));

        } catch (error) {
            console.error("Error fetching batch wallet balances:", error);
            // Set all to non-loading with empty data on error
            setWalletsData(prevState => {
                const errorState = { ...prevState };
                wallets.forEach(w => {
                     errorState[w.address] = { loading: false, tokens: [], totalValue: 0 };
                });
                return errorState;
            });
        }
    }, [wallets.map(w => w.address).join(',')]); // Dependency on joined addresses string

    useEffect(() => {
        fetchAllBalances();
    }, [fetchAllBalances]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('wallet_monitor')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('wallet_monitor_desc')}
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map(wallet => (
                    <WalletCard 
                        key={wallet.address} 
                        name={wallet.name}
                        address={wallet.address}
                        data={walletsData[wallet.address]} 
                    />
                ))}
            </div>
        </div>
    );
}