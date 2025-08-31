
import { sql } from '../lib/db.ts';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
    DISTRIBUTION_WALLETS, 
    PRESALE_DETAILS,
    QUICKNODE_RPC_URL,
    TOKEN_ALLOCATIONS,
    OWFN_MINT_ADDRESS,
    KNOWN_TOKEN_MINT_ADDRESSES,
} from '../constants.ts';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

interface HeliusAsset {
    id: string;
    token_info?: {
        price_info?: {
            price_per_token?: number;
        };
    };
    content?: {
        metadata?: {
            symbol?: string;
        };
    };
}

async function getMultipleTokenPrices(mints: string[]): Promise<{ [symbol: string]: number }> {
    if (!process.env.HELIUS_API_KEY || mints.length === 0) {
        console.warn("Helius API key not set or no mints provided.");
        return {};
    }

    try {
        const response = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-token-prices',
                method: 'getAssetBatch',
                params: { ids: mints },
            }),
        });
        if (!response.ok) {
            console.error(`Helius API error for getAssetBatch: ${response.status}`);
            return {};
        }
        
        const { result: assets } = (await response.json()) as { result: HeliusAsset[] };
        const prices: { [symbol: string]: number } = {};
        
        assets.forEach(asset => {
            const symbol = asset.content?.metadata?.symbol;
            const price = asset.token_info?.price_info?.price_per_token;
            if (symbol && typeof price === 'number') {
                prices[symbol] = price;
            }
        });
        
        // Ensure USDC and USDT are pegged to 1 if API fails for them
        if (!prices['USDC']) prices['USDC'] = 1.0;
        if (!prices['USDT']) prices['USDT'] = 1.0;
        
        // If OWFN price is not found and we are post-presale, it's 0. During presale, it's also effectively 0 on DEX.
        if (!prices['OWFN']) prices['OWFN'] = 0;


        return prices;

    } catch (error) {
        console.error("Failed to fetch token prices from Helius:", error);
        return { 'USDC': 1.0, 'USDT': 1.0 }; // Fallback for stablecoins
    }
}


export default async function handler(req: any, res: any) {
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const { rows: allTimeDonationRows } = await sql`
            SELECT 
                COUNT(DISTINCT wallet_address) as total_donors, 
                SUM(amount_usd) as total_donated_usd 
            FROM donations;
        `;
        const allTimeDonationStats = {
            totalDonors: parseInt(allTimeDonationRows[0]?.total_donors || '0', 10),
            totalDonatedUSD: parseFloat(allTimeDonationRows[0]?.total_donated_usd || '0'),
        };
        
        let donationsForPeriod: { [key: string]: number } = {};
        if (startDate && endDate) {
            try {
                if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
                    throw new Error("Invalid date format provided.");
                }

                const { rows: periodDonationRows } = await sql`
                    SELECT
                        token_symbol,
                        SUM(amount_usd) as total_usd
                    FROM donations
                    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
                    GROUP BY token_symbol;
                `;
                
                periodDonationRows.forEach(row => {
                    donationsForPeriod[row.token_symbol] = parseFloat(row.total_usd);
                });
            } catch (dateError) {
                 console.error("Error fetching period-specific donations:", dateError);
            }
        }

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
        const percentageSold = PRESALE_DETAILS.hardCap > 0 ? (presaleStats.totalSolRaised / PRESALE_DETAILS.hardCap) * 100 : 0;
        
        const tokenPrices = await getMultipleTokenPrices([
            OWFN_MINT_ADDRESS,
            KNOWN_TOKEN_MINT_ADDRESSES.SOL,
            KNOWN_TOKEN_MINT_ADDRESSES.USDC,
            KNOWN_TOKEN_MINT_ADDRESSES.USDT
        ]);

        const responseData = {
            ...allTimeDonationStats,
            donationsForPeriod,
            period: { startDate, endDate },
            presale: {
                ...presaleStats,
                totalOwfnSold,
                percentageSold,
            },
            tokenPrices,
        };
        
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
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