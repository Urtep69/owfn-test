
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL, ConfirmedSignatureInfo } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, getAccount, ACCOUNT_SIZE } from '@solana/spl-token';

import { 
    DISTRIBUTION_WALLETS, 
    PRESALE_DETAILS,
    OWFN_MINT_ADDRESS,
    TOKEN_DETAILS,
} from '../constants.ts';
import { Loader2, RefreshCw, Download, Send, AlertTriangle, FileText, CheckCircle, XCircle, User, PieChart, RotateCcw } from 'lucide-react';
import { SolIcon } from '../components/IconComponents.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { Token } from '../types.ts';

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
    const wallet = useWallet();

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<PresaleTx[]>([]);
    const [stats, setStats] = useState({ sol: 0, count: 0, contributors: 0 });

    const [isAirdropping, setIsAirdropping] = useState(false);
    const [airdropProgress, setAirdropProgress] = useState({ current: 0, total: 0 });
    const [airdropLogs, setAirdropLogs] = useState<string[]>([]);
    const [processedAddresses, setProcessedAddresses] = useState<Set<string>>(new Set());
    
    const adminOwfnBalance = useMemo(() => solana.userTokens.find(t => t.mintAddress === OWFN_MINT_ADDRESS)?.balance ?? 0, [solana.userTokens]);
    const adminSolBalance = useMemo(() => solana.userTokens.find(t => t.symbol === 'SOL')?.balance ?? 0, [solana.userTokens]);
    
    const [rentExemption, setRentExemption] = useState(0);

    useEffect(() => {
        if (connection) {
            connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE)
                .then(rent => {
                    setRentExemption(rent / LAMPORTS_PER_SOL);
                })
                .catch(err => console.error("Failed to get rent exemption:", err));
        }
    }, [connection]);

    const fetchAllTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const presalePublicKey = new PublicKey(DISTRIBUTION_WALLETS.presale);
            const presaleStartTimestamp = Math.floor(PRESALE_DETAILS.startDate.getTime() / 1000);
            
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
                                allParsedTxs.push({
                                    signature: batchSignatures[index],
                                    from: inst.parsed.info.source,
                                    solAmount: inst.parsed.info.lamports / LAMPORTS_PER_SOL,
                                    owfnAmount: (inst.parsed.info.lamports / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                                    timestamp: tx.blockTime,
                                    lamports: inst.parsed.info.lamports,
                                });
                            }
                        });
                    }
                });
            }
            setTransactions(allParsedTxs);
        } catch (error) {
            console.error("Failed to fetch all presale transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [connection]);

    useEffect(() => {
        fetchAllTransactions();
    }, [fetchAllTransactions]);

    useEffect(() => {
        if (transactions.length > 0) {
            const totalSol = transactions.reduce((sum, tx) => sum + tx.solAmount, 0);
            const uniqueContributors = new Set(transactions.map(tx => tx.from)).size;
            setStats({ sol: totalSol, count: transactions.length, contributors: uniqueContributors });
        }
    }, [transactions]);

    const aggregatedContributors = useMemo<AggregatedContributor[]>(() => {
        // A map to store the final aggregated data for each contributor.
        const contributorMap = new Map<string, { totalLamports: bigint; totalOwfn: bigint }>();

        const presaleRateBigInt = BigInt(PRESALE_DETAILS.rate);
        const bonusThresholdLamports = BigInt(Math.round(PRESALE_DETAILS.bonusThreshold * LAMPORTS_PER_SOL));
        const owfnDecimalsMultiplier = 10n ** BigInt(TOKEN_DETAILS.decimals);

        // Process each transaction individually to calculate the correct OWFN amount with bonus.
        transactions.forEach(tx => {
            const lamports = BigInt(tx.lamports);
            
            // Calculate base OWFN for this single transaction
            let owfnForThisTx = (lamports * presaleRateBigInt * owfnDecimalsMultiplier) / BigInt(LAMPORTS_PER_SOL);

            // Check if this single transaction qualifies for a bonus
            if (lamports >= bonusThresholdLamports) {
                const bonusAmount = (owfnForThisTx * BigInt(PRESALE_DETAILS.bonusPercentage)) / 100n;
                owfnForThisTx += bonusAmount;
            }

            // Aggregate the results for the contributor.
            const existing = contributorMap.get(tx.from) ?? { totalLamports: 0n, totalOwfn: 0n };
            existing.totalLamports += lamports;
            existing.totalOwfn += owfnForThisTx;
            contributorMap.set(tx.from, existing);
        });

        // Convert the map to the final array structure.
        return Array.from(contributorMap.entries()).map(([address, data]) => {
            const totalSol = Number(data.totalLamports) / LAMPORTS_PER_SOL;
            return { address, totalSol, totalOwfn: data.totalOwfn };
        });
    }, [transactions]);


    const exportToCsv = useCallback(() => {
        const headers = ['contributor_address', 'total_sol_spent', 'total_owfn_to_receive'];
        const rows = aggregatedContributors.map(c => {
             const owfnAmount = Number(c.totalOwfn) / (10 ** TOKEN_DETAILS.decimals);
             return [c.address, c.totalSol.toFixed(9), owfnAmount.toFixed(TOKEN_DETAILS.decimals)];
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `owfn_presale_contributors_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [aggregatedContributors]);

    const handleAirdrop = useCallback(async () => {
        if (!wallet.publicKey || !wallet.signAllTransactions) return;

        const contributorsToProcess = aggregatedContributors.filter(c => !processedAddresses.has(c.address));

        if (contributorsToProcess.length === 0 && aggregatedContributors.length > 0) {
            alert("All contributors have been processed.");
            return;
        }

        const confirmation = window.confirm(t('airdrop_confirmation_prompt', { count: contributorsToProcess.length }));
        if (!confirmation) return;

        setIsAirdropping(true);
        if (processedAddresses.size === 0) {
            setAirdropLogs([]);
        }
        setAirdropLogs(prev => [...prev, `--- Starting airdrop run for ${contributorsToProcess.length} wallets. ---`]);
        setAirdropProgress({ current: processedAddresses.size, total: aggregatedContributors.length });

        const BATCH_SIZE = 10;
        const sourceOwner = wallet.publicKey;
        const tokenMint = new PublicKey(OWFN_MINT_ADDRESS);
        const sourceAta = await getAssociatedTokenAddress(tokenMint, sourceOwner);
        
        let successfulInThisRun = 0;

        for (let i = 0; i < contributorsToProcess.length; i += BATCH_SIZE) {
            const batch = contributorsToProcess.slice(i, i + BATCH_SIZE);
            setAirdropLogs(prev => [...prev, t('processing_batch', { current: Math.floor(i / BATCH_SIZE) + 1, total: Math.ceil(contributorsToProcess.length / BATCH_SIZE) })]);
            
            try {
                const transactions: Transaction[] = [];
                const latestBlockhash = await connection.getLatestBlockhash();

                for (const contributor of batch) {
                    const transaction = new Transaction();
                    const instructions = [];
                    const recipient = new PublicKey(contributor.address);
                    const destinationAta = await getAssociatedTokenAddress(tokenMint, recipient);

                    try {
                        await getAccount(connection, destinationAta);
                    } catch (error) {
                        instructions.push(createAssociatedTokenAccountInstruction(sourceOwner, destinationAta, recipient, tokenMint));
                    }
                    
                    instructions.push(
                        createTransferInstruction(
                            sourceAta,
                            destinationAta,
                            sourceOwner,
                            contributor.totalOwfn
                        )
                    );
                    transaction.add(...instructions);
                    transaction.recentBlockhash = latestBlockhash.blockhash;
                    transaction.feePayer = sourceOwner;
                    transactions.push(transaction);
                }

                const signedTxs = await wallet.signAllTransactions(transactions);
                
                for (let j = 0; j < signedTxs.length; j++) {
                    const tx = signedTxs[j];
                    const contributor = batch[j];
                    try {
                        const signature = await connection.sendRawTransaction(tx.serialize());
                        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');
                        setProcessedAddresses(prev => new Set(prev).add(contributor.address));
                        setAirdropLogs(prev => [...prev, `✅ Success for ${contributor.address.slice(0,6)}... | Sig: ${signature.slice(0,10)}...`]);
                        successfulInThisRun++;
                    } catch (err) {
                        console.error(`Airdrop failed for ${contributor.address}:`, err);
                        setAirdropLogs(prev => [...prev, `❌ Failed for ${contributor.address.slice(0,6)}... | Error: ${(err as Error).message}`]);
                    } finally {
                        setAirdropProgress(prev => ({ ...prev, current: prev.current + 1 }));
                    }
                }
            } catch (batchError) {
                 console.error(`Error processing batch starting at index ${i}:`, batchError);
                 const failedAddresses = batch.map(b => b.address.slice(0,6)).join(', ');
                 setAirdropLogs(prev => [...prev, `❌ Critical error in batch (signing failed?): ${(batchError as Error).message}. Failed addresses: ${failedAddresses}`]);
                 setAirdropProgress(prev => ({ ...prev, current: prev.current + batch.length }));
            }
        }
        
        setIsAirdropping(false);
        const totalFailed = contributorsToProcess.length - successfulInThisRun;
        setAirdropLogs(prev => [...prev, `--- Airdrop run complete. Success: ${successfulInThisRun}, Failed: ${totalFailed}. Total processed: ${processedAddresses.size + successfulInThisRun}/${aggregatedContributors.length} ---`]);

    }, [wallet, connection, aggregatedContributors, t, processedAddresses]);

    const handleClearProgress = () => {
        if (isAirdropping) {
            alert("Cannot clear progress while an airdrop is in progress.");
            return;
        }
        if (window.confirm("Are you sure you want to clear the airdrop progress and logs? This cannot be undone and is only for emergency resets.")) {
            setProcessedAddresses(new Set());
            setAirdropLogs([]);
            setAirdropProgress({ current: 0, total: 0 });
        }
    };
    
    const totalOwfnToDistribute = useMemo(() => {
        const total = aggregatedContributors.reduce((sum, c) => sum + c.totalOwfn, 0n);
        return Number(total) / (10 ** TOKEN_DETAILS.decimals);
    }, [aggregatedContributors]);

    const estimatedFees = useMemo(() => {
        if (rentExemption === 0) return { total: 0, signatures: 0, rent: 0 };
        const signatureFee = 0.000005; // 5000 lamports
        const contributorsToProcess = aggregatedContributors.filter(c => !processedAddresses.has(c.address));

        const totalSignatures = contributorsToProcess.length * signatureFee;
        // Worst-case: assume every remaining contributor needs a new ATA
        const totalRent = contributorsToProcess.length * rentExemption; 
        return {
            total: totalSignatures + totalRent,
            signatures: totalSignatures,
            rent: totalRent,
        };
    }, [aggregatedContributors, rentExemption, processedAddresses]);

    const isResuming = processedAddresses.size > 0 && processedAddresses.size < aggregatedContributors.length;
    const airdropButtonText = isAirdropping 
        ? t('airdrop_in_progress') 
        : (isResuming ? 'Resume Airdrop' : t('start_airdrop'));

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('presale_admin_title')}</h1>
                    <p className="text-primary-600 dark:text-darkPrimary-400 mt-1">{t('presale_admin_subtitle')}</p>
                </div>
                <button onClick={fetchAllTransactions} disabled={loading} className="flex items-center gap-2 bg-primary-200 dark:bg-darkPrimary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-300 dark:hover:bg-darkPrimary-600 disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    {t('refresh_data')}
                </button>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title={t('total_sol_raised')} value={stats.sol.toFixed(4)} icon={<SolIcon className="w-6 h-6"/>} />
                        <StatCard title={t('total_transactions')} value={stats.count} icon={<FileText />} />
                        <StatCard title={t('unique_contributors')} value={stats.contributors} icon={<User />} />
                        <StatCard title={t('total_owfn_to_distribute')} value={totalOwfnToDistribute.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={<PieChart />} />
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('presale_purchases')}</h2>
                            <button onClick={exportToCsv} className="flex items-center gap-2 bg-primary-200 dark:bg-darkPrimary-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-300 dark:hover:bg-darkPrimary-600">
                                <Download size={16} /> {t('export_csv')}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[50vh] relative">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-100 dark:bg-darkPrimary-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('contributor')}</th>
                                        <th scope="col" className="px-6 py-3 text-right">{t('sol_amount')}</th>
                                        <th scope="col" className="px-6 py-3 text-right">{t('owfn_to_receive')}</th>
                                        <th scope="col" className="px-6 py-3">{t('date')}</th>
                                        <th scope="col" className="px-6 py-3">{t('transaction')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.signature} className="border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-700/50">
                                            <td className="px-6 py-4"><AddressDisplay address={tx.from} /></td>
                                            <td className="px-6 py-4 text-right font-mono">{tx.solAmount.toFixed(4)}</td>
                                            <td className="px-6 py-4 text-right font-mono">{tx.owfnAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                            <td className="px-6 py-4">{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                                            <td className="px-6 py-4"><AddressDisplay address={tx.signature} type="tx"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{t('airdrop_tool_title')}</h2>
                            <button onClick={handleClearProgress} disabled={isAirdropping} className="flex items-center gap-2 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900 disabled:opacity-50">
                                <RotateCcw size={14} /> Clear Progress & Logs
                            </button>
                        </div>
                         <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg flex items-start gap-3">
                            <AlertTriangle className="w-8 h-8 flex-shrink-0"/>
                            <p className="text-sm font-semibold">{t('airdrop_warning')}</p>
                         </div>

                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-primary-100 dark:bg-darkPrimary-700 p-4 rounded-lg">
                                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_owfn_to_distribute')}</p>
                                <p className="text-lg font-bold font-mono">{totalOwfnToDistribute.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                            </div>
                             <div className={`bg-primary-100 dark:bg-darkPrimary-700 p-4 rounded-lg ${adminOwfnBalance < totalOwfnToDistribute ? 'border border-red-500' : ''}`}>
                                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('your_owfn_balance')}</p>
                                <p className="text-lg font-bold font-mono">{adminOwfnBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                                {adminOwfnBalance < totalOwfnToDistribute && <p className="text-xs text-red-500 mt-1">{t('insufficient_owfn_balance')}</p>}
                            </div>
                             <div className={`bg-primary-100 dark:bg-darkPrimary-700 p-4 rounded-lg ${adminSolBalance < estimatedFees.total ? 'border border-red-500' : ''}`}>
                                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('your_sol_balance')}</p>
                                <p className="text-lg font-bold font-mono">{adminSolBalance.toFixed(6)}</p>
                                <p className="text-xs text-primary-500 dark:text-darkPrimary-500 mt-1">
                                    {t('estimated_tx_fees')} (for remaining): ~{estimatedFees.total.toFixed(6)} SOL
                                </p>
                                {adminSolBalance < estimatedFees.total && <p className="text-xs text-red-500 mt-1">{t('insufficient_sol_balance')}</p>}
                            </div>
                         </div>
                        
                         <button 
                            onClick={handleAirdrop}
                            disabled={isAirdropping || loading || adminOwfnBalance < totalOwfnToDistribute || adminSolBalance < estimatedFees.total || aggregatedContributors.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-accent-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {isAirdropping ? <Loader2 className="w-6 h-6 animate-spin"/> : <Send className="w-6 h-6" />}
                            {airdropButtonText}
                         </button>
                        
                         {(isAirdropping || airdropProgress.total > 0) && (
                             <div>
                                 <div className="flex justify-between text-sm font-semibold mb-1">
                                    <span>Airdrop Progress</span>
                                    <span>{airdropProgress.current} / {airdropProgress.total}</span>
                                 </div>
                                 <div className="w-full bg-primary-200 dark:bg-darkPrimary-700 rounded-full h-4">
                                    <div className="bg-green-500 h-4 rounded-full transition-all duration-300" style={{width: `${(airdropProgress.current / (airdropProgress.total || 1)) * 100}%`}}></div>
                                 </div>
                             </div>
                         )}

                         {airdropLogs.length > 0 && (
                             <div className="bg-primary-50 dark:bg-darkPrimary-950 p-4 rounded-lg max-h-64 overflow-y-auto">
                                <h3 className="font-bold mb-2">{t('airdrop_log')}</h3>
                                <div className="space-y-1 text-xs font-mono">
                                    {airdropLogs.map((log, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            {log.startsWith('✅') ? <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0"/> : (log.startsWith('❌') ? <XCircle className="w-3 h-3 text-red-500 flex-shrink-0"/> : <div className="w-3 h-3 flex-shrink-0"></div>)}
                                            <p className="break-all">{log}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         )}
                    </div>
                </>
            )}
        </div>
    );
}
