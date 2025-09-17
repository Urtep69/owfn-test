import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Award, Gem, Loader2, History, ShoppingCart, Gift, ExternalLink } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ImpactBadge } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS, DISTRIBUTION_WALLETS, PRESALE_STAGES, TOKEN_DETAILS, QUICKNODE_RPC_URL } from '../lib/constants.js';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.js';
import { formatNumber } from '../lib/utils.js';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolIcon, OwfnIcon } from '../components/IconComponents.js';

const currentStage = PRESALE_STAGES[0];

interface PersonalTransaction {
    signature: string;
    type: 'Presale' | 'Donation';
    solAmount: number;
    timestamp: number;
    blockTime: number;
}

interface UserImpactStats {
    totalSolContributed: number;
    totalOwfnToReceive: bigint;
    totalSolDonated: number;
    transactionHistory: PersonalTransaction[];
}

const StatCardSkeleton = () => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4 animate-pulse">
        <div className="w-12 h-12 bg-primary-200 dark:bg-darkPrimary-600 rounded-full"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-primary-200 dark:bg-darkPrimary-600 rounded w-1/2"></div>
            <div className="h-6 bg-primary-200 dark:bg-darkPrimary-600 rounded w-3/4"></div>
        </div>
    </div>
);

const HistoryRowSkeleton = () => (
    <div className="flex justify-between items-center p-4 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-darkPrimary-700"></div>
            <div className="space-y-2">
                <div className="h-4 bg-primary-200 dark:bg-darkPrimary-700 rounded w-24"></div>
                <div className="h-3 bg-primary-200 dark:bg-darkPrimary-700 rounded w-32"></div>
            </div>
        </div>
        <div className="h-5 bg-primary-200 dark:bg-darkPrimary-700 rounded w-20"></div>
    </div>
);


const StatCard = ({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string | number, subtext?: React.ReactNode }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400 p-3 bg-primary-200 dark:bg-darkPrimary-600 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtext && <div className="text-xs text-primary-500 dark:text-darkPrimary-500">{subtext}</div>}
        </div>
    </div>
);

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Wallet /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading: tokensLoading } = solana;
    
    const [isScanning, setIsScanning] = useState(true);
    const [userStats, setUserStats] = useState<UserImpactStats | null>(null);

    useEffect(() => {
        const scanUserHistory = async () => {
            if (!connected || !address) {
                setIsScanning(false);
                return;
            }

            setIsScanning(true);
            setUserStats(null);

            try {
                const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
                const userPublicKey = new PublicKey(address);
                const signatures = await connection.getSignaturesForAddress(userPublicKey, { limit: 1000 });

                if (signatures.length === 0) {
                    setUserStats({ totalSolContributed: 0, totalOwfnToReceive: 0n, totalSolDonated: 0, transactionHistory: [] });
                    setIsScanning(false);
                    return;
                }

                const transactionsData = await connection.getParsedTransactions(
                    signatures.map(s => s.signature),
                    { maxSupportedTransactionVersion: 0 }
                );

                const foundTransactions: PersonalTransaction[] = [];
                transactionsData.forEach((tx, index) => {
                    if (tx && tx.blockTime) {
                        tx.transaction.message.instructions.forEach(inst => {
                             if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.source === address) {
                                const destination = inst.parsed.info.destination;
                                const solAmount = inst.parsed.info.lamports / LAMPORTS_PER_SOL;
                                
                                if (destination === DISTRIBUTION_WALLETS.presale) {
                                    foundTransactions.push({
                                        signature: signatures[index].signature,
                                        type: 'Presale',
                                        solAmount,
                                        timestamp: tx.blockTime! * 1000,
                                        blockTime: tx.blockTime!
                                    });
                                } else if (destination === DISTRIBUTION_WALLETS.impactTreasury) {
                                    foundTransactions.push({
                                        signature: signatures[index].signature,
                                        type: 'Donation',
                                        solAmount,
                                        timestamp: tx.blockTime! * 1000,
                                        blockTime: tx.blockTime!
                                    });
                                }
                            }
                        });
                    }
                });

                const presaleTxs = foundTransactions.filter(tx => tx.type === 'Presale').sort((a,b) => a.blockTime - b.blockTime);
                const donationTxs = foundTransactions.filter(tx => tx.type === 'Donation');
                const totalSolDonated = donationTxs.reduce((sum, tx) => sum + tx.solAmount, 0);

                let totalSolContributed = 0;
                let totalOwfnToReceive = 0n;
                const presaleRateBigInt = BigInt(currentStage.rate);
                const owfnDecimalsMultiplier = 10n ** BigInt(TOKEN_DETAILS.decimals);
                const sortedTiers = [...currentStage.bonusTiers].sort((a, b) => b.threshold - a.threshold);
                const MAX_CONTRIBUTION_SOL = currentStage.maxBuy;
                
                let solContributedSoFar = 0;
                for (const tx of presaleTxs) {
                    if (solContributedSoFar >= MAX_CONTRIBUTION_SOL) break;

                    const roomLeft = MAX_CONTRIBUTION_SOL - solContributedSoFar;
                    const amountToProcess = Math.min(tx.solAmount, roomLeft);

                    const lamportsToProcess = BigInt(Math.round(amountToProcess * LAMPORTS_PER_SOL));
                    const baseOwfn = (lamportsToProcess * presaleRateBigInt * owfnDecimalsMultiplier) / BigInt(LAMPORTS_PER_SOL);
                    
                    const applicableTier = sortedTiers.find(tier => tx.solAmount >= tier.threshold);
                    let bonusOwfn = 0n;
                    if (applicableTier) {
                        bonusOwfn = (baseOwfn * BigInt(applicableTier.percentage)) / 100n;
                    }

                    totalOwfnToReceive += baseOwfn + bonusOwfn;
                    solContributedSoFar += amountToProcess;
                }
                totalSolContributed = solContributedSoFar;

                setUserStats({
                    totalSolContributed,
                    totalOwfnToReceive,
                    totalSolDonated,
                    transactionHistory: foundTransactions.sort((a,b) => b.timestamp - a.timestamp).slice(0, 10)
                });

            } catch (error) {
                console.error("Failed to scan user transaction history:", error);
            } finally {
                setIsScanning(false);
            }
        };

        scanUserHistory();
    }, [connected, address]);


    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={tokensLoading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {tokensLoading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-2">{t('my_impact_stats')}</h2>
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400 mb-4">{t('profile_impact_stats_desc')}</p>
                
                {isScanning ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>
                ) : userStats ? (
                     <div className="grid md:grid-cols-2 gap-4">
                        <StatCard 
                            icon={<ShoppingCart size={24} />} 
                            title={t('profile_presale_contribution_title')}
                            value={`${formatNumber(userStats.totalSolContributed)} SOL`}
                            subtext={
                                <div className="flex items-center gap-1.5 font-semibold">
                                     <OwfnIcon className="w-4 h-4" />
                                     {formatNumber(Number(userStats.totalOwfnToReceive) / (10 ** TOKEN_DETAILS.decimals))} OWFN
                                     <span className="font-normal text-xs">({t('profile_owfn_to_receive')})</span>
                                </div>
                            }
                        />
                        <StatCard 
                            icon={<Gift size={24} />} 
                            title={t('profile_donation_impact_title')}
                            value={`${formatNumber(userStats.totalSolDonated)} SOL`}
                            subtext={t('profile_total_sol_donated')}
                        />
                    </div>
                ) : null}
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                 <h2 className="text-2xl font-bold mb-4">{t('profile_my_tx_history_title')}</h2>
                 {isScanning ? (
                    <div className="space-y-2">
                        <HistoryRowSkeleton />
                        <HistoryRowSkeleton />
                        <HistoryRowSkeleton />
                    </div>
                 ) : userStats && userStats.transactionHistory.length > 0 ? (
                    <div className="space-y-2">
                        {userStats.transactionHistory.map(tx => (
                            <div key={tx.signature} className="flex flex-wrap justify-between items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${tx.type === 'Presale' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {tx.type === 'Presale' ? <ShoppingCart size={20}/> : <Gift size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-bold">{t(tx.type === 'Presale' ? 'profile_tx_type_presale' : 'profile_tx_type_donation')}</p>
                                        <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{new Date(tx.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 font-mono font-semibold">
                                        <SolIcon className="w-4 h-4" />
                                        <span>{tx.solAmount.toFixed(4)}</span>
                                    </div>
                                    <a
                                        href={`https://solscan.io/tx/${tx.signature}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`View transaction ${tx.signature.slice(0, 6)} on Solscan`}
                                        className="text-primary-400 hover:text-accent-500 dark:text-darkPrimary-500 dark:hover:text-darkAccent-400 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400">
                        <History className="mx-auto w-12 h-12 mb-4"/>
                        <p>{t('profile_no_tx_found')}</p>
                    </div>
                 )}
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
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-primary-500 dark:text-darkPrimary-500 font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {/* Token List */}
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
                                        <p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p>
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                    </div>
                                    <div className="text-right font-semibold font-mono text-primary-900 dark:text-darkPrimary-100">
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

            <div className="grid lg:grid-cols-2 gap-8">
                <ComingSoonWrapper showMessage={false}>
                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-4">{t('impact_trophies_nfts')}</h2>
                         <div className="text-center py-8 text-primary-500 dark:text-darkPrimary-400">
                           <Award className="mx-auto w-12 h-12 mb-4"/>
                           <p>{t('coming_soon_title')}</p>
                        </div>
                    </div>
                </ComingSoonWrapper>
                 <ComingSoonWrapper showMessage={false}>
                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-4">{t('impact_badges')}</h2>
                         <div className="flex flex-wrap gap-4 justify-center">
                            {MOCK_BADGES.map(badge => (
                                 <div key={badge.id} className="group relative flex flex-col items-center text-center w-24">
                                    <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-full p-4 text-accent-500 dark:text-darkAccent-400 group-hover:scale-110 transition-transform">
                                        {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                                    </div>
                                    <p className="text-sm font-semibold mt-2">{t(badge.titleKey)}</p>
                                    <div className="absolute bottom-full mb-2 w-48 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {t(badge.descriptionKey)}
                                        <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ComingSoonWrapper>
            </div>
        </div>
    );
}