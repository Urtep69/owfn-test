import React, { useState, useEffect, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useAppContext } from '../contexts/AppContext.js';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, QUICKNODE_WSS_URL } from '../lib/constants.js';
import type { DonationTransaction } from '../lib/types.js';
import { AddressDisplay } from './AddressDisplay.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from './IconComponents.js';
import { Loader2 } from 'lucide-react';

const MINT_TO_SYMBOL: { [mint: string]: string } = Object.fromEntries(
    Object.entries(KNOWN_TOKEN_MINT_ADDRESSES).map(([symbol, mint]) => [mint, symbol])
);

const getTokenIcon = (symbol: string) => {
    switch (symbol) {
        case 'OWFN': return <OwfnIcon className="w-5 h-5" />;
        case 'SOL': return <SolIcon className="w-5 h-5" />;
        case 'USDC': return <UsdcIcon className="w-5 h-5" />;
        case 'USDT': return <UsdtIcon className="w-5 h-5" />;
        default: return <GenericTokenIcon className="w-5 h-5" />;
    }
};

export const LiveDonationFeed = () => {
    const { t } = useAppContext();
    const [transactions, setTransactions] = useState<DonationTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    
    // Using a ref to store known ATAs to avoid re-calculating on every render
    const knownAtasRef = useRef<{ [ata: string]: string }>({});

    useEffect(() => {
        let isMounted = true;
        const impactPublicKey = new PublicKey(DISTRIBUTION_WALLETS.impactTreasury);
        const impactPublicKeyString = impactPublicKey.toBase58();

        const processTransaction = (tx: any, signature: string): DonationTransaction[] => {
            const results: DonationTransaction[] = [];
            if (!tx || !tx.blockTime) return results;
        
            const presumedSender = tx.transaction.message.accountKeys[0].pubkey.toBase58();
        
            tx.transaction.message.instructions.forEach((inst: any) => {
                // Handle native SOL transfers
                if (inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === impactPublicKeyString) {
                    results.push({
                        id: signature,
                        address: inst.parsed.info.source,
                        amount: inst.parsed.info.lamports / LAMPORTS_PER_SOL,
                        tokenSymbol: 'SOL',
                        time: new Date(tx.blockTime! * 1000),
                    });
                }
        
                // Handle SPL Token transfers
                if (inst.programId.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
                    if ((inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked') && knownAtasRef.current[inst.parsed.info.destination]) {
                        const destinationAta = inst.parsed.info.destination;
                        const tokenSymbol = knownAtasRef.current[destinationAta];
                        results.push({
                            id: signature,
                            address: presumedSender, // Heuristic: Fee payer is the sender
                            amount: inst.parsed.info.tokenAmount.uiAmount,
                            tokenSymbol,
                            time: new Date(tx.blockTime! * 1000),
                        });
                    }
                }
            });
            return results;
        };
        

        const fetchInitialData = async () => {
            if (!isMounted) return;
            setLoading(true);
            try {
                const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');

                // Pre-calculate known ATAs for the impact treasury wallet
                const ataPromises = Object.entries(KNOWN_TOKEN_MINT_ADDRESSES).map(async ([symbol, mint]) => {
                    if (symbol === 'SOL') return null; // Skip SOL
                    const mintPubkey = new PublicKey(mint);
                    const response = await connection.getTokenAccountsByOwner(impactPublicKey, { mint: mintPubkey });
                    if (response.value.length > 0) {
                         knownAtasRef.current[response.value[0].pubkey.toBase58()] = symbol;
                    }
                });
                await Promise.all(ataPromises);
                
                // Fetching historical transactions for a wallet is complex for SPL tokens without an indexer.
                // We'll primarily fetch SOL transactions and rely on the websocket for live SPL data.
                const signatures = await connection.getSignaturesForAddress(impactPublicKey, { limit: 100 });
                
                if (signatures.length > 0) {
                    const fetchedTxs = await connection.getParsedTransactions(
                        signatures.map(s => s.signature),
                        { maxSupportedTransactionVersion: 0 }
                    );
                    
                    const parsedTxs: DonationTransaction[] = [];
                    fetchedTxs.forEach((tx, index) => {
                        if (tx) {
                            parsedTxs.push(...processTransaction(tx, signatures[index].signature));
                        }
                    });

                    if (isMounted) {
                        const sortedTxs = parsedTxs.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 30);
                        setTransactions(sortedTxs);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch donation transactions:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const connectWebSocket = () => {
            wsRef.current = new WebSocket(QUICKNODE_WSS_URL);
            
            wsRef.current.onopen = () => {
                console.log("WebSocket connected for Live Donation Feed");
                // Subscribe to logs that mention the treasury wallet address
                // This is the most reliable way to capture both SOL and SPL transfers
                wsRef.current?.send(JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "logsSubscribe",
                    params: [
                        { mentions: [impactPublicKeyString] },
                        { commitment: "finalized" }
                    ]
                }));
            };

            wsRef.current.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.method === "logsNotification") {
                        const signature = data.params.result.value.signature;
                        
                        // Avoid processing a signature we might already have from the initial fetch
                        if (transactions.some(tx => tx.id === signature)) return;

                        const connection = new Connection(QUICKNODE_RPC_URL, 'finalized');
                        const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
                        
                        if (tx) {
                            const newTxs = processTransaction(tx, signature);
                            if (isMounted && newTxs.length > 0) {
                                setTransactions(prev => [...newTxs, ...prev.slice(0, 29)]);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message for donations:", e);
                }
            };
            
            wsRef.current.onclose = () => { if (isMounted) setTimeout(connectWebSocket, 5000); };
            wsRef.current.onerror = (error) => { wsRef.current?.close(); };
        };

        fetchInitialData().then(() => {
            if (isMounted) connectWebSocket();
        });

        return () => {
            isMounted = false;
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, []);

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-primary-900 dark:text-darkPrimary-100 font-bold text-xl">{t('live_donation_feed')}</h3>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs text-primary-500 dark:text-darkPrimary-400 pb-2 border-b border-primary-200 dark:border-darkPrimary-700 font-semibold">
                <span className="col-span-2">{t('wallet')}</span>
                <span className="text-right col-span-2">{t('amount_donated')}</span>
                <span className="text-right">{t('token')}</span>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-2 mt-2">
                {loading ? (
                     <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-500 dark:text-darkAccent-500" />
                    </div>
                ) : transactions.length > 0 ? transactions.map((tx) => (
                    <div key={tx.id} className={`grid grid-cols-5 gap-2 items-center text-sm p-1.5 rounded-md animate-fade-in-up ${tx.time.getTime() > Date.now() - 15000 ? 'bg-accent-100/50 dark:bg-darkAccent-500/10' : ''}`}>
                        <div className="col-span-2 flex items-center gap-2">
                           <AddressDisplay address={tx.address} className="text-xs" />
                        </div>
                        <div className="text-right font-mono col-span-2">
                           {tx.amount.toLocaleString(undefined, {maximumFractionDigits: 4})}
                        </div>
                        <div className="text-right font-mono flex items-center justify-end gap-1.5">
                            {getTokenIcon(tx.tokenSymbol)}
                            <span className="font-sans font-semibold">{tx.tokenSymbol}</span>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-8 text-primary-500 dark:text-darkPrimary-400">
                        <p>{t('donations_no_recent_donations', {defaultValue: 'No recent donations found.'})}</p>
                     </div>
                )}
            </div>
        </div>
    );
};
