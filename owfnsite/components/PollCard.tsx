import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { Poll, PollOption } from '../types.ts';
import { CheckCircle, Clock } from 'lucide-react';

interface PollCardProps {
    poll: Poll;
}

export const PollCard: React.FC<PollCardProps> = ({ poll }) => {
    const { t, pollController, currentLanguage, solana } = useAppContext();
    const { castVote, getUserVoteForPoll, getPollResults } = pollController;

    const userVote = getUserVoteForPoll(poll.id);
    const results = getPollResults(poll.id);
    
    const totalVotes = useMemo(() => {
        return Object.values(results).reduce((sum, count) => sum + count, 0);
    }, [results]);

    const isPollActive = new Date() < poll.endDate;

    return (
        <div className="bg-white dark:bg-darkPrimary-800 rounded-2xl shadow-3d overflow-hidden">
            <div className="p-6 border-b border-primary-200 dark:border-darkPrimary-700">
                <h3 className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">
                    {poll.question[currentLanguage.code] || poll.question['en']}
                </h3>
                <div className="flex items-center gap-2 text-xs text-primary-500 dark:text-darkPrimary-400 mt-2">
                    <Clock size={14} />
                    <span>
                         {isPollActive 
                            ? `${t('ends_in')} ${poll.endDate.toLocaleDateString(currentLanguage.code)}`
                            : t('poll_ended')}
                    </span>
                </div>
            </div>
            <div className="p-6 space-y-3">
                {poll.options.map((option) => {
                    const optionText = option.text[currentLanguage.code] || option.text['en'];
                    const votesForOption = results[option.id] || 0;
                    const percentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;
                    const hasVotedForThis = userVote === option.id;

                    if (userVote || !isPollActive) {
                        // Show results
                        return (
                            <div key={option.id} className="relative">
                                <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                    <div className="flex items-center gap-2">
                                        <span>{optionText}</span>
                                        {hasVotedForThis && <CheckCircle size={16} className="text-accent-500 dark:text-darkAccent-400" />}
                                    </div>
                                    <span className="text-primary-800 dark:text-darkPrimary-200">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-primary-200 dark:bg-darkPrimary-700 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-accent-400 to-accent-500 dark:from-darkAccent-500 dark:to-darkAccent-600 h-3 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    } else {
                        // Show voting buttons
                        return (
                             <button
                                key={option.id}
                                onClick={() => solana.connected ? castVote(poll.id, option.id) : alert(t('connect_wallet_first'))}
                                disabled={!solana.connected}
                                className="w-full text-left p-3 rounded-lg font-semibold bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {optionText}
                            </button>
                        );
                    }
                })}
            </div>
            <div className="p-4 bg-primary-50 dark:bg-darkPrimary-800/50 border-t border-primary-200 dark:border-darkPrimary-700 text-center text-sm text-primary-600 dark:text-darkPrimary-400">
                {userVote ? t('you_have_voted') : (isPollActive && !solana.connected ? t('connect_wallet_to_vote') : `${totalVotes.toLocaleString()} ${t('votes_cast').toLowerCase()}`)}
            </div>
        </div>
    );
};