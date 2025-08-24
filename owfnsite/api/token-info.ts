
import type { TokenDetails } from '../types.ts';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { QUICKNODE_RPC_URL } from '../constants.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
    const responseData: Partial<TokenDetails> = { mintAddress };

    try {
        // --- Step 1: Fetch comprehensive data from Birdeye API for metadata and price ---
        try {
            const birdeyeResponse = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`);
            if (birdeyeResponse.ok) {
                const apiData = await birdeyeResponse.json();
                if (apiData.success && apiData.data) {
                    const tokenData = apiData.data;
                    responseData.name = tokenData.name;
                    responseData.symbol = tokenData.symbol;
                    responseData.logo = tokenData.logoURI;
                    responseData.decimals = tokenData.decimals;
                    responseData.pricePerToken = tokenData.price || 0;
                    // Note: Birdeye doesn't provide a general description or extensive links.
                }
            } else {
                 console.warn(`Birdeye API for ${mintAddress} failed with status ${birdeyeResponse.status}`);
            }
        } catch (e) {
            console.warn(`Could not fetch metadata from Birdeye for ${mintAddress}:`, e);
        }

        // --- Step 2: Fetch on-chain data for definitive supply and authorities ---
        try {
            const mintPublicKey = new PublicKey(mintAddress);
            const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);
            
            if (accountInfo?.value) {
                const programOwner = accountInfo.value.owner.toBase58();
                if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'Token-2022';
                } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'SPL Token';
                }

                const info = (accountInfo.value.data as ParsedAccountData)?.parsed?.info;
                
                if (info && typeof info === 'object') {
                    if (typeof info.decimals === 'number') {
                        responseData.decimals = info.decimals; // On-chain data is the source of truth
                        if (info.supply) {
                            try {
                                const supplyBigInt = BigInt(info.supply);
                                const divisor = 10n ** BigInt(info.decimals);
                                responseData.totalSupply = Number(supplyBigInt) / Number(divisor);
                            } catch (parseError) {
                                responseData.totalSupply = 0;
                            }
                        }
                    }
                    responseData.mintAuthority = info.mintAuthority ?? null;
                    responseData.freezeAuthority = info.freezeAuthority ?? null;
                }
            }
        } catch(e) {
            console.warn(`Could not fetch on-chain account info for ${mintAddress}. Error:`, e);
        }
        
        // --- Final Cleanup & Response ---
        if (!responseData.name) responseData.name = 'Unknown Token';
        if (!responseData.symbol) responseData.symbol = `${mintAddress.slice(0,4)}...${mintAddress.slice(-4)}`;
        responseData.updateAuthority = null; // Assume null as it's not easily available

        // Check if we got any meaningful data at all.
        if (responseData.totalSupply === undefined && responseData.decimals === undefined) {
             return res.status(404).json({ error: `No data could be found for mint address: ${mintAddress}.` });
        }

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Server error: ${errorMessage}` });
    }
}
