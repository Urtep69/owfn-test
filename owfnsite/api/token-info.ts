import type { TokenDetails } from '../types.ts';
import { MOCK_TOKEN_DETAILS } from '../constants.ts';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/simple/token_price/solana`;

function calculateMarketCap(price: number, supply: number): number {
    if (!price || !supply) return 0;
    return price * supply;
}

const safeParseAuthorities = (authorities: any[] | undefined) => {
    let mint: string | null = null;
    let freeze: string | null = null;
    let update: string | null = null;

    if (!Array.isArray(authorities)) {
        return { mintAuthority: null, freezeAuthority: null, updateAuthority: null };
    }

    const findAuthority = (scope: string): string | null => {
        const authority = authorities.find((a: any) =>
            a && typeof a === 'object' && Array.isArray(a.scopes) && a.scopes.includes(scope)
        );
        return authority?.address || null;
    };

    mint = findAuthority('mint');
    freeze = findAuthority('freeze');
    // A token can have 'update' (SPL) or 'metadata_update' (Metaplex). Check for both.
    update = findAuthority('update') || findAuthority('metadata_update');
    
    return { mintAuthority: mint, freezeAuthority: freeze, updateAuthority: update };
};


export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    
    if (!process.env.HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error for Helius API." });
    }

    try {
        // --- API Call Promises ---
        const heliusPromise = fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-token-info',
                method: 'getAsset',
                params: { id: mintAddress },
            }),
        });

        const coingeckoPromise = fetch(`${COINGECKO_API_URL}?contract_addresses=${mintAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`);

        const [heliusResponse, coingeckoResponse] = await Promise.all([heliusPromise, coingeckoPromise]);

        // --- Helius Data Processing ---
        if (!heliusResponse.ok) throw new Error(`Helius API Error: ${await heliusResponse.text()}`);
        const heliusJson = await heliusResponse.json();
        if (heliusJson.error) throw new Error(`Helius Error: ${heliusJson.error.message}`);
        const asset = heliusJson.result;
        if (!asset) return res.status(404).json({ error: `No data found for mint: ${mintAddress}.` });

        const tokenInfo = asset.token_info || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const decimals = tokenInfo.decimals ?? 9;
        
        let supply: number;
        try {
            supply = tokenInfo.supply ? Number(BigInt(tokenInfo.supply)) / (10 ** decimals) : 0;
        } catch (e) {
            console.warn(`Could not parse supply for mint ${mintAddress}. Raw value: '${tokenInfo.supply}'. Falling back to 0. Error:`, e);
            supply = 0;
        }
        
        const { mintAuthority, freezeAuthority, updateAuthority } = safeParseAuthorities(asset.authorities);
        
        const onChainData = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || `${asset.id.slice(0, 4)}...`,
            logo: links.image || null,
            decimals,
            totalSupply: supply,
            holders: asset.ownership?.owner_count || 0,
            mintAuthority,
            freezeAuthority,
            updateAuthority,
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
        };

        // --- CoinGecko Data Processing ---
        let marketData: Partial<TokenDetails> = { pricePerToken: 0, marketCap: 0, volume24h: 0, price24hChange: 0, fdv: 0 };
        if (coingeckoResponse.ok) {
            const coingeckoJson = await coingeckoResponse.json();
            const cgData = coingeckoJson[mintAddress.toLowerCase()];
            if (cgData) {
                marketData = {
                    pricePerToken: cgData.usd || 0,
                    marketCap: cgData.usd_market_cap || 0,
                    volume24h: cgData.usd_24h_vol || 0,
                    price24hChange: cgData.usd_24h_change || 0,
                    fdv: calculateMarketCap(cgData.usd || 0, supply),
                };
            }
        } else {
             console.warn(`CoinGecko API call failed for ${mintAddress}. Market data will be incomplete.`);
        }
        
        if (!marketData.marketCap && marketData.pricePerToken && onChainData.totalSupply) {
            marketData.marketCap = calculateMarketCap(marketData.pricePerToken, onChainData.totalSupply);
        }
        
        // --- Mock Data ---
        const mockTxns = {
            h24: {
                buys: Math.floor(Math.random() * 2000) + 100,
                sells: Math.floor(Math.random() * 2000) + 100
            }
        };

        // --- Combine Data ---
        const responseData: Partial<TokenDetails> = {
            ...onChainData,
            ...marketData,
            txns: mockTxns,
        };

        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = MOCK_TOKEN_DETAILS[mockDetailsKey].description;
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "An unexpected server error occurred." });
    }
}
