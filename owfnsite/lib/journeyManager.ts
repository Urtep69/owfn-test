import type { JourneyAction, JourneyItem } from './types.js';

const JOURNEY_STORAGE_KEY = 'owfn-journey-progress';

export const ALL_JOURNEY_ITEMS: JourneyItem[] = [
    { id: 'walletConnected', titleKey: 'journey_wallet_connected' },
    { id: 'readAbout', titleKey: 'journey_read_about' },
    { id: 'readWhitepaper', titleKey: 'journey_read_whitepaper' },
    { id: 'madePurchase', titleKey: 'journey_made_purchase' },
    { id: 'madeDonation', titleKey: 'journey_made_donation' },
];

export const getCompletedActions = (): JourneyAction[] => {
    try {
        const stored = window.localStorage.getItem(JOURNEY_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn("Could not read journey progress from localStorage", error);
    }
    return [];
};

export const markJourneyAction = (action: JourneyAction) => {
    try {
        const completed = getCompletedActions();
        if (!completed.includes(action)) {
            const updated = [...completed, action];
            window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(updated));
            // Dispatch a custom event to notify other components of the change
            window.dispatchEvent(new CustomEvent('journeyActionCompleted'));
        }
    } catch (error) {
        console.warn("Could not save journey progress to localStorage", error);
    }
};
