import type { TokenDetails } from '../types.ts';
import { MOCK_TOKEN_DETAILS, QUICKNODE_RPC_URL } from '../constants.ts';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const QUICKNODE_TOKEN_API_BASE_URL = `https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/addon/912/networks/solana/tokens/`;

async function fetchOnChainData(mintAddress: string): Promise<Partial<TokenDetails> | null> {
    try {
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const mintPublicKey = new PublicKey(mintAddress);
        
        // Robustly fetch mint info, trying Token-2022 first then falling back to standard SPL Token
        const mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID).catch(async () => {
            try {
                 console.warn(`getMint with Token-2022 program failed for ${mintAddress}, falling back to standard SPL Token program.`);
                 return await getMint(connection, mintPublicKey, 'confirmed', TOKEN_PROGRAM_ID);
            } catch (e) {
                 console.error(`All getMint attempts failed for ${mintAddress}. It may not be a valid mint address.`, e);
                 return null;
            }
        });

        if (!mintInfo) {
            return null;
        }

        const isToken2022 = mintInfo.programId.equals(TOKEN_2022_PROGRAM_ID);

        return {
            decimals: mintInfo.decimals,
            totalSupply: Number(mintInfo.supply) / (10 ** mintInfo.decimals),
            mintAuthority: mintInfo.mintAuthority ? mintInfo.mintAuthority.toBase58() : null,
            freezeAuthority: mintInfo.freezeAuthority ? mintInfo.freezeAuthority.toBase58() : null,
            tokenStandard: isToken2022 ? 'Token-2022' : 'SPL Token',
            // Metadata update authority is more complex to get via RPC, so we'll omit it for stability.
            // The UI will gracefully handle this by showing "Revoked".
            updateAuthority: null, 
        };
    } catch (e) {
        console.error(`General error in fetchOnChainData for ${mintAddress}:`, e);
        return null;
    }
}


async function fetchQuickNodeData(mintAddress: string): Promise<Partial<TokenDetails> | null> {
    try {
        const response = await fetch(`${QUICKNODE_TOKEN_API_BASE_URL}${mintAddress}`);
        if (!response.ok) return null;

        const data = await response.json();
        
        // Flatten the nested pricing and volume data for easier consumption
        return {
            pricePerToken: parseFloat(data.price_usd) || 0,
            priceSol: parseFloat(data.price_sol) || 0,
            fdv: parseFloat(data.fdv_usd) || 0,
            marketCap: parseFloat(data.market_cap_usd) || 0,
            liquidity: parseFloat(data.liquidity_usd) || 0,
            holders: data.holders || 0,
            volume24h: data.volume_usd?.h24 || 0,
            price24hChange: data.price_change_percent?.h24 || 0,
            txns: data.transactions, // Keep the original structure e.g., { h24: { buys: ..., sells: ...}}
            logo: data.logo_url || null,
            name: data.name || null,
            symbol: data.symbol || null,
        };
    } catch (e) {
        console.error("Error fetching from QuickNode:", e);
        return null;
    }
}


export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    try {
        const [onChainData, quickNodeData] = await Promise.all([
            fetchOnChainData(mintAddress),
            fetchQuickNodeData(mintAddress)
        ]);
        
        if (!onChainData && !quickNodeData) {
            return res.status(404).json({ error: `No data could be found for mint: ${mintAddress}. All data sources failed.` });
        }
        
        // Start with a base object from mock data if available
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        // FIX: Explicitly type baseData to prevent TypeScript errors when it's an empty object.
        const baseData: Partial<TokenDetails> = mockDetailsKey ? MOCK_TOKEN_DETAILS[mockDetailsKey] : {};
        
        // Merge data, giving precedence to live data over mock.
        // On-chain data is more authoritative for its fields (like supply, authorities).
        // QuickNode is the primary source for market data and metadata like name/logo.
        const mergedData: Partial<TokenDetails> = {
            ...baseData,
            ...onChainData,
            ...quickNodeData,
        };

        // Ensure essential fields have fallbacks
        mergedData.mintAddress = mintAddress;
        // FIX: Removed onChainData from metadata fallbacks as it does not return name/symbol.
        // The type fix for baseData also resolves the property access errors here.
        mergedData.name = quickNodeData?.name || baseData.name || 'Unknown Token';
        mergedData.symbol = quickNodeData?.symbol || baseData.symbol || `${mintAddress.slice(0, 4)}...`;
        mergedData.logo = quickNodeData?.logo || baseData.logo || null;

        return res.status(200).json(mergedData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
