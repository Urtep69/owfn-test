import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import type { TokenDetails } from '../types.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const QUICKNODE_RPC_URL = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';
    const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');

    try {
        const mintPublicKey = new PublicKey(mintAddress);
        
        // Fetch on-chain data and market data in parallel
        const onChainDataPromise = getMint(connection, mintPublicKey);
        const marketDataPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
        
        const [onChainData, marketDataResponse] = await Promise.all([
            onChainDataPromise,
            marketDataPromise
        ]);

        // --- Start with On-Chain Data from getMint ---
        const responseData: Partial<TokenDetails> = {
            mintAddress: mintAddress,
            decimals: onChainData.decimals,
            totalSupply: Number(onChainData.supply) / (10 ** onChainData.decimals),
            mintAuthority: onChainData.mintAuthority?.toBase58() ?? null,
            freezeAuthority: onChainData.freezeAuthority?.toBase58() ?? null,
            tokenStandard: onChainData.tlvData ? 'Token-2022' : 'SPL Token',
        };

        // --- Add Market & Metadata from DexScreener ---
        if (marketDataResponse.ok) {
            const dexData = await marketDataResponse.json();
            if (dexData.pairs && dexData.pairs.length > 0) {
                // Find the pair with the most liquidity to use as the primary source
                const primaryPair = dexData.pairs.reduce((prev: any, current: any) => 
                    (prev.liquidity?.usd ?? 0) > (current.liquidity?.usd ?? 0) ? prev : current
                );

                // Populate metadata from DexScreener
                responseData.name = primaryPair.baseToken.name;
                responseData.symbol = primaryPair.baseToken.symbol;
                responseData.logo = primaryPair.info?.imageUrl || null;
                responseData.description = primaryPair.info?.description || null;
                const socials = primaryPair.info?.socials || [];
                responseData.links = {
                    website: primaryPair.info?.websites?.[0]?.url,
                    twitter: socials.find((s: any) => s.type === 'twitter')?.url,
                    telegram: socials.find((s: any) => s.type === 'telegram')?.url,
                    discord: socials.find((s: any) => s.type === 'discord')?.url,
                };
                
                // Populate market data
                responseData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
                responseData.marketCap = primaryPair.marketCap ?? 0;
                responseData.fdv = primaryPair.fdv ?? 0;
                responseData.volume24h = primaryPair.volume?.h24 || 0;
                responseData.price24hChange = primaryPair.priceChange?.h24 || 0;
                responseData.liquidity = primaryPair.liquidity?.usd || 0;
                responseData.pairAddress = primaryPair.pairAddress;
                responseData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
                responseData.txns = {
                    h24: {
                        buys: primaryPair.txns?.h24?.buys ?? 0,
                        sells: primaryPair.txns?.h24?.sells ?? 0
                    }
                };
                responseData.dexId = primaryPair.dexId;
            }
        } 
        
        // Ensure basic info exists even if DexScreener fails
        if (!responseData.name) responseData.name = 'Unknown Token';
        if (!responseData.symbol) responseData.symbol = mintAddress.substring(0, 4) + '...';


        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        
        // Provide a more specific error if the mint address is invalid
        if (errorMessage.includes("could not find account") || errorMessage.includes("Invalid public key")) {
             return res.status(404).json({ error: `Token not found or invalid mint address provided.` });
        }
        
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}
