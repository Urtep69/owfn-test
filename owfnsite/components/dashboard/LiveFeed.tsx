import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { Loader2 } from 'lucide-react';
import type { PresaleTransaction } from '../../lib/types.js';
import { AddressDisplay } from '../AddressDisplay.js';
import { OwfnIcon, SolIcon } from '../IconComponents.js';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { QUICKNODE_RPC_URL, QUICKNODE_WSS_URL, PRESALE_STAGES } from '../../lib/constants.js';

const currentStage = PRESALE_STAGES[0];

export const LiveFeed = () => {
    const { t } = useAppContext();
    const [transactions, setTransactions] = useState<PresaleTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialTransactions = async () => {
            if (!isMounted) return;
            setLoading(true);
            try {
                const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
                const presalePublicKey = new PublicKey(currentStage.distributionWallet);
                const presaleStartTimestamp = Math.floor(new Date(currentStage.startDate).getTime() / 1000);
                const signatures = await connection.getSignaturesForAddress(presalePublicKey, { limit: 50 });
                const relevantSignatures = signatures.filter(sig => sig.blockTime && sig.blockTime > presaleStartTimestamp);
                
                if (relevantSignatures.length > 0) {
                    const fetchedTxs = await connection.getParsedTransactions(relevantSignatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
                    const parsedTxs: PresaleTransaction[] = [];
                    fetchedTxs.forEach((tx, index) => {
                        if (tx && tx.blockTime) {
                            tx.transaction.message.instructions.forEach(inst => {
                                if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === currentStage.distributionWallet) {
                                    parsedTxs.push({ id: relevantSignatures[index].signature, address: inst.parsed.info.source, solAmount: inst.parsed.info.lamports / LAMPORTS_PER_SOL, owfnAmount: (inst.parsed.info.lamports / LAMPORTS_PER_SOL) * currentStage.rate, time: new Date(tx.blockTime! * 1000) });
                                }
                            });
                        }
                    });
                    if (isMounted) setTransactions(parsedTxs.sort((a, b) => b.time.getTime() - a.time.getTime()));
                }
            } catch (error) { console.error("Failed to fetch dashboard feed transactions:", error);
            } finally { if (isMounted) setLoading(false); }
        };

        const connectWebSocket = () => {
            wsRef.current = new WebSocket(QUICKNODE_WSS_URL);
            wsRef.current.onopen = () => {
                wsRef.current?.send(JSON.stringify({
                    jsonrpc: "2.0", id: 1, method: "transactionSubscribe",
                    params: [{ accountInclude: [currentStage.distributionWallet] }, { commitment: "finalized", encoding: "jsonParsed", transactionDetails: "full", showRewards: false }]
                }));
            };
            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.method === "transactionNotification") {
                        const tx = data.params.result.transaction;
                        const signature = tx.signatures[0];
                        const nativeTransfer = tx.message.instructions.find((inst: any) => inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed?.info?.destination === currentStage.distributionWallet);
                        if (nativeTransfer && isMounted) {
                            const newTx: PresaleTransaction = { id: signature, address: nativeTransfer.parsed.info.source, solAmount: nativeTransfer.parsed.info.lamports / LAMPORTS_PER_SOL, owfnAmount: (nativeTransfer.parsed.info.lamports / LAMPORTS_PER_SOL) * currentStage.rate, time: new Date() };
                            setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
                        }
                    }
                } catch (e) { console.error("Error parsing WebSocket message in dashboard feed:", e); }
            };
            wsRef.current.onclose = () => { if (isMounted) setTimeout(connectWebSocket, 5000); };
            wsRef.current.onerror = (error) => { wsRef.current?.close(); };
        };

        fetchInitialTransactions();
        connectWebSocket();
        return () => { isMounted = false; wsRef.current?.close(); };
    }, []);

    return (
        <div className="bg-dextools-card border border-dextools-border rounded-md p-4 h-full flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 bg-dextools-accent-green rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-dextools-text-primary">Live Transaction Feed</h3>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs text-dextools-text-secondary pb-2 border-b border-dextools-border font-semibold">
                <span className="col-span-2">Wallet</span>
                <span className="text-right">SOL Spent</span>
                <span className="col-span-2 text-right">OWFN Received</span>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-2 mt-2">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-dextools-text-secondary" /></div>
                ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-5 gap-2 items-center text-sm p-1.5 rounded-md animate-fade-in text-dextools-text-primary">
                           <div className="col-span-2"><AddressDisplay address={tx.address} className="text-xs" /></div>
                           <div className="font-mono text-right flex items-center justify-end gap-1"><SolIcon className="w-3.5 h-3.5" /> {tx.solAmount.toFixed(2)}</div>
                           <div className="font-mono col-span-2 text-right flex items-center justify-end gap-1 text-dextools-accent-green"><OwfnIcon className="w-3.5 h-3.5" /> {(tx.owfnAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                    ))
                ) : (
                     <div className="flex justify-center items-center h-full text-sm text-dextools-text-secondary"><p>Awaiting new transactions...</p></div>
                )}
            </div>
        </div>
    );
};