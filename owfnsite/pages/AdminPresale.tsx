import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, ConfirmedSignatureInfo } from '@solana/web3.js';

import { 
    DISTRIBUTION_WALLETS, 
    PRESALE_STAGES,
    OWFN_MINT_ADDRESS,
    TOKEN_DETAILS,
} from '../lib/constants.js';
import { Loader2, RefreshCw, Download, Send, AlertTriangle, User, PieChart, RotateCcw, ListTree, List } from 'lucide-react';
import { SolIcon } from '../components/IconComponents.js';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { PresaleStage } from '../lib/types.js';

interface PresaleTx {
    signature: string;
    from: string;
    solAmount: number;
    owfnAmount: number;
    timestamp: number;
    lamports: number;
}

interface AggregatedContributor {
    address: string;
    totalSol: number;
    totalOwfn: bigint; // Use BigInt for precision
}

const currentStage: PresaleStage = PRESALE_STAGES.find(s => s.status === 'active') || PRESALE_STAGES[0];

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 rounded-full p-3">
            {icon}
        </div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
        </div>
    </div>
);

export default function AdminPresale() {
    const { t, solana } = useAppContext();
    const { connection } = useConnection();

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<PresaleTx[]>([]);
    const [stats, setStats] = useState({ sol: 0, count: 0, contributors: 0 });
    const [view, setView] = useState<'contributors' | 'transactions'>('contributors');
    
    const [isAirdropping, setIsAirdropping] = useState(false);
    
    const adminOwfnBalance = useMemo(() => solana.userTokens.find(t => t.mintAddress === OWFN_MINT_ADDRESS)?.balance ?? 0, [solana.userTokens]);

    const fetchAllTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const presalePublicKey = new PublicKey(DISTRIBUTION_WALLETS.presale);
            const presaleStartTimestamp = Math.floor(new Date(currentStage.startDate).getTime() / 1000);
            
            let allSignatures: ConfirmedSignatureInfo[] = [];
            let lastSignature: string | undefined = undefined;

            while (true) {
                const signatures = await connection.getSignaturesForAddress(presalePublicKey, { before: lastSignature, limit: 1000 });
                if (signatures.length === 0) break;
                
                allSignatures.push(...signatures);
                lastSignature = signatures[signatures.length - 1].signature;

                const lastTxTime = signatures[signatures.length - 1].blockTime;
                if (lastTxTime && lastTxTime < presaleStartTimestamp) break;
            }

            const relevantSignatures = allSignatures.filter(sig => sig.blockTime && sig.blockTime >= presaleStartTimestamp);
            const signatureStrings = relevantSignatures.map(s => s.signature);
            
            if (signatureStrings.length === 0) {
                setTransactions([]);
                setLoading(false);
                return;
            }

            const allParsedTxs: PresaleTx[] = [];
            const BATCH_SIZE = 100;
            for (let i = 0; i < signatureStrings.length; i += BATCH_SIZE) {
                const batchSignatures = signatureStrings.slice(i, i + BATCH_SIZE);
                const transactionsData = await connection.getParsedTransactions(batchSignatures, { maxSupportedTransactionVersion: 0 });

                transactionsData.forEach((tx, index) => {
                    if (tx && tx.blockTime) {
                        tx.transaction.message.instructions.forEach(inst => {
                            if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === DISTRIBUTION_WALLETS.presale && inst.parsed.info.source !== '11111111111111111111111111111111') {
                                const lamports = inst.parsed.info.lamports;
                                allParsedTxs.push({
                                    signature: batchSignatures[index],
                                    from: inst.parsed.info.source,
                                    solAmount: lamports / LAMPORTS_PER_SOL,
                                    owfnAmount: (lamports / LAMPORTS_PER_SOL) * currentStage.rate,
                                    timestamp: tx.blockTime!,
                                    lamports: lamports,
                                });
                            }
                        });
                    }
                });
            }
            
            const sortedTxs = allParsedTxs.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(sortedTxs);
        } catch (error) {
            console.error("Failed to fetch presale transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [connection]);

    useEffect(() => {
        fetchAllTransactions();
    }, [fetchAllTransactions]);

    const aggregatedContributors = useMemo((): AggregatedContributor[] => {
        const contributorMap = new Map<string, { totalSol: number }>();
        for (const tx of transactions) {
            const existing = contributorMap.get(tx.from) || { totalSol: 0 };
            existing.totalSol += tx.solAmount;
            contributorMap.set(tx.from, existing);
        }

        const owfnDecimals = BigInt(TOKEN_DETAILS.decimals);
        const owfnMultiplier = 10n ** owfnDecimals;
        const LAMPORTS_PER_SOL_BIGINT = BigInt(LAMPORTS_PER_SOL);

        const result: AggregatedContributor[] = [];
        for (const [address, data] of contributorMap.entries()) {
            const totalSol = data.totalSol;

            const applicableTier = [...currentStage.bonusTiers]
                .sort((a, b) => b.threshold - a.threshold)
                .find(tier => totalSol >= tier.threshold);

            const bonusPercentage = applicableTier ? BigInt(applicableTier.percentage) : 0n;

            // Use BigInt for precision
            const solParts = totalSol.toString().split('.');
            const integerPart = BigInt(solParts[0] || '0');
            const fractionalPart = (solParts[1] || '').slice(0, 9).padEnd(9, '0');
            const totalLamportsBigInt = integerPart * LAMPORTS_PER_SOL_BIGINT + BigInt(fractionalPart);

            const baseOwfnSmallestUnit = (totalLamportsBigInt * BigInt(currentStage.rate) * owfnMultiplier) / LAMPORTS_PER_SOL_BIGINT;
            const bonusOwfnSmallestUnit = (baseOwfnSmallestUnit * bonusPercentage) / 100n;
            const totalOwfn = baseOwfnSmallestUnit + bonusOwfnSmallestUnit;

            result.push({
                address,
                totalSol,
                totalOwfn
            });
        }

        return result.sort((a, b) => b.totalSol - a.totalSol);
    }, [transactions]);


    useEffect(() => {
        if (transactions.length > 0) {
            const totalSol = transactions.reduce((acc, tx) => acc + tx.solAmount, 0);
            const uniqueContributors = new Set(transactions.map(tx => tx.from)).size;
            setStats({
                sol: totalSol,
                count: transactions.length,
                contributors: uniqueContributors
            });
        }
    }, [transactions]);

    const totalOwfnToDistribute = useMemo(() => {
        return aggregatedContributors.reduce((acc, contributor) => acc + contributor.totalOwfn, 0n);
    }, [aggregatedContributors]);
    
    const exportCSV = useCallback(() => {
        const headers = ["Contributor Address", "Total SOL Invested", "Total OWFN To Receive (with bonus)"];
        const owfnDecimals = BigInt(TOKEN_DETAILS.decimals);
        const rows = aggregatedContributors.map(c => [
            c.address,
            c.totalSol.toFixed(9),
            (Number(c.totalOwfn) / Number(10n**owfnDecimals)).toFixed(TOKEN_DETAILS.decimals)
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "presale_airdrop_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [aggregatedContributors]);

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">{t('presale_admin_title')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mt-2">{t('presale_admin_subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('total_sol_raised')} value={stats.sol.toFixed(4)} icon={<SolIcon className="w-6 h-6" />} />
                <StatCard title={t('total_transactions')} value={stats.count} icon={<List />} />
                <StatCard title={t('unique_contributors')} value={stats.contributors} icon={<User />} />
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-bold">{view === 'contributors' ? 'Aggregated Contributors' : t('presale_purchases')}</h2>
                         <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => setView('contributors')} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${view === 'contributors' ? 'bg-accent-100 dark:bg-darkAccent-700 text-accent-700 dark:text-darkAccent-200 font-semibold' : 'bg-transparent text-primary-500 hover:bg-primary-100 dark:hover:bg-darkPrimary-700'}`}>
                                <ListTree size={16} /> Aggregated
                            </button>
                             <button onClick={() => setView('transactions')} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${view === 'transactions' ? 'bg-accent-100 dark:bg-darkAccent-700 text-accent-700 dark:text-darkAccent-200 font-semibold' : 'bg-transparent text-primary-500 hover:bg-primary-100 dark:hover:bg-darkPrimary-700'}`}>
                                <RotateCcw size={16} /> Transactions
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={fetchAllTransactions} disabled={loading} className="p-2 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600 rounded-md disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                        </button>
                        <button onClick={exportCSV} className="p-2 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600 rounded-md flex items-center space-x-2">
                            <Download size={20} /> <span className="text-sm font-semibold">{t('export_csv')}</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        {view === 'contributors' ? (
                            <>
                                <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-50 dark:bg-darkPrimary-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('contributor')}</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total SOL Invested</th>
                                        <th scope="col" className="px-6 py-3 text-right">{t('owfn_to_receive')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregatedContributors.map(c => (
                                        <tr key={c.address} className="bg-white dark:bg-darkPrimary-800 border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-600/50">
                                            <td className="px-6 py-4"><AddressDisplay address={c.address} /></td>
                                            <td className="px-6 py-4 text-right font-mono">{c.totalSol.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 9 })}</td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-accent-600 dark:text-darkAccent-400">
                                                {(Number(c.totalOwfn) / (10 ** TOKEN_DETAILS.decimals)).toLocaleString(undefined, { maximumFractionDigits: TOKEN_DETAILS.decimals })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-50 dark:bg-darkPrimary-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('contributor')}</th>
                                        <th scope="col" className="px-6 py-3 text-right">{t('sol_amount')}</th>
                                        <th scope="col" className="px-6 py-3">{t('date')}</th>
                                        <th scope="col" className="px-6 py-3">{t('transaction')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.signature} className="bg-white dark:bg-darkPrimary-800 border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-600/50">
                                            <td className="px-6 py-4"><AddressDisplay address={tx.from} /></td>
                                            <td className="px-6 py-4 text-right font-mono">{tx.solAmount.toFixed(4)}</td>
                                            <td className="px-6 py-4">{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                                            <td className="px-6 py-4"><AddressDisplay address={tx.signature} type="tx" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Send className="mr-3 text-accent-500 dark:text-darkAccent-400"/>{t('airdrop_tool_title')}</h2>
                 <div className="space-y-4">
                    <div className="bg-red-500/10 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold">{t('airdrop_warning')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_owfn_to_distribute')}</p>
                            <p className="text-lg font-bold font-mono">{(Number(totalOwfnToDistribute) / (10 ** TOKEN_DETAILS.decimals)).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('your_owfn_balance')}</p>
                            <p className={`text-lg font-bold font-mono ${adminOwfnBalance < (Number(totalOwfnToDistribute) / (10 ** TOKEN_DETAILS.decimals)) ? 'text-red-500' : 'text-green-500'}`}>{adminOwfnBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        </div>
                    </div>

                    <button className="w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50">
                        {t('start_airdrop')}
                    </button>
                 </div>
            </div>
        </div>
    );
}
