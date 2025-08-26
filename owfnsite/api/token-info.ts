import type { TokenDetails } from '../types.ts';
import { MOCK_TOKEN_DETAILS } from '../constants.ts';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const QUICKNODE_TOKEN_API_BASE_URL = `https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/addon/912/networks/solana/tokens/`;

async function fetchHeliusData(mintAddress: string): Promise<Partial<TokenDetails> | null> {
    if (!process.env.HELIUS_API_KEY) {
        console.warn("Helius API key not configured. Skipping on-chain data.");
        return null;
    }
    try {
        const response = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-token-info-helius',
                method: 'getAsset',
                params: { id: mintAddress },
            }),
        });
        if (!response.ok) return null;
        
        const jsonResponse = await response.json();
        if (jsonResponse.error || !jsonResponse.result) return null;
        
        const asset = jsonResponse.result;
        const tokenInfo = asset.token_info || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};

        let mintAuthority: string | null = null;
        let freezeAuthority: string | null = null;
        let updateAuthority: string | null = null;

        if (Array.isArray(asset.authorities)) {
             for (const authority of asset.authorities) {
                if (authority?.scopes?.includes('mint')) mintAuthority = authority.address;
                if (authority?.scopes?.includes('freeze')) freezeAuthority = authority.address;
                if (authority?.scopes?.includes('update')) updateAuthority = authority.address;
            }
        }
        
        const decimals = tokenInfo.decimals ?? 9;
        const supply = tokenInfo.supply ? Number(BigInt(tokenInfo.supply)) / (10 ** decimals) : 0;

        return {
            mintAddress: asset.id,
            name: metadata.name,
            symbol: metadata.symbol,
            logo: links.image || null,
            decimals: decimals,
            totalSupply: supply,
            mintAuthority,
            freezeAuthority,
            updateAuthority,
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
        };

    } catch (e) {
        console.error("Error fetching from Helius:", e);
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
        const [heliusData, quickNodeData] = await Promise.all([
            fetchHeliusData(mintAddress),
            fetchQuickNodeData(mintAddress)
        ]);
        
        if (!heliusData && !quickNodeData) {
            return res.status(404).json({ error: `No data could be found for mint: ${mintAddress}. Both data sources failed.` });
        }
        
        // Start with a base object from mock data if available
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        const baseData = mockDetailsKey ? MOCK_TOKEN_DETAILS[mockDetailsKey] : {};
        
        // Merge data, giving precedence to live data over mock, and QuickNode market data over Helius.
        const mergedData: Partial<TokenDetails> = {
            ...baseData,
            ...heliusData,
            ...quickNodeData,
        };

        // Ensure essential fields have fallbacks
        mergedData.mintAddress = mintAddress;
        mergedData.name = mergedData.name || 'Unknown Token';
        mergedData.symbol = mergedData.symbol || `${mintAddress.slice(0, 4)}...`;

        return res.status(200).json(mergedData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}