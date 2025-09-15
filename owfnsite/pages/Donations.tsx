// FIX: Import `useRef` from React.
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAppContext } from '../contexts/AppContext.js';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL } from '../lib/constants.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.js';
import { AlertTriangle, Info, BarChart2, CalendarDays, TrendingUp, History } from 'lucide-react';
import { LiveDonationFeed } from '../components/LiveDonationFeed.js';
import type { DonationTransaction } from '../lib/types.js';

const tokens = [
    { symbol: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', icon: <SolIcon /> },
    { symbol: 'USDC', icon: <UsdcIcon /> },
    { symbol: 'USDT', icon: <UsdtIcon /> },
];

const DonationStatsCard = ({ tokenSymbol, transactions, title }: { tokenSymbol: string, transactions: DonationTransaction[], title: string }) => {
    const { t } = useAppContext();

    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeekAgo = new Date(today.getTime() - 6 * oneDay);
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        let totalToday = 0, totalLastWeek = 0, totalLastMonth = 0, totalAllTime = 0;
        for (const tx of transactions) {
            const txDate = tx.time;
            totalAllTime += tx.amount;
            if (txDate >= today) totalToday += tx.amount;
            if (txDate >= oneWeekAgo) totalLastWeek += tx.amount;
            if (txDate >= oneMonthAgo) totalLastMonth += tx.amount;
        }
        return { totalToday, totalLastWeek, totalLastMonth, totalAllTime };
    }, [transactions]);

    const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
        <div className="flex justify-between items-center py-2 border-b border-dextools-border/50 last:border-b-0">
            <div className="flex items-center gap-2 text-dextools-text-secondary">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-mono font-semibold text-dextools-text-primary">
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
        </div>
    );

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
        <div className="bg-dextools-card border border-dextools-border p-6 rounded-md transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
                {getTokenIcon(tokenSymbol)}
                <h3 className="text-lg font-bold text-dextools-text-primary">{title}</h3>
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

const DonationStats = ({ allTransactions }: { allTransactions: DonationTransaction[] }) => {
    const { t } = useAppContext();
    const categorizedTransactions = useMemo(() => {
        const categories: Record<string, DonationTransaction[]> = { SOL: [], USDC: [], USDT: [], OWFN: [] };
        for (const tx of allTransactions) {
            if (categories[tx.tokenSymbol]) categories[tx.tokenSymbol].push(tx);
        }
        return categories;
    }, [allTransactions]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-dextools-text-primary">{t('donations_stats_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DonationStatsCard tokenSymbol="SOL" transactions={categorizedTransactions.SOL} title={t('donations_sol_stats_title')} />
                <DonationStatsCard tokenSymbol="USDC" transactions={categorizedTransactions.USDC} title={t('donations_usdc_stats_title')} />
                <DonationStatsCard tokenSymbol="USDT" transactions={categorizedTransactions.USDT} title={t('donations_usdt_stats_title')} />
                <DonationStatsCard tokenSymbol="OWFN" transactions={categorizedTransactions.OWFN} title={t('donations_owfn_stats_title')} />
            </div>
        </div>
    );
};

export default function Donations() {
    const { t, solana, setWalletModalOpen } = useAppContext();
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
        
            tx.transaction.message.instructions.forEach((inst: any) => {
                if (inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === impactPublicKeyString) {
                    results.push({ id: signature, address: inst.parsed.info.source, amount: inst.parsed.info.lamports / LAMPORTS_PER_SOL, tokenSymbol: 'SOL', time: new Date(tx.blockTime! * 1000) });
                }
                if (inst.program === 'spl-token' && (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked') && knownAtasRef.current[inst.parsed.info.destination]) {
                    const tokenSymbol = knownAtasRef.current[inst.parsed.info.destination];
                    results.push({ id: signature, address: inst.parsed.info.source, amount: inst.parsed.info.tokenAmount.uiAmount, tokenSymbol, time: new Date(tx.blockTime! * 1000) });
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
                     if(ata.value[0]) knownAtasRef.current[ata.value[0].pubkey.toBase58()] = symbol;
                });
                await Promise.all(ataPromises);

                const signatures = await connection.getSignaturesForAddress(impactPublicKey, { limit: 100 });
                if (signatures.length > 0) {
                    const fetchedTxs = await connection.getParsedTransactions(signatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
                    const parsedTxs = fetchedTxs.flatMap((tx, i) => tx ? processTransaction(tx, signatures[i].signature) : []);
                    if (isMounted) setAllDonations(parsedTxs.sort((a, b) => b.time.getTime() - a.time.getTime()));
                }
            } catch (error) { console.error("Failed to fetch initial donations:", error);
            } finally { if (isMounted) setIsLoading(false); }
            
            if (!isMounted) return;
        };
        fetchInitialDataAndConnect();
        return () => { isMounted = false; };
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
        if (!solana.connected) { setWalletModalOpen(true); return; }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) { alert(t('invalid_amount_generic')); return; }
        const result = await solana.sendTransaction(DISTRIBUTION_WALLETS.impactTreasury, numAmount, selectedToken);
        if (result.success) {
            alert(t('donation_success_alert', result.params));
            setAmount('');
        } else {
            alert(t(result.messageKey, result.params));
        }
    };
    
    const buttonText = useMemo(() => {
        if (solana.loading) return t('processing');
        if (!solana.connected) return t('connect_wallet');
        return t('donate');
    }, [solana.connected, solana.loading, t]);

    const percentages = [5, 10, 15, 25, 50, 75, 100];

    return (
        <div className="animate-fade-in space-y-12">
            <div className="text-center"><h1 className="text-4xl font-bold text-dextools-accent-blue">{t('make_donation')}</h1><p className="mt-4 max-w-2xl mx-auto text-lg text-dextools-text-secondary">{t('donation_desc')}</p></div>
            <div className="bg-dextools-card border border-dextools-border p-8 md:p-12 rounded-md"><div className="max-w-4xl mx-auto text-center space-y-4"><h2 className="text-3xl font-bold text-dextools-text-primary">{t('donation_message_title')}</h2><p className="text-dextools-text-secondary leading-relaxed">{t('donation_message_p1')}</p><p className="text-dextools-text-secondary leading-relaxed">{t('donation_message_p2_part1')}<span className="font-bold text-dextools-accent-blue">{t('donation_message_p2_project_name')}</span>{t('donation_message_p2_part2')}</p><p className="text-dextools-text-secondary leading-relaxed">{t('donation_message_p3')}</p><p className="font-bold text-dextools-text-primary pt-2">{t('donation_message_thanks')}</p></div></div>
            <div className="bg-dextools-accent-red/10 border-l-4 border-dextools-accent-red text-dextools-accent-red/90 p-4 rounded-md flex items-start space-x-3"><AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" /><p className="font-semibold">{t('donation_solana_warning')}</p></div>
            <DonationStats allTransactions={allDonations} />
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-dextools-card border border-dextools-border p-8 rounded-md lg:sticky top-24">
                    <h2 className="text-2xl font-bold mb-6 text-center text-dextools-text-primary">{t('donations_form_title')}</h2>
                    <div className="bg-dextools-background p-3 rounded-md text-sm text-dextools-text-secondary mb-6 flex items-start gap-2"><Info size={18} className="flex-shrink-0 mt-0.5" /><span>{t('donation_fee_info')}</span></div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-dextools-text-secondary mb-2">{t('select_token')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {tokens.map(token => (<button key={token.symbol} onClick={() => setSelectedToken(token.symbol)} className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-dextools-accent-blue bg-dextools-special/10' : 'border-dextools-border'}`}><div className="w-8 h-8 mb-2">{token.icon}</div><span className="font-semibold">{token.symbol}</span></button>))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-dextools-text-secondary mb-1">{t('amount')}</label>
                            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full p-3 bg-dextools-background border border-dextools-border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-dextools-accent-blue focus:outline-none" />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {percentages.map(p => (<button key={p} onClick={() => handlePercentageClick(p)} disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0} className="flex-grow text-xs bg-dextools-border hover:bg-dextools-special/20 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{p === 100 ? t('max_button') : `${p}%`}</button>))}
                            </div>
                        </div>
                        {solana.connected && (<div className="py-2 animate-fade-in">{currentUserToken ? (<p className="text-center font-bold text-dextools-text-primary">{t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}</p>) : (<div className="text-center py-3 px-4 bg-dextools-accent-red/10 border border-dextools-accent-red/30 rounded-lg"><div className="flex items-center justify-center space-x-2 text-dextools-accent-red/90">{React.cloneElement(tokens.find(t => t.symbol === selectedToken)!.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}<p className="font-semibold">{t('donation_no_token_balance', { symbol: selectedToken })}</p></div></div>)}</div>)}
                        {parseFloat(amount) > 0 && (<div className="p-4 bg-dextools-background rounded-lg text-center animate-fade-in"><p className="text-2xl font-bold text-dextools-text-primary">{parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}</p><p className="text-md text-dextools-text-secondary font-semibold">~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>)}
                        <button onClick={handleDonate} disabled={solana.loading || (solana.connected && !(parseFloat(amount) > 0))} className="w-full bg-dextools-special text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">{buttonText}</button>
                    </div>
                </div>
                <div><LiveDonationFeed allTransactions={allDonations} isLoading={isLoading} /></div>
            </div>
        </div>
    );
}