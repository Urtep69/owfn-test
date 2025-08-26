import { useState, useCallback, useEffect } from 'react';
import type { Poll } from '../types.ts';

// Structure for storing votes: { pollId: 'optionId' }
type VoteStore = Record<string, string>;
// Structure for storing vote counts: { pollId: { optionId: count } }
type VoteCountStore = Record<string, Record<string, number>>;

const USER_VOTES_KEY = 'owfn-user-votes';
const POLL_RESULTS_KEY = 'owfn-poll-results';

export const usePolls = (initialPolls: Poll[]) => {
    // Stores which option the current user has voted for on each poll
    const [userVotes, setUserVotes] = useState<VoteStore>(() => {
        try {
            const stored = window.localStorage.getItem(USER_VOTES_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) { return {}; }
    });

    // Stores the aggregated vote counts for all polls (simulating a backend)
    const [pollResults, setPollResults] = useState<VoteCountStore>(() => {
        try {
            const stored = window.localStorage.getItem(POLL_RESULTS_KEY);
            if (stored) return JSON.parse(stored);
            
            // Initialize with random-ish data for demonstration
            const initialResults: VoteCountStore = {};
            initialPolls.forEach(poll => {
                initialResults[poll.id] = {};
                poll.options.forEach((opt) => {
                    initialResults[poll.id][opt.id] = Math.floor(Math.random() * 200) + 50;
                });
            });
            return initialResults;
        } catch (e) { return {}; }
    });

    useEffect(() => {
        window.localStorage.setItem(USER_VOTES_KEY, JSON.stringify(userVotes));
    }, [userVotes]);

    useEffect(() => {
        window.localStorage.setItem(POLL_RESULTS_KEY, JSON.stringify(pollResults));
    }, [pollResults]);

    const castVote = useCallback((pollId: string, optionId: string) => {
        // User cannot vote twice
        if (userVotes[pollId]) return;

        // Update user's vote
        setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
        
        // Update total results
        setPollResults(prev => {
            const newResults = JSON.parse(JSON.stringify(prev));
            if (!newResults[pollId]) {
                newResults[pollId] = {};
            }
            if (!newResults[pollId][optionId]) {
                newResults[pollId][optionId] = 0;
            }
            newResults[pollId][optionId]++;
            return newResults;
        });
    }, [userVotes]);
    
    const getUserVoteForPoll = useCallback((pollId: string): string | null => {
        return userVotes[pollId] || null;
    }, [userVotes]);

    const getPollResults = useCallback((pollId: string) => {
        return pollResults[pollId] || {};
    }, [pollResults]);

    return { castVote, getUserVoteForPoll, getPollResults };
};