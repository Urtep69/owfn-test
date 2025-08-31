import { sql } from '../lib/db.ts';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
    DISTRIBUTION_WALLETS, 
    PRESALE_DETAILS,
    QUICKNODE_RPC_URL,
    TOKEN_ALLOCATIONS,
    OWFN_MINT_ADDRESS,
} from '../constants.ts';

// Helius API setup for fetching token price
const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

interface HeliusAsset {
    token_info?: {
        price_info?: {
            price_per_token?: number;
        };
    };
}

async function getOwfnPrice(): Promise<{ currentUsd: number; source: string }> {
    if (!process.env.HELIUS_API_KEY) {
        console.warn("Helius API key not set, cannot fetch live price.");
        return { currentUsd: 0, source: 'Presale Rate' };
    }
    // During presale, the token is not yet traded, so its market price is effectively 0.
    // After launch, this function will fetch the real-time price from a DEX via Helius.
    const isPresaleActive = new Date() > PRESALE_DETAILS.startDate && new Date() < PRESALE_DETAILS.endDate;
    if (isPresaleActive) {
        return { currentUsd: 0, source: 'Presale Rate' };
    }

    try {
        const response = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-live-price',
                method: 'getAsset',
                params: { id: OWFN_MINT_ADDRESS },
            }),
        });
        if (!response.ok) return { currentUsd: 0, source: 'API Error' };
        
        const { result: asset } = (await response.json()) as { result: HeliusAsset };
        const price = asset?.token_info?.price_info?.price_per_token ?? 0;
        return { currentUsd: price, source: 'DEX' };

    } catch (error) {
        console.error("Failed to fetch OWFN price from Helius:", error);
        return { currentUsd: 0, source: 'API Error' };
    }
}


export default async function handler(req: any, res: any) {
    try {
        // --- Fetch General Donation Stats from DB ---
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

        // --- Fetch Donations from Last Week ---
        const { rows: weeklyDonationRows } = await sql`
            SELECT
                token_symbol,
                SUM(amount_usd) as total_usd
            FROM donations
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY token_symbol;
        `;

        const donationsLastWeek: { [key: string]: number } = {};
        weeklyDonationRows.forEach(row => {
            donationsLastWeek[row.token_symbol] = parseFloat(row.total_usd);
        });

        // --- Fetch Presale Stats from Solana Blockchain ---
        let presaleStats = {
            totalSolRaised: 0,
            presaleContributors: 0,
        };

        try {
            const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
            const presalePublicKey = new PublicKey(DISTRIBUTION_WALLETS.presale);
            const presaleStartTimestamp = Math.floor(PRESALE_DETAILS.startDate.getTime() / 1000);

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
        }
        
        const totalOwfnSold = presaleStats.totalSolRaised * PRESALE_DETAILS.rate;
        const presaleAllocation = TOKEN_ALLOCATIONS.find(a => a.name.includes('Presale'))?.value ?? 0;
        const percentageSold = presaleAllocation > 0 ? (totalOwfnSold / presaleAllocation) * 100 : 0;
        
        // --- Fetch Live OWFN Price ---
        const owfnPrice = await getOwfnPrice();

        const responseData = {
            ...donationStats,
            donationsLastWeek,
            presale: {
                ...presaleStats,
                totalOwfnSold,
                percentageSold,
            },
            owfnPrice,
        };
        
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=60, stale-while-revalidate=300', // Cache for 1 min
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