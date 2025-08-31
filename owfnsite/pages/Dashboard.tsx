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

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true);
            const fetchedBalances = await solana.getWalletBalances(walletInfo.address);
            setTotalValue(fetchedBalances.reduce((sum, token) => sum + token.usdValue, 0));
            setLoading(false);
        };
        fetchBalances();
    }, [walletInfo.address, solana.getWalletBalances]);

    return (
        <div className={`bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d transition-all duration-300 hover:shadow-3d-lg hover:-translate-y-1 transform-style-3d group perspective-1000 ${gridClass}`}>
            <div className="transition-transform duration-500 group-hover:rotate-x-[5deg]">
                <h3 className="text-lg font-bold font-serif mb-1">{walletInfo.name}</h3>
                <div className="mb-4">
                    <AddressDisplay address={walletInfo.address} />
                </div>
                {loading ? (
                    <div className="h-16 bg-primary-200 dark:bg-darkPrimary-700 rounded-lg animate-pulse"></div>
                ) : (
                    <div>
                        <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('total_value')}</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                           $<AnimatedNumber value={totalValue} />
                        </p>
                    </div>
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