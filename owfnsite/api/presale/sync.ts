import { sql } from '../../lib/db.js';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ConfirmedSignatureInfo } from '@solana/web3.js';
import { PRESALE_STAGES, QUICKNODE_RPC_URL, TOKEN_DETAILS } from '../../lib/constants.js';

// This is a special, admin-only endpoint designed to be run ONCE to populate the DB.
// It can take a long time to run. On Vercel Hobby, it might time out (10s limit).
// On Vercel Pro, the limit is higher (can be configured up to 5 mins).

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const currentStage = PRESALE_STAGES[0];
        const presalePublicKey = new PublicKey(currentStage.distributionWallet);
        const presaleStartTimestamp = Math.floor(new Date(currentStage.startDate).getTime() / 1000);

        let allSignatures: ConfirmedSignatureInfo[] = [];
        let lastSignature: string | undefined;

        // Fetch all signatures for the address since the beginning of time
        while(true) {
            const signaturesBatch = await connection.getSignaturesForAddress(presalePublicKey, {
                limit: 1000,
                before: lastSignature,
            });
            if (signaturesBatch.length === 0) {
                break;
            }
            allSignatures.push(...signaturesBatch);
            lastSignature = signaturesBatch[signaturesBatch.length - 1]?.signature;
        }

        const relevantSignatures = allSignatures.filter(sig => sig.blockTime && sig.blockTime >= presaleStartTimestamp);
        const signatureStrings = relevantSignatures.map(s => s.signature);

        if (signatureStrings.length === 0) {
            return res.status(200).json({ message: 'No relevant transactions found to sync.' });
        }

        const presaleRateBigInt = BigInt(currentStage.rate);
        const owfnDecimalsMultiplier = 10n ** BigInt(TOKEN_DETAILS.decimals);
        const sortedTiers = [...currentStage.bonusTiers].sort((a, b) => b.threshold - a.threshold);

        let transactionsProcessed = 0;
        const BATCH_SIZE = 50; // Smaller batch for processing
        
        for (let i = 0; i < signatureStrings.length; i += BATCH_SIZE) {
            const batchSignatures = signatureStrings.slice(i, i + BATCH_SIZE);
            const transactionsData = await connection.getParsedTransactions(batchSignatures, { maxSupportedTransactionVersion: 0 });

            for (const tx of transactionsData) {
                if (tx && tx.blockTime) {
                    for (const inst of tx.transaction.message.instructions) {
                        if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === currentStage.distributionWallet) {
                            
                            const solAmount = inst.parsed.info.lamports / 1e9;
                            const lamportsBigInt = BigInt(inst.parsed.info.lamports);
                            
                            const baseOwfn = (lamportsBigInt * presaleRateBigInt * owfnDecimalsMultiplier) / BigInt(1e9);
                            
                            const applicableTier = sortedTiers.find(tier => solAmount >= tier.threshold);
                            let bonusOwfn = 0n;
                            if (applicableTier) {
                                bonusOwfn = (baseOwfn * BigInt(applicableTier.percentage)) / 100n;
                            }
                            
                            const totalOwfn = baseOwfn + bonusOwfn;
                            
                            const totalOwfnString = (Number(totalOwfn) / Number(owfnDecimalsMultiplier)).toFixed(TOKEN_DETAILS.decimals);
                            
                            await sql`
                                INSERT INTO PresaleContributions (
                                    buyer_wallet_address,
                                    sol_amount,
                                    owfn_received_with_bonus,
                                    transaction_signature,
                                    "timestamp"
                                ) VALUES (
                                    ${inst.parsed.info.source},
                                    ${solAmount.toFixed(9)},
                                    ${totalOwfnString},
                                    ${tx.transaction.signatures[0]},
                                    to_timestamp(${tx.blockTime})
                                )
                                ON CONFLICT (transaction_signature) DO NOTHING;
                            `;
                            transactionsProcessed++;
                        }
                    }
                }
            }
        }

        return res.status(200).json({
            message: `Sync complete. Found ${relevantSignatures.length} relevant signatures and processed ${transactionsProcessed} presale transactions.`,
        });

    } catch (error: any) {
        console.error('Error in /api/presale/sync:', error);
        return res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
}
