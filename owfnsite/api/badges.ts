import type { ImpactBadge } from '../types.ts';

// Based on some logic (e.g., checking a database), determine which badges are unlocked.
// For this simulation, we'll use the stats from the user-stats mock.
const checkUnlockedStatus = (badgeId: string): boolean => {
    switch (badgeId) {
        case 'first_donor':
            return true; // donationCount > 0
        case 'health_hero':
            return true; // Mocked as true
        case 'active_voter':
            return true; // votedProposalIds.length >= 5
        default:
            return false;
    }
};


const ALL_BADGES: Omit<ImpactBadge, 'unlocked'>[] = [
    { id: 'first_donor', titleKey: 'badge_first_donor_title', descriptionKey: 'badge_first_donor_desc', icon: 'Heart' },
    { id: 'health_hero', titleKey: 'badge_health_hero_title', descriptionKey: 'badge_health_hero_desc', icon: 'HeartHandshake' },
    { id: 'active_voter', titleKey: 'badge_active_voter_title', descriptionKey: 'badge_active_voter_desc', icon: 'Vote' },
];


export default async function handler(req: any, res: any) {
    // In a real app, you would use the wallet query parameter to fetch data for a specific user.
    // const { wallet } = req.query;
    
    const userBadges = ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: checkUnlockedStatus(badge.id)
    }));

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));

    res.status(200).json(userBadges);
}
