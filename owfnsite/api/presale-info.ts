import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PRESALE_DETAILS, DISTRIBUTION_WALLETS } from '../constants.ts';
import type { PresaleTransaction, AdminPresaleTx } from '../types.ts';

// This function identifies a valid presale contribution within a Helius enriched transaction.
// For testing purposes, the filter for internal project wallets has been removed.
// It now identifies any native SOL transfer TO the presale wallet as a valid transaction for the feed.
const findPresaleTransfer = (tx: any): { fromUserAccount: string, amount: number } | null => {
    // A transaction must have nativeTransfers to be a SOL contribution.
    if (!tx || !Array.isArray(tx.nativeTransfers) || tx.nativeTransfers.length === 0) {
        return null;
    }

    // Find the first valid transfer that is directed TO the presale wallet.
    // The check against internal project wallets has been removed to allow test transactions to appear.
    for (const transfer of tx.nativeTransfers) {
        if (transfer.toUserAccount === DISTRIBUTION_WALLETS.presale && transfer.fromUserAccount) {
            return {
                fromUserAccount: transfer.fromUserAccount,
                amount: transfer.amount 
            };
        }
    }

    // If no such transfer is found, it's not a contribution.
    return null;
};


// Main handler function
export default async function handler(req: any, res: any) {
    const { mode, walletAddress, limit = '20' } = req.query;

    const HELIUS_API_KEY = "a37ba545-d429-43e3-8f6d-d51128c49da9";
    if (!HELIUS_API_KEY) {
        console.error("CRITICAL: HELIUS_API_KEY is not set.");
        return res.status(500).json({ error: "Server configuration error. API key is missing." });
    }

    try {
        // A single, reusable function to fetch the complete history of presale transactions.
        const fetchAllPresaleTxs = async (): Promise<any[]> => {
            let allValidTxs: any[] = [];
            let lastSignature: string | undefined = undefined;

            while (true) {
                const url = `https://api.helius.xyz/v0/addresses/${DISTRIBUTION_WALLETS.presale}/transactions?api-key=${HELIUS_API_KEY}${lastSignature ? `&before=${lastSignature}` : ''}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch transactions from Helius: ${response.statusText}`);
                const data = await response.json();
                
                if (!Array.isArray(data) || data.length === 0) {
                    break;
                }
                
                // Filter transactions based on the robust transfer logic.
                const validTxs = data.filter(tx => findPresaleTransfer(tx) !== null);
                allValidTxs.push(...validTxs);

                // Stop paginating for performance. This limit is sufficient for pre-launch demonstration.
                if (allValidTxs.length > 500 || data.length < 100) {
                    break;
                }
                
                lastSignature = data[data.length - 1].signature;
                if (!lastSignature) break;
            }
            return allValidTxs;
        };
        
        if (mode === 'admin-all' || mode === 'progress' || mode === 'user') {
            const allTxs = await fetchAllPresaleTxs();

            if (mode === 'admin-all') {
                const parsedTxs: AdminPresaleTx[] = allTxs
                    .map((tx: any) => {
                        const transfer = findPresaleTransfer(tx);
                        if (!transfer) return null;
                        return {
                            signature: tx.signature,
                            from: transfer.fromUserAccount,
                            solAmount: transfer.amount / LAMPORTS_PER_SOL,
                            owfnAmount: (transfer.amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                            timestamp: tx.timestamp,
                            lamports: transfer.amount,
                        };
                    })
                    .filter((tx): tx is AdminPresaleTx => tx !== null);

                return res.status(200).json(parsedTxs);
            }

            if (mode === 'progress') {
                const totalContributed = allTxs.reduce((sum: number, tx: any) => {
                    const transfer = findPresaleTransfer(tx);
                    return sum + (transfer ? transfer.amount / LAMPORTS_PER_SOL : 0);
                }, 0);
                return res.status(200).json({ totalContributed });
            }

            if (mode === 'user') {
                if (!walletAddress) return res.status(400).json({ error: 'Wallet address required for user mode.' });
                const userContribution = allTxs.reduce((sum: number, tx: any) => {
                    const transfer = findPresaleTransfer(tx);
                    if (transfer && transfer.fromUserAccount === walletAddress) {
                        return sum + (transfer.amount / LAMPORTS_PER_SOL);
                    }
                    return sum;
                }, 0);
                return res.status(200).json({ userContribution });
            }
        }

        if (mode === 'transactions') {
            // For the live feed, we only need the most recent page.
            const fetchLimit = parseInt(limit) * 3; // Fetch more to filter non-contributions
            const url = `https://api.helius.xyz/v0/addresses/${DISTRIBUTION_WALLETS.presale}/transactions?api-key=${HELIUS_API_KEY}&limit=${fetchLimit}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch transactions from Helius: ${response.statusText}`);
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                 return res.status(200).json([]);
            }
            
            const parsedTxs: PresaleTransaction[] = data
                .map((tx: any) => {
                    const transfer = findPresaleTransfer(tx);
                    if (!transfer) return null;
                    return {
                        id: tx.signature,
                        address: transfer.fromUserAccount,
                        solAmount: transfer.amount / LAMPORTS_PER_SOL,
                        owfnAmount: (transfer.amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                        time: new Date(tx.timestamp * 1000),
                    };
                })
                .filter((tx): tx is PresaleTransaction => tx !== null)
                .slice(0, parseInt(limit));
            
            return res.status(200).json(parsedTxs);
        }

        return res.status(400).json({ error: 'Invalid mode specified.' });

    } catch (error) {
        console.error(`[FATAL] Error in presale-info API with mode ${mode}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve presale data. Reason: ${errorMessage}` });
    }
}
