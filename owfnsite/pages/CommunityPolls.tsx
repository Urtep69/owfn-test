import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { PollCard } from '../components/PollCard.tsx';
import { BarChartHorizontal } from 'lucide-react';

export default function CommunityPolls() {
    const { t, polls, solana } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <BarChartHorizontal className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('community_polls')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('community_polls_subtitle')}
                </p>
            </div>
            
            {!solana.connected && (
                <div className="text-center p-8 bg-white dark:bg-darkPrimary-800/50 rounded-lg shadow-inner-3d">
                    <p className="font-semibold text-lg">{t('connect_wallet_to_vote')}</p>
                    <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connect_wallet_to_vote_desc')}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {polls.map(poll => (
                    <PollCard key={poll.id} poll={poll} />
                ))}
            </div>
        </div>
    );
}