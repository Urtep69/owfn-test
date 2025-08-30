import type { LeaderboardEntry } from '../types.ts';

// Mock data simulating a fetch from a database
const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
    { rank: 1, address: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy', totalDonatedUSD: 15230.75 },
    { rank: 2, address: 'So11111111111111111111111111111111111111112', totalDonatedUSD: 12105.50 },
    { rank: 3, address: 'G2U5hNBc6s1Y4W1n6W2b3X9Y7c1Z5t2eR8v3P6y4D1oA', totalDonatedUSD: 9876.21 },
    { rank: 4, address: 'Fp3zQ5b9j6s2d1K8a7w4oE6v9U2i1N7pG8c3X5b2A4d1', totalDonatedUSD: 8543.90 },
    { rank: 5, address: '9Hj7kL4m1n2p3o5r6s8t9u1v2w3x4y5z6a7b8c9d0e1f', totalDonatedUSD: 7210.00 },
    { rank: 6, address: 'C1a2b3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', totalDonatedUSD: 6500.88 },
    { rank: 7, address: 'X9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8', totalDonatedUSD: 5123.45 },
    { rank: 8, address: 'L6k5j4i3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6q5', totalDonatedUSD: 4987.12 },
    { rank: 9, address: 'P0o9i8u7y6t5r4e3w2q1a2s3d4f5g6h7j8k9l0m1n2b3', totalDonatedUSD: 3201.00 },
    { rank: 10, address: 'M5n4b3v2c1x0z9a8s7d6f5g4h3j2k1l0p9o8i7u6y5t4', totalDonatedUSD: 2500.00 },
];

export default async function handler(req: any, res: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real application, you would query your database here based on the `period` query parameter
    // const { period } = req.query; 

    res.status(200).json(MOCK_LEADERBOARD_DATA);
}
