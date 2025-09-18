import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, walletAddress, signature, ...data } = req.body;

        if (!type || !walletAddress || !signature) {
            return res.status(400).json({ error: 'Missing required fields: type, walletAddress, signature.' });
        }

        if (type === 'donation') {
            const { mintAddress, amount, usdValue, targetCaseId } = data;
            if (mintAddress === undefined || amount === undefined) {
                return res.status(400).json({ error: 'Missing donation fields: mintAddress, amount.' });
            }

            await sql`
                INSERT INTO Donations (
                    donor_wallet_address,
                    token_mint_address,
                    amount,
                    usd_value_at_time,
                    transaction_signature,
                    target_case_id
                ) VALUES (
                    ${walletAddress},
                    ${mintAddress},
                    ${amount},
                    ${usdValue || null},
                    ${signature},
                    ${targetCaseId || null}
                )
                ON CONFLICT (transaction_signature) DO NOTHING;
            `;

        } else if (type === 'vote') {
            // Future implementation for governance votes
            // const { proposalId, choice, power } = data;
            // await sql`INSERT INTO GovernanceVotes...`;
        } else {
            return res.status(400).json({ error: `Invalid activity type: ${type}` });
        }

        return res.status(200).json({ success: true, message: 'Activity recorded.' });

    } catch (error) {
        console.error('Error in /api/activity/record:', error);
        // We return 200 even on error because this is a non-critical, "fire-and-forget" API call from the frontend.
        // We don't want to show a scary error to the user if the transaction succeeded but the recording failed.
        // The error is logged on the server for debugging.
        return res.status(200).json({ success: false, message: 'Recording failed silently.' });
    }
}
