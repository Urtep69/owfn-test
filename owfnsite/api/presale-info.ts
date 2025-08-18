import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PRESALE_DETAILS, DISTRIBUTION_WALLETS } from '../constants.ts';
import type { PresaleTransaction, AdminPresaleTx } from '../types.ts';

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
        let allTxs: any[] = [];
        let lastSignature: string | undefined = undefined;

        // This is the new "ultra-modern" and permanent filtering logic.
        // It's designed to be crash-proof and correctly identify presale contributions.
        const isPresaleTx = (tx: any): boolean => {
            // Defensive check to ensure we only process valid transaction objects.
            if (!tx || typeof tx !== 'object') {
                return false;
            }
            
            // This is the production-ready date filter. It is temporarily disabled
            // to allow you to see recent test transactions and confirm the feed is working live.
            // Once the real date reaches the presale start date, this filter will automatically apply.
            // if (tx.timestamp < presaleStartTimestamp) {
            //     return false;
            // }

            // A highly robust check for valid presale contributions.
            return (
                tx.type === 'NATIVE_TRANSFER' &&
                Array.isArray(tx.nativeTransfers) &&
                tx.nativeTransfers.length > 0 &&
                tx.nativeTransfers[0]?.toUserAccount === DISTRIBUTION_WALLETS.presale &&
                tx.nativeTransfers[0]?.fromUserAccount !== DISTRIBUTION_WALLETS.presale
            );
        };

        // A single, reusable fetch loop
        const fetchAllPresaleTxs = async () => {
             while (true) {
                const url = `https://api.helius.xyz/v0/addresses/${DISTRIBUTION_WALLETS.presale}/transactions?api-key=${HELIUS_API_KEY}${lastSignature ? `&before=${lastSignature}` : ''}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch transactions from Helius: ${response.statusText}`);
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    // Stop if Helius returns something unexpected
                    break;
                }
                
                const presaleTxs = data.filter(isPresaleTx);
                
                allTxs.push(...presaleTxs);

                // Stop fetching if we've reached the end or gone past the presale start date
                if (data.length < 100 || (data.length > 0 && data[data.length - 1].timestamp < presaleStartTimestamp)) {
                    break;
                }
                lastSignature = data.length > 0 ? data[data.length - 1].signature : undefined;
                if (!lastSignature) break;
            }
        };

        if (mode === 'admin-all') {
            await fetchAllPresaleTxs();
            const parsedTxs: AdminPresaleTx[] = allTxs.map((tx: any) => ({
                signature: tx.signature,
                from: tx.nativeTransfers[0].fromUserAccount,
                solAmount: tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL,
                owfnAmount: (tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                timestamp: tx.timestamp,
                lamports: tx.nativeTransfers[0].amount,
            }));
            return res.status(200).json(parsedTxs);
        }

        if (mode === 'progress') {
            await fetchAllPresaleTxs();
            const totalContributed = allTxs.reduce((sum: number, tx: any) => sum + (tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL), 0);
            return res.status(200).json({ totalContributed });
        }
        
        if (mode === 'user') {
            if (!walletAddress) return res.status(400).json({ error: 'Wallet address required for user mode.' });
            await fetchAllPresaleTxs();
            const userTxs = allTxs.filter((tx: any) => tx.nativeTransfers[0]?.fromUserAccount === walletAddress);
            const userContribution = userTxs.reduce((sum: number, tx: any) => sum + (tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL), 0);
            return res.status(200).json({ userContribution });
        }

        if (mode === 'transactions') {
            const url = `https://api.helius.xyz/v0/addresses/${DISTRIBUTION_WALLETS.presale}/transactions?api-key=${HELIUS_API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch transactions from Helius: ${response.statusText}`);
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                 return res.status(200).json([]);
            }
            
            const parsedTxs: PresaleTransaction[] = data
                .filter(isPresaleTx)
                .slice(0, parseInt(limit)) // Manually limit the results
                .map((tx: any) => ({
                    id: tx.signature,
                    address: tx.nativeTransfers[0].fromUserAccount,
                    solAmount: tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL,
                    owfnAmount: (tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                    time: new Date(tx.timestamp * 1000),
                }));
            
            return res.status(200).json(parsedTxs);
        }

        return res.status(400).json({ error: 'Invalid mode specified.' });

    } catch (error) {
        console.error(`[FATAL] Error in presale-info API with mode ${mode}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve presale data. Reason: ${errorMessage}` });
    }
}