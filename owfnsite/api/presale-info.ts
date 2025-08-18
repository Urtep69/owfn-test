import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PRESALE_DETAILS, DISTRIBUTION_WALLETS } from '../constants.ts';
import type { PresaleTransaction, AdminPresaleTx } from '../types.ts';

// Helper function to find the relevant presale transfer within a transaction object.
// This is more robust as it iterates through all native transfers and filters out internal movements.
const findPresaleTransfer = (tx: any): any | null => {
    // Basic validation to prevent crashes on malformed data from Helius.
    if (tx?.type !== 'NATIVE_TRANSFER' || !Array.isArray(tx.nativeTransfers)) {
        return null;
    }
    
    // Create a Set of all internal project wallets to filter out internal transfers.
    const allProjectWallets = new Set(Object.values(DISTRIBUTION_WALLETS));

    // Find the first transfer that is TO the presale wallet and NOT FROM another project wallet.
    return tx.nativeTransfers.find((transfer: any) => 
        transfer?.toUserAccount === DISTRIBUTION_WALLETS.presale &&
        !allProjectWallets.has(transfer?.fromUserAccount)
    );
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
        const presaleStartTimestamp = Math.floor(PRESALE_DETAILS.startDate.getTime() / 1000);

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
                
                const relevantTxs = data.filter(tx => 
                    // This is the production-ready date filter. It will automatically apply
                    // once the presale start date is reached. It is correctly placed here to
                    // stop pagination once we go too far back in time.
                    tx.timestamp >= presaleStartTimestamp
                );
                
                const validTxs = relevantTxs.filter(tx => findPresaleTransfer(tx) !== null);
                allValidTxs.push(...validTxs);

                if (relevantTxs.length < data.length) {
                    // We've hit transactions before the presale start, so we can stop.
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
                const parsedTxs: AdminPresaleTx[] = allTxs.map((tx: any) => {
                    const transfer = findPresaleTransfer(tx)!;
                    return {
                        signature: tx.signature,
                        from: transfer.fromUserAccount,
                        solAmount: transfer.amount / LAMPORTS_PER_SOL,
                        owfnAmount: (transfer.amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                        timestamp: tx.timestamp,
                        lamports: transfer.amount,
                    };
                });
                return res.status(200).json(parsedTxs);
            }

            if (mode === 'progress') {
                const totalContributed = allTxs.reduce((sum: number, tx: any) => sum + (findPresaleTransfer(tx)!.amount / LAMPORTS_PER_SOL), 0);
                return res.status(200).json({ totalContributed });
            }

            if (mode === 'user') {
                if (!walletAddress) return res.status(400).json({ error: 'Wallet address required for user mode.' });
                const userTxs = allTxs.filter((tx: any) => findPresaleTransfer(tx)?.fromUserAccount === walletAddress);
                const userContribution = userTxs.reduce((sum: number, tx: any) => sum + (findPresaleTransfer(tx)!.amount / LAMPORTS_PER_SOL), 0);
                return res.status(200).json({ userContribution });
            }
        }

        if (mode === 'transactions') {
            // For the live feed, we only need the most recent page.
            // We fetch more than requested to account for filtering out non-contribution transactions.
            const fetchLimit = parseInt(limit) * 3;
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
                    // For testing before the official start date, we don't filter by time here.
                    // This allows recent test transactions to be visible.
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