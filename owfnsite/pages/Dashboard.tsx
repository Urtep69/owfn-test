import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import type { Wallet, Token } from '../types.ts';
import { OwfnIcon } from '../components/IconComponents.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { formatNumber } from '../lib/utils.ts';
import { ArrowRight, DollarSign, Users, PieChart } from 'lucide-react';
import { AnimatedNumber } from '../components/AnimatedNumber.tsx';

const WalletCard = ({ walletInfo, gridClass = '' }: { walletInfo: Omit<Wallet, 'balances' | 'totalUsdValue'>, gridClass?: string }) => {
    const { t, solana } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [balances, setBalances] = useState<Token[]>([]);

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true);
            try {
                const fetchedBalances = await solana.getWalletBalances(walletInfo.address);
                // Display all tokens, even those without USD value, as requested.
                setBalances(fetchedBalances);
                setTotalValue(fetchedBalances.reduce((sum, token) => sum + token.usdValue, 0));
            } catch (error) {
                console.error(`Failed to fetch balances for ${walletInfo.name} (${walletInfo.address}):`, error);
                setBalances([]);
                setTotalValue(0);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [walletInfo.address, solana.getWalletBalances]);

    return (
        <div className={`bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d transition-all duration-300 hover:shadow-3d-lg hover:-translate-y-1 transform-style-3d group perspective-1000 flex flex-col ${gridClass}`}>
            <div className="transition-transform duration-500 group-hover:rotate-x-[5deg] flex flex-col flex-grow">
                <h3 className="text-lg font-bold font-serif mb-1">{walletInfo.name}</h3>
                <div className="mb-4">
                    <AddressDisplay address={walletInfo.address} />
                </div>
                {loading ? (
                    <>
                        <div className="h-16 bg-primary-200 dark:bg-darkPrimary-700 rounded-lg animate-pulse"></div>
                        <div className="mt-4 pt-4 border-t border-primary-200 dark:border-darkPrimary-700/50 space-y-3 flex-grow">
                            <div className="h-8 bg-primary-200 dark:bg-darkPrimary-700 rounded animate-pulse"></div>
                            <div className="h-8 bg-primary-200 dark:bg-darkPrimary-700 rounded animate-pulse"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('total_value')}</p>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                               $<AnimatedNumber value={totalValue} />
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary-200 dark:border-darkPrimary-700/50 flex-grow flex flex-col">
                            <h4 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-500 mb-2">Assets</h4>
                            {balances.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {balances.map(token => (
                                        <div key={token.mintAddress} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                {/* FIX: Add a more specific type assertion to let TypeScript know that the cloned element accepts a className prop. */}
                                                {React.isValidElement(token.logo) ? React.cloneElement(token.logo as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' }) : null}
                                                <span className="font-semibold text-primary-800 dark:text-darkPrimary-200">{token.symbol}</span>
                                            </div>
                                            <div className="text-right font-mono">
                                                <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                                <p className="text-xs text-primary-500 dark:text-darkPrimary-400">${token.usdValue.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-sm text-center text-primary-500 dark:text-darkPrimary-400">This wallet is empty.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const FundFlowDiagram = () => {
    const wallets = [
        { name: 'Presale', gridPos: 'row-start-1 col-start-1' },
        { name: 'Liquidity', gridPos: 'row-start-2 col-start-1' },
        { name: 'Impact Treasury', gridPos: 'row-start-1 col-start-3' },
        { name: 'Team', gridPos: 'row-start-2 col-start-3' },
        { name: 'Community', gridPos: 'row-start-3 col-start-3' },
    ];
    
    return (
        <div className="relative grid grid-cols-3 grid-rows-3 gap-x-8 gap-y-4 p-4 text-center">
            {/* Arrows */}
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-current text-primary-300 dark:text-darkPrimary-600" />
                    </marker>
                </defs>
                {/* Presale to Treasury */}
                <line x1="33%" y1="20%" x2="67%" y2="20%" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" className="text-primary-300 dark:text-darkPrimary-600" />
                {/* Presale to Liquidity */}
                 <line x1="16.5%" y1="20%" x2="16.5%" y2="50%" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" className="text-primary-300 dark:text-darkPrimary-600" />

                 {/* Treasury to Team & Community */}
                 <line x1="83.5%" y1="20%" x2="83.5%" y2="80%" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" className="text-primary-300 dark:text-darkPrimary-600" />
            </svg>

            {/* Wallets */}
            {wallets.map(w => (
                <div key={w.name} className={`relative z-10 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg p-2 text-xs sm:text-sm font-semibold shadow-inner-3d ${w.gridPos}`}>
                    {w.name}
                </div>
            ))}
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
                <h1 className="text-4xl font-bold font-serif text-accent-600 dark:text-darkAccent-400">{t('wallet_monitor')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('wallet_monitor_desc')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bento Grid Layout */}
                <div className="lg:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d">
                     <h3 className="text-xl font-bold font-serif mb-4">Fund Flow Visualization</h3>
                     <FundFlowDiagram />
                </div>
                
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d flex flex-col justify-center items-center text-center">
                     <PieChart className="w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4"/>
                     <h3 className="text-xl font-bold font-serif">Tokenomics Overview</h3>
                     <p className="text-primary-600 dark:text-darkPrimary-400 text-sm mt-2 mb-4">A sustainable model for long-term impact and growth.</p>
                     <Link to="/tokenomics" className="font-bold text-accent-600 dark:text-darkAccent-400 hover:underline flex items-center gap-2">
                        {t('view_full_details')} <ArrowRight size={16} />
                     </Link>
                </div>

                {wallets.map(wallet => (
                    <WalletCard key={wallet.address} walletInfo={wallet} />
                ))}
            </div>
        </div>
    );
}