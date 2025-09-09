import { sql } from '@vercel/postgres';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { GoogleGenAI } from "@google/genai";
import { SUPPORTED_LANGUAGES } from '../lib/api-constants.ts';

async function verifySignature(publicKey: string, signature: string, signedMessage: string): Promise<boolean> {
    try {
        const messageBytes = new TextEncoder().encode(signedMessage);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = Buffer.from(signature, 'base64');
        return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (e) {
        console.error("Signature verification failed:", e);
        return false;
    }
}

async function handleGet(req: any, res: any) {
    const { walletAddress } = req.query;

    if (walletAddress) {
        // Get votes for a specific user
        try {
            const { rows } = await sql`SELECT proposal_id FROM governance_votes WHERE voter_address = ${walletAddress};`;
            const votedProposalIds = rows.map(r => String(r.proposal_id));
            return res.status(200).json({ votedProposalIds });
        } catch (error) {
            console.error('Error fetching user votes:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Get all proposals
        try {
            const { rows } = await sql`
                SELECT id, proposer_address, title, description, start_date, end_date, status, votes_for, votes_against 
                FROM governance_proposals ORDER BY start_date DESC;`;
            // Convert numeric vote counts from string to number
            const proposals = rows.map(p => ({
                ...p,
                votes_for: Number(p.votes_for),
                votes_against: Number(p.votes_against)
            }));
            return res.status(200).json({ proposals });
        } catch (error) {
            console.error('Error fetching proposals:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

async function handlePost(req: any, res: any) {
    const { action } = req.body;

    switch (action) {
        case 'create':
            return await createProposal(req, res);
        case 'vote':
            return await castVote(req, res);
        default:
            return res.status(400).json({ error: 'Invalid action.' });
    }
}

async function createProposal(req: any, res: any) {
    const { proposerAddress, title, description, signature, signedMessage } = req.body;
    
    if (!proposerAddress || !title || !description || !signature || !signedMessage) {
        return res.status(400).json({ error: 'Missing required fields for creating a proposal.' });
    }
    
    if (!await verifySignature(proposerAddress, signature, signedMessage)) {
        return res.status(403).json({ error: 'Invalid signature.' });
    }
    
    const geminiApiKey = process.env.API_KEY;
    if (!geminiApiKey) {
        console.error("API_KEY (for Gemini) is not configured for translations.");
    }

    try {
        const titleTranslations: Record<string, string> = { en: title };
        const descriptionTranslations: Record<string, string> = { en: description };

        if (geminiApiKey) {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const languagesToTranslate = SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en');

            const translate = async (text: string, targetLanguage: string): Promise<string> => {
                if (!text || !text.trim()) return text;
                try {
                    const systemInstruction = `You are a highly skilled translator. Translate the following text into ${targetLanguage}. Respond with ONLY the translated text.`;
                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: text,
                        config: { systemInstruction, temperature: 0.2, thinkingConfig: { thinkingBudget: 0 } }
                    });
                    const translated = response.text;
                    return translated.trim() || text;
                } catch (e) {
                    console.error(`Translation to ${targetLanguage} failed`, e);
                    return text; // Fallback to original text
                }
            };
            
            for (const lang of languagesToTranslate) {
                titleTranslations[lang.code] = await translate(title, lang.name);
                descriptionTranslations[lang.code] = await translate(description, lang.name);
            }
        } else {
             console.warn("API_KEY not set, skipping translations for new proposal.");
        }


        const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
        
        const { rows } = await sql`
            INSERT INTO governance_proposals (proposer_address, title, description, end_date)
            VALUES (${proposerAddress}, ${JSON.stringify(titleTranslations)}, ${JSON.stringify(descriptionTranslations)}, ${endDate.toISOString()})
            RETURNING id, proposer_address, title, description, start_date, end_date, status, votes_for, votes_against;
        `;
        const newProposal = {
            ...rows[0],
            votes_for: Number(rows[0].votes_for),
            votes_against: Number(rows[0].votes_against)
        };

        return res.status(201).json({ success: true, newProposal });

    } catch (error) {
        console.error('Error creating proposal:', error);
        return res.status(500).json({ error: 'Failed to create proposal.' });
    }
}

async function castVote(req: any, res: any) {
    const { proposalId, voterAddress, choice, signature, signedMessage } = req.body;

    if (!proposalId || !voterAddress || !choice || !signature || !signedMessage || !['for', 'against'].includes(choice)) {
        return res.status(400).json({ error: 'Missing or invalid fields for voting.' });
    }
    
    if (!await verifySignature(voterAddress, signature, signedMessage)) {
        return res.status(403).json({ error: 'Invalid signature.' });
    }

    try {
        await sql`
            INSERT INTO governance_votes (proposal_id, voter_address, vote_choice)
            VALUES (${proposalId}, ${voterAddress}, ${choice});
        `;

        const updateColumn = choice === 'for' ? 'votes_for' : 'votes_against';
        const { rows } = await sql.query(
            `UPDATE governance_proposals SET ${updateColumn} = ${updateColumn} + 1 WHERE id = $1
            RETURNING id, proposer_address, title, description, start_date, end_date, status, votes_for, votes_against;`,
            [proposalId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Proposal not found.' });
        }
        const updatedProposal = {
            ...rows[0],
            votes_for: Number(rows[0].votes_for),
            votes_against: Number(rows[0].votes_against)
        };

        return res.status(200).json({ success: true, updatedProposal });

    } catch (error: any) {
        console.error('Error casting vote:', error);
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ error: 'You have already voted on this proposal.' });
        }
        return res.status(500).json({ error: 'Failed to cast vote.' });
    }
}


export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        return await handleGet(req, res);
    } else if (req.method === 'POST') {
        return await handlePost(req, res);
    } else {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}