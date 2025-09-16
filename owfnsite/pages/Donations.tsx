import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useAppContext } from '../contexts/AppContext.js';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, QUICKNODE_WSS_URL } from '../lib/constants.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.js';
import { AlertTriangle, Info, BarChart2, CalendarDays, TrendingUp, History } from 'lucide-react';
import { LiveDonationFeed } from '../components/LiveDonationFeed.js';
import type { DonationTransaction } from '../lib/types.js';
import { AnimatedNumber } from '../components/AnimatedNumber.js';
import { SkeletonLoader } from '../components/SkeletonLoader.js';
import { markJourneyAction } from '../lib/journeyManager.js';

const tokens = [
    { symbol: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', icon: <SolIcon /> },
    { symbol: 'USDC', icon: <UsdcIcon /> },
    { symbol: 'USDT', icon: <UsdtIcon /> },
];

// --- New Local Components for this page ---
const DonationStatsCardSkeleton = () => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d border border-primary-200 dark:border-darkPrimary-700/50">
        <div className="flex items-center gap-3 mb-4">
            <SkeletonLoader className="w-8 h-8 rounded-full" />
            <SkeletonLoader className="h-6 w-3/4" />
        </div>
        <div className="space-y-1 text-sm">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
                    <SkeletonLoader className="h-5 w-1/3" />
                    <SkeletonLoader className="h-5 w-1/4" />
                </div>
            ))}
        </div>
    </div>
);

const DonationStatsCard = ({ tokenSymbol, transactions, title }: { tokenSymbol: string, transactions: DonationTransaction[], title: string }) => {
    const { t } = useAppContext();

    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeekAgo = new Date(today.getTime() - 6 * oneDay);
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        let totalToday = 0;
        let totalLastWeek = 0;
        let totalLastMonth = 0;
        let totalAllTime = 0;

        for (const tx of transactions) {
            const txDate = tx.time;
            totalAllTime += tx.amount;
            if (txDate >= today) totalToday += tx.amount;
            if (txDate >= oneWeekAgo) totalLastWeek += tx.amount;
            if (txDate >= oneMonthAgo) totalLastMonth += tx.amount;
        }

        return { totalToday, totalLastWeek, totalLastMonth, totalAllTime };
    }, [transactions]);

    const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => {
        const numberFormatter = (val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        return (
            <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
                <div className="flex items-center gap-2 text-primary-600 dark:text-darkPrimary-400">
                    {icon}
                    <span>{label}</span>
                </div>
                <AnimatedNumber 
                    value={value} 
                    formatter={numberFormatter}
                    className="font-mono font-semibold text-primary-800 dark:text-darkPrimary-200"
                />
            </div>
        );
    };

    const getTokenIcon = (symbol: string) => {
        switch (symbol) {
            case 'OWFN': return <OwfnIcon className="w-8 h-8" />;
            case 'SOL': return <SolIcon className="w-8 h-8" />;
            case 'USDC': return <UsdcIcon className="w-8 h-8" />;
            case 'USDT': return <UsdtIcon className="w-8 h-8" />;
            default: return <GenericTokenIcon className="w-8 h-8" />;
        }
    };
    
    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all duration-300 transform hover:scale-105 border border-primary-200 dark:border-darkPrimary-700/50">
            <div className="flex items-center gap-3 mb-4">
                {getTokenIcon(tokenSymbol)}
                <h3 className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
            </div>
            <div className="space-y-1 text-sm">
                <StatRow icon={<CalendarDays size={16}/>} label={t('donations_today')} value={stats.totalToday} />
                <StatRow icon={<TrendingUp size={16}/>} label={t('donations_last_week')} value={stats.totalLastWeek} />
                <StatRow icon={<History size={16}/>} label={t('donations_last_month')} value={stats.totalLastMonth} />
                <StatRow icon={<BarChart2 size={16}/>} label={t('donations_all_time')} value={stats.totalAllTime} />
            </div>
        </div>
    );
};

const DonationStats = ({ allTransactions, isLoading }: { allTransactions: DonationTransaction[], isLoading: boolean }) => {
    const { t } = useAppContext();

    const categorizedTransactions = useMemo(() => {
        const categories: Record<string, DonationTransaction[]> = { SOL: [], USDC: [], USDT: [], OWFN: [] };
        for (const tx of allTransactions) {
            if (categories[tx.tokenSymbol]) {
                categories[tx.tokenSymbol].push(tx);
            }
        }
        return categories;
    }, [allTransactions]);
    
    const shouldShowSkeletons = isLoading && allTransactions.length === 0;

    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-8">{t('donations_stats_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {shouldShowSkeletons ? (
                    [...Array(4)].map((_, i) => <DonationStatsCardSkeleton key={i} />)
                ) : (
                    <>
                        <DonationStatsCard tokenSymbol="SOL" transactions={categorizedTransactions.SOL} title={t('donations_sol_stats_title')} />
                        <DonationStatsCard tokenSymbol="USDC" transactions={categorizedTransactions.USDC} title={t('donations_usdc_stats_title')} />
                        <DonationStatsCard tokenSymbol="USDT" transactions={categorizedTransactions.USDT} title={t('donations_usdt_stats_title')} />
                        <DonationStatsCard tokenSymbol="OWFN" transactions={categorizedTransactions.OWFN} title={t('donations_owfn_stats_title')} />
                    </>
                )}
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function Donations() {
    const { t, solana, setWalletModalOpen, addNotification, startTrackingTransaction } = useAppContext();
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('SOL');

    const [allDonations, setAllDonations] = useState<DonationTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const knownAtasRef = useRef<{ [ata: string]: string }>({});

    useEffect(() => {
        let isMounted = true;
        const impactPublicKey = new PublicKey(DISTRIBUTION_WALLETS.impactTreasury);
        const impactPublicKeyString = impactPublicKey.toBase58();
        let ws: WebSocket | null = null;

        const processTransaction = (tx: any, signature: string): DonationTransaction[] => {
            const results: DonationTransaction[] = [];
            if (!tx || !tx.blockTime) return results;
        
            const presumedSender = tx.transaction.message.accountKeys[0].pubkey;
        
            tx.transaction.message.instructions.forEach((inst: any) => {
                if (inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === impactPublicKeyString) {
                    results.push({
                        id: signature,
                        address: inst.parsed.info.source,
                        amount: inst.parsed.info.lamports / LAMPORTS_PER_SOL,
                        tokenSymbol: 'SOL',
                        time: new Date(tx.blockTime! * 1000),
                    });
                }
                if (inst.program === 'spl-token' && (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked') && knownAtasRef.current[inst.parsed.info.destination]) {
                    const destinationAta = inst.parsed.info.destination;
                    const tokenSymbol = knownAtasRef.current[destinationAta];
                    results.push({
                        id: signature,
                        address: inst.parsed.info.source,
                        amount: inst.parsed.info.tokenAmount.uiAmount,
                        tokenSymbol,
                        time: new Date(tx.blockTime! * 1000),
                    });
                }
            });
            return results;
        };
        
        const fetchInitialDataAndConnect = async () => {
            if (!isMounted) return;
            setIsLoading(true);
            try {
                const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');

                const ataPromises = Object.entries(KNOWN_TOKEN_MINT_ADDRESSES).map(async ([symbol, mint]) => {
                    if (symbol === 'SOL') return;
                     const ata = await connection.getParsedTokenAccountsByOwner(impactPublicKey, { mint: new PublicKey(mint) });
                     if(ata.value[0]) {
                        knownAtasRef.current[ata.value[0].pubkey.toBase58()] = symbol;
                     }
                });
                await Promise.all(ataPromises);

                const signatures = await connection.getSignaturesForAddress(impactPublicKey, { limit: 100 });
                if (signatures.length > 0) {
                    const fetchedTxs = await connection.getParsedTransactions(signatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
                    const parsedTxs = fetchedTxs.flatMap((tx, i) => tx ? processTransaction(tx, signatures[i].signature) : []);
                    if (isMounted) {
                        setAllDonations(parsedTxs.sort((a, b) => b.time.getTime() - a.time.getTime()));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial donations:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
            
            if (!isMounted) return;

            ws = new WebSocket(QUICKNODE_WSS_URL);
            ws.onopen = () => {
                ws?.send(JSON.stringify({
                    jsonrpc: "2.0", id: 1, method: "logsSubscribe",
                    params: [{ mentions: [impactPublicKeyString] }, { commitment: "finalized" }]
                }));
            };
            ws.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.method === "logsNotification") {
                        const signature = data.params.result.value.signature;
                        if (allDonations.some(tx => tx.id === signature)) return;
                        const connection = new Connection(QUICKNODE_RPC_URL, 'finalized');
                        const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
                        if (tx) {
                            const newTxs = processTransaction(tx, signature);
                            if (isMounted && newTxs.length > 0) {
                                setAllDonations(prev => [...newTxs, ...prev]);
                            }
                        }
                    }
                } catch (e) { console.error("Error processing donation WS message:", e); }
            };
            ws.onclose = () => { if (isMounted) setTimeout(fetchInitialDataAndConnect, 5000); };
            ws.onerror = (error) => { ws?.close(); };
        };

        fetchInitialDataAndConnect();

        return () => {
            isMounted = false;
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, []);

    const currentUserToken = useMemo(() => solana.userTokens.find(t => t.symbol === selectedToken), [solana.userTokens, selectedToken]);
    const tokenPrice = useMemo(() => currentUserToken?.pricePerToken ?? 0, [currentUserToken]);
    const usdValue = useMemo(() => parseFloat(amount) * tokenPrice || 0, [amount, tokenPrice]);

    const handlePercentageClick = (percentage: number) => {
        if (currentUserToken && currentUserToken.balance > 0) {
            const newAmount = (currentUserToken.balance * percentage) / 100;
            setAmount(parseFloat(newAmount.toFixed(8)).toString());
        }
    };

    const handleDonate = async () => {
        if (!solana.connected) {
            setWalletModalOpen(true);
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            addNotification({ type: 'error', title: t('transaction_failed_title'), message: t('invalid_amount_generic') });
            return;
        }
        const result = await solana.sendTransaction(DISTRIBUTION_WALLETS.impactTreasury, numAmount, selectedToken, 'donation');
        if (result.success && result.signature) {
            startTrackingTransaction({
                signature: result.signature,
                status: 'sending',
                amount: numAmount,
                tokenSymbol: selectedToken,
                type: 'donation'
            });
            addNotification({
                type: 'success',
                title: t('donation_success_title'),
                message: t('donation_success_alert', result.params),
                txSignature: result.signature,
                tokenSymbol: selectedToken,
                amount: numAmount,
            });
            setAmount('');
            markJourneyAction('madeDonation');
        } else {
            addNotification({
                type: 'error',
                title: result.isCancellation ? t('transaction_cancelled_title') : t('transaction_failed_title'),
                message: t(result.messageKey, result.params)
            });
        }
    };
    
    const buttonText = useMemo(() => {
        if (solana.loading) return t('processing');
        if (!solana.connected) return t('connect_wallet');
        return t('donate');
    }, [solana.connected, solana.loading, t]);

    const percentages = [5, 10, 15, 25, 50, 75, 100];

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('make_donation')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('donation_desc')}
                </p>
            </div>
            
            <div className="bg-white dark:bg-darkPrimary-800 p-8 md:p-12 rounded-2xl shadow-3d-lg">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-3xl font-bold text-primary-800 dark:text-darkPrimary-200">{t('donation_message_title')}</h2>
                    <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{t('donation_message_p1')}</p>
                    <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                        {t('donation_message_p2_part1')}
                        <span className="font-bold text-accent-600 dark:text-darkAccent-400">
                            {t('donation_message_p2_project_name')}
                        </span>
                        {t('donation_message_p2_part2')}
                    </p>
                    <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{t('donation_message_p3')}</p>
                    <p className="font-bold text-primary-800 dark:text-darkPrimary-200 pt-2">{t('donation_message_thanks')}</p>
                </div>
            </div>

            <div className="bg-accent-100/30 dark:bg-darkAccent-900/30 border-l-4 border-accent-500 dark:border-darkAccent-500 text-accent-800 dark:text-darkAccent-200 p-4 rounded-md shadow-md flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-accent-500 dark:text-darkAccent-500 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{t('donation_solana_warning')}</p>
            </div>
            
            <DonationStats allTransactions={allDonations} isLoading={isLoading} />
            
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d lg:sticky top-24">
                    <h2 className="text-2xl font-bold mb-6 text-center">{t('donations_form_title')}</h2>
                    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-3 rounded-lg text-sm text-primary-700 dark:text-darkPrimary-300 mb-6 flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5 text-primary-500 dark:text-darkPrimary-400" />
                        <span>{t('donation_fee_info')}</span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-2">{t('select_token')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {tokens.map(token => (
                                    <button
                                        key={token.symbol}
                                        onClick={() => setSelectedToken(token.symbol)}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-accent-500 bg-accent-100/50 dark:bg-darkAccent-900/50' : 'border-primary-200 dark:border-darkPrimary-600'}`}
                                    >
                                        <div className="w-8 h-8 mb-2">{token.icon}</div>
                                        <span className="font-semibold">{token.symbol}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-1">{t('amount')}</label>
                            <input
                                type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0"
                                className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {percentages.map(p => (
                                    <button
                                        key={p} onClick={() => handlePercentageClick(p)}
                                        disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                        className="flex-grow text-xs bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {p === 100 ? t('max_button') : `${p}%`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {solana.connected && (
                            <div className="py-2 animate-fade-in-up">
                                {currentUserToken ? (
                                    <p className="text-center font-bold text-primary-800 dark:text-darkPrimary-200">
                                        {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                    </p>
                                ) : (
                                    <div className="text-center py-3 px-4 bg-accent-100/20 dark:bg-darkAccent-900/20 border border-accent-400/30 dark:border-darkAccent-500/30 rounded-lg">
                                        <div className="flex items-center justify-center space-x-2 text-accent-700 dark:text-darkAccent-200">
                                            {React.cloneElement(tokens.find(t => t.symbol === selectedToken)!.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                                            <p className="font-semibold">{t('donation_no_token_balance', { symbol: selectedToken })}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {parseFloat(amount) > 0 && (
                            <div className="p-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-center animate-fade-in-up">
                                <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">
                                    {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                                </p>
                                <p className="text-md text-primary-700 dark:text-darkPrimary-300 font-semibold">
                                    ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </div>
                        )}
                        <button onClick={handleDonate} disabled={solana.loading || (solana.connected && !(parseFloat(amount) > 0))} className="w-full bg-gradient-to-r from-accent-400 to-accent-500 dark:from-darkAccent-500 dark:to-darkAccent-600 text-accent-950 dark:text-darkPrimary-950 font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                            {buttonText}
                        </button>
                    </div>
                </div>
                <div>
                    <LiveDonationFeed allTransactions={allDonations} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}