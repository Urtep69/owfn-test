import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS } from '../constants.ts';
import { COMMON_TOKENS } from '../lib/common-tokens.ts';

// Helper to serialize icon components for JSON transport
function getLogoData(mintAddress: string, imageUri?: string) {
    if (mintAddress === OWFN_MINT_ADDRESS) return { type: 'OwfnIcon', props: {} };
    if (mintAddress === 'So11111111111111111111111111111111111111112') return { type: 'SolIcon', props: {} };
    if (mintAddress === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a') return { type: 'UsdcIcon', props: {} };
    if (mintAddress === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') return { type: 'UsdtIcon', props: {} };
    if (imageUri) return { type: 'GenericTokenIcon', props: { uri: imageUri } };
    return { type: 'GenericTokenIcon', props: {} };
}

// Create a lookup map from the pre-compiled list for fast access.
// This is created once when the serverless function initializes.
const tokenMetaMap = new Map<string, any>(COMMON_TOKENS.map(token => [token.address, token]));


export default async function handler(req: any, res: any) {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: "Wallet address is required." });
    }

    const rpcUrl = process.env.QUICKNODE_RPC_URL;
    if (!rpcUrl) {
        console.error("CRITICAL: QUICKNODE_RPC_URL environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error: RPC URL not configured." });
    }

    try {
        const connection = new Connection(rpcUrl, 'confirmed');
        const publicKey = new PublicKey(walletAddress);

        // Fetch SOL balance and token accounts in parallel.
        const [solBalance, tokenAccounts] = await Promise.all([
            connection.getBalance(publicKey),
            connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
        ]);

        type SerializableToken = Omit<Token, 'logo'> & { logo: { type: string, props: any } };
        const tokens: SerializableToken[] = [];
        const mintsForPricing: string[] = ['So11111111111111111111111111111111111111112'];

        // Process SPL tokens and collect mints that the user actually owns.
        const splTokens = tokenAccounts.value
            .map(accountInfo => {
                try {
                    const parsedInfo = accountInfo.account.data.parsed.info;
                    if (parsedInfo && parsedInfo.tokenAmount && parsedInfo.tokenAmount.uiAmount > 0) {
                        mintsForPricing.push(parsedInfo.mint);
                        return {
                            mint: parsedInfo.mint,
                            balance: parsedInfo.tokenAmount.uiAmount,
                            decimals: parsedInfo.tokenAmount.decimals
                        };
                    }
                } catch(e) { /* ignore malformed accounts */ }
                return null;
            })
            .filter((t): t is { mint: string, balance: number, decimals: number } => t !== null);

        // Fetch all prices in a single batch call from Jupiter.
        const prices = new Map<string, number>();
        try {
            const uniqueMints = [...new Set(mintsForPricing)];
            if (uniqueMints.length > 0) {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${uniqueMints.join(',')}`);
                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    if (priceData.data) {
                        Object.entries(priceData.data).forEach(([mint, data]: [string, any]) => {
                            prices.set(mint, data.price || 0);
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Could not fetch prices from Jupiter API", e);
            // Continue gracefully without prices if the API fails.
        }

        const solPrice = prices.get('So11111111111111111111111111111111111111112') || 0;

        // Add SOL balance to the list.
        if (solBalance > 0) {
            const balance = solBalance / LAMPORTS_PER_SOL;
            tokens.push({
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                logo: getLogoData('So1111111111111111111111111111111111111111112'),
                pricePerToken: solPrice,
                usdValue: balance * solPrice,
            });
        }
        
        // Add SPL tokens to the list, enriching with metadata from our local list and prices from Jupiter.
        splTokens.forEach(token => {
            const meta = tokenMetaMap.get(token.mint);
            const price = prices.get(token.mint) || 0;
            tokens.push({
                mintAddress: token.mint,
                balance: token.balance,
                decimals: token.decimals,
                name: meta?.name || 'Unknown Token',
                symbol: meta?.symbol || token.mint.substring(0, 4) + '...',
                logo: getLogoData(token.mint, meta?.logoURI),
                pricePerToken: price,
                usdValue: token.balance * price,
            });
        });
        
        const sortedTokens = tokens.sort((a, b) => b.usdValue - a.usdValue);
        
        return res.status(200).json(sortedTokens);

    } catch (error) {
        console.error(`Error in wallet-balances API for address ${walletAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve wallet balances. Reason: ${errorMessage}` });
    }
}