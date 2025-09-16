
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2, Calendar, Repeat, Zap, Star, ExternalLink, RefreshCw } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ParsedTransaction } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { formatNumber } from '../lib/utils.js';
import { SolIcon, GenericTokenIcon } from '../components/IconComponents.js';
// FIX: Import LAMPORTS_PER_SOL constant from @solana/web3.js to resolve reference error.
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value: string | number, isLoading: boolean }) => (
    <div className="bg-[#1C1C1E] dark:bg-darkPrimary-800 p-4 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 dark:text-darkPrimary-400 mb-1">{title}</p>
        {isLoading ? (
            <div className="h-7 w-24 bg-gray-700 rounded animate-pulse"></div>
        ) : (
            <p className="text-xl font-bold font-mono text-white dark:text-darkPrimary-100">{value}</p>
        )}
    </div>
);

const KNOWN_PROGRAMS: Record<string, { name: string; icon?: React.ReactNode }> = {
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': { name: 'Token Program' },
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpLgL': { name: 'Token 2022' },
    '11111111111111111111111111111111': { name: 'System Program' },
    'ComputeBudget111111111111111111111111111111': { name: 'Compute Budget' },
    'AddressLookupTab1e1111111111111111111111111': { name: 'Address Lookup' },
    'Vote111111111111111111111111111111111111111': { name: 'Vote Program' },
    'raydium-amm-v4': { name: 'Raydium AMM', icon: <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/8526.png" className="w-5 h-5 rounded-full" /> }, // Placeholder, use actual ID
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': { name: 'Metaplex', icon: <img src="https://pbs.twimg.com/profile_images/1649155845530124290/Y-QI5h6c_400x400.jpg" className="w-5 h-5 rounded-full" /> },
};


const parseTransaction = (tx: ParsedTransaction, userAddress: string) => {
    const { transaction, meta } = tx;
    const mainInstruction = transaction.message.instructions.find(ix => ix.programId.toBase58() !== 'ComputeBudget111111111111111111111111111111');
    const programId = mainInstruction?.programId.toBase58() || "Unknown";
    const programInfo = KNOWN_PROGRAMS[programId] || { name: `${programId.slice(0, 4)}...${programId.slice(-4)}` };

    const preBalances = meta?.preTokenBalances?.filter(b => b.owner === userAddress) || [];
    const postBalances = meta?.postTokenBalances?.filter(b => b.owner === userAddress) || [];

    const changes: { mint: string; change: number; symbol?: string; icon?: React.ReactNode }[] = [];
    const balanceMap = new Map<string, { pre: number, post: number }>();

    preBalances.forEach(b => balanceMap.set(b.mint, { pre: b.uiTokenAmount.uiAmount || 0, post: 0 }));
    postBalances.forEach(b => {
        const existing = balanceMap.get(b.mint) || { pre: 0, post: 0 };
        balanceMap.set(b.mint, { ...existing, post: b.uiTokenAmount.uiAmount || 0 });
    });

    for (const [mint, { pre, post }] of balanceMap.entries()) {
        if (pre !== post) {
            changes.push({ mint, change: post - pre });
        }
    }
    
    // Check for SOL changes
    const preSol = meta?.preBalances.find((b, i) => transaction.message.accountKeys[i].pubkey.toBase58() === userAddress);
    const postSol = meta?.postBalances.find((b, i) => transaction.message.accountKeys[i].pubkey.toBase58() === userAddress);
    if(preSol !== undefined && postSol !== undefined && preSol !== postSol) {
         changes.push({ mint: 'SOL', change: (postSol - preSol - (meta?.fee || 0)) / LAMPORTS_PER_SOL, symbol: 'SOL', icon: <SolIcon className="w-5 h-5"/> });
    }

    const received = changes.filter(c => c.change > 0);
    const sent = changes.filter(c => c.change < 0);

    return { programInfo, received, sent };
};


const ActivityTab = () => {
    const { t, solana } = useAppContext();
    const { getTransactionHistory, address } = solana;
    const [history, setHistory] = useState<ParsedTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [canLoadMore, setCanLoadMore] = useState(true);

    const loadHistory = useCallback(async (before?: string) => {
        setIsLoading(true);
        const newTxs = await getTransactionHistory({ limit: 20, before });
        if (newTxs.length < 20) {
            setCanLoadMore(false);
        }
        setHistory(prev => before ? [...prev, ...newTxs] : newTxs);
        setIsLoading(false);
    }, [getTransactionHistory]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleLoadMore = () => {
        if (history.length > 0) {
            const lastSignature = history[history.length - 1].signature;
            loadHistory(lastSignature);
        }
    };

    const groupedHistory = useMemo(() => {
        return history.reduce((acc, tx) => {
            const date = new Date((tx.blockTime || 0) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(tx);
            return acc;
        }, {} as Record<string, ParsedTransaction[]>);
    }, [history]);


    return (
        <div className="space-y-4">
             {Object.entries(groupedHistory).map(([date, txs]) => (
                <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                         <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                         <h4 className="text-sm font-semibold text-gray-400">{date}</h4>
                    </div>
                    <div className="bg-[#1C1C1E] dark:bg-darkPrimary-800/50 border border-white/10 rounded-lg p-2 space-y-2">
                        {txs.map(tx => {
                            if (!address) return null;
                            const { programInfo, received, sent } = parseTransaction(tx, address);
                            return (
                                <div key={tx.signature} className="grid grid-cols-12 gap-4 items-center p-2 text-sm">
                                    <div className="col-span-2 text-gray-400">{new Date(tx.blockTime! * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        {programInfo.icon || <div className="w-5 h-5 rounded-full bg-gray-600 flex-shrink-0"></div>}
                                        <span>{programInfo.name}</span>
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                         {received.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-green-400">
                                                {item.icon || <GenericTokenIcon className="w-5 h-5"/>}
                                                <span>+{item.change.toLocaleString(undefined, { maximumFractionDigits: 5 })} {item.symbol || 'tokens'}</span>
                                            </div>
                                         ))}
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                         {sent.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-red-400">
                                                {item.icon || <GenericTokenIcon className="w-5 h-5"/>}
                                                <span>{item.change.toLocaleString(undefined, { maximumFractionDigits: 5 })} {item.symbol || 'tokens'}</span>
                                            </div>
                                         ))}
                                    </div>
                                    <div className="col-span-1 text-xs text-gray-500">Signer</div>
                                    <div className="col-span-1 text-right">
                                        <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             ))}
             {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400"/></div>}
             {canLoadMore && !isLoading && (
                <div className="text-center">
                    <button onClick={handleLoadMore} className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-semibold py-2 px-4 rounded-lg">Load More</button>
                </div>
             )}
        </div>
    );
};


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading, userStats, onChainStats, loadingStats, getOnChainStats } = solana;
    
    const [activeTab, setActiveTab] = useState<'positions' | 'activity'>('positions');
    
    useEffect(() => {
        if(connected && address) {
            getOnChainStats();
        }
    }, [connected, address, getOnChainStats]);
    
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
                    disabled={loading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8 bg-[#121212] dark:bg-darkPrimary-950 text-white dark:text-darkPrimary-200 -m-8 p-8 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('my_profile')}</h1>
                    {address && <AddressDisplay address={address} className="text-gray-400" />}
                </div>
                <button onClick={() => getOnChainStats(true)} disabled={loadingStats} className="p-2 rounded-full hover:bg-white/10">
                    <RefreshCw size={18} className={loadingStats ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-[#1C1C1E] dark:bg-darkPrimary-800 border border-white/10 rounded-lg p-6">
                 <p className="text-sm text-gray-400 dark:text-darkPrimary-400">{t('total_value')}</p>
                 <p className="text-4xl font-bold">
                    ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </p>
            </div>
            
            <div>
                 <h2 className="text-xl font-bold mb-4">On-Chain Snapshot</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Calendar size={24} />} title="Wallet Age" value={`${onChainStats.walletAgeDays} days`} isLoading={loadingStats} />
                    <StatCard icon={<Repeat size={24} />} title="Total Transactions" value={onChainStats.totalTransactions.toLocaleString()} isLoading={loadingStats} />
                    <StatCard icon={<Zap size={24} />} title="Total Fees Paid" value={`${onChainStats.totalFeesSol.toFixed(5)} SOL`} isLoading={loadingStats} />
                    <StatCard icon={<Star size={24} />} title="Favorite Program" value={onChainStats.favoriteProgram} isLoading={loadingStats} />
                 </div>
            </div>

            <div className="border-b border-gray-700 flex space-x-4">
                 <button onClick={() => setActiveTab('positions')} className={`py-2 px-1 font-semibold transition-colors ${activeTab === 'positions' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Positions</button>
                 <button onClick={() => setActiveTab('activity')} className={`py-2 px-1 font-semibold transition-colors ${activeTab === 'activity' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Activity</button>
            </div>

            <div>
                {activeTab === 'positions' && (
                     <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400 flex items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>{t('profile_loading_tokens')}</span>
                            </div>
                        ) : userTokens.length > 0 ? (
                            userTokens.map(token => (
                                <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                    <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                                {React.isValidElement(token.logo) ? token.logo : <img src={token.logo as string} alt={token.name} className="w-full h-full rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="font-bold">{token.symbol}</p>
                                                <p className="text-sm text-gray-400">{token.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono">
                                            <p className="font-semibold">{formatNumber(token.balance)}</p>
                                            <p className="text-sm text-gray-400">@ ${token.pricePerToken > 0.01 ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : token.pricePerToken.toPrecision(4)}</p>
                                        </div>
                                        <div className="text-right font-semibold font-mono">
                                            ${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    </a>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>{t('profile_no_tokens')}</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'activity' && <ActivityTab />}
            </div>
        </div>
    );
}
