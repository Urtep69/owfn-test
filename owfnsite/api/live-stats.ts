import { sql } from '../lib/db.ts';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
    DISTRIBUTION_WALLETS, 
    PRESALE_DETAILS,
    QUICKNODE_RPC_URL,
} from '../constants.ts';

export default async function handler(req: any, res: any) {
    try {
        // --- Fetch Donation Stats from DB ---
        const { rows: donationRows } = await sql`
            SELECT 
                COUNT(DISTINCT wallet_address) as total_donors, 
                SUM(amount_usd) as total_donated_usd 
            FROM donations;
        `;
        const donationStats = {
            totalDonors: parseInt(donationRows[0]?.total_donors || '0', 10),
            totalDonatedUSD: parseFloat(donationRows[0]?.total_donated_usd || '0'),
        };

        // --- Fetch Presale Stats from Solana Blockchain ---
        let presaleStats = {
            totalSolRaised: 0,
            presaleContributors: 0,
        };

        try {
            const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
            const presalePublicKey = new PublicKey(DISTRIBUTION_WALLETS.presale);
            const presaleStartTimestamp = Math.floor(PRESALE_DETAILS.startDate.getTime() / 1000);

            // Fetch recent signatures. Limit to 1000 for performance.
            const signatures = await connection.getSignaturesForAddress(presalePublicKey, { limit: 1000 });
            const relevantSignatures = signatures.filter(sig => sig.blockTime && sig.blockTime >= presaleStartTimestamp);
            
            if (relevantSignatures.length > 0) {
                 const transactions = await connection.getParsedTransactions(
                    relevantSignatures.map(s => s.signature),
                    { maxSupportedTransactionVersion: 0 }
                );
                
                let totalLamports = 0;
                const uniqueSources = new Set<string>();

                transactions.forEach(tx => {
                    if (tx) {
                        tx.transaction.message.instructions.forEach(inst => {
                            if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === DISTRIBUTION_WALLETS.presale) {
                                totalLamports += inst.parsed.info.lamports;
                                uniqueSources.add(inst.parsed.info.source);
                            }
                        });
                    }
                });
                
                presaleStats.totalSolRaised = totalLamports / LAMPORTS_PER_SOL;
                presaleStats.presaleContributors = uniqueSources.size;
            }
        } catch (solanaError) {
            console.error("Failed to fetch presale stats from Solana:", solanaError);
            // Don't crash, just return 0 for presale stats. The chatbot will handle it.
        }
        
        const totalOwfnSold = presaleStats.totalSolRaised * PRESALE_DETAILS.rate;

        const responseData = {
            ...donationStats,
            ...presaleStats,
            totalOwfnSold,
        };
        
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                // Cache for 5 mins, allow stale for 10
                'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
            },
        });

    } catch (dbError) {
        console.error('Error fetching live stats (DB):', dbError);
        return new Response(JSON.stringify({ error: 'Failed to fetch live statistics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}