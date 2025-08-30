import type { UserStats } from '../types.ts';

const MOCK_USER_STATS: UserStats = { 
    totalDonatedUSD: 125.50,
    causesSupported: 3,
    donationCount: 8,
    votedProposalIds: ['prop1', 'prop2', 'prop3', 'prop4', 'prop5']
};

export default async function handler(req: any, res: any) {
    // In a real app, you would use the wallet query parameter to fetch data for a specific user.
    // const { wallet } = req.query;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.status(200).json(MOCK_USER_STATS);
}
