import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Vote, PlusCircle, CheckCircle, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { GovernanceProposal } from '../types.ts';

const Countdown = ({ endDate }: { endDate: Date }) => {
    const { t } = useAppContext();
    const calculateTimeLeft = () => {
        const difference = +endDate - +new Date();
        let timeLeft: {d: number, h: number, m: number} | {} = {};

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // update every minute
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft)
        .map(([interval, value]) => `${value}${interval}`);

    return <span>{timerComponents.length > 0 ? timerComponents.join(' ') : 'Ended'}</span>;
};

const ProposalCard = ({ proposal }: { proposal: GovernanceProposal }) => {
    const { t, solana, voteOnProposal: contextVote, currentLanguage } = useAppContext();
    const { address, userStats, loading, voteOnProposal: hookVote } = solana;
    
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
    const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
    
    const hasVoted = userStats.votedProposalIds.includes(proposal.id);

    const handleVote = async (vote: 'for' | 'against') => {
        const result = await hookVote(proposal.id, vote);
        if (result.success) {
            contextVote(proposal.id, vote);
            alert(t(result.messageKey));
        }
    }

    const getStatusChip = () => {
        switch(proposal.status) {
            case 'active': return <div className="bg-blue-500/20 text-blue-400 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">{t('status_active')}</div>;
            case 'passed': return <div className="bg-green-500/20 text-green-500 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full">{t('status_passed')}</div>;
            case 'failed': return <div className="bg-red-500/20 text-red-500 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-full">{t('status_failed')}</div>;
        }
    }

    const title = proposal.title[currentLanguage.code] || proposal.title['en'];
    const description = proposal.description[currentLanguage.code] || proposal.description['en'];

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-4">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{title}</h3>
                {getStatusChip()}
            </div>
            <p className="text-primary-600 dark:text-darkPrimary-400 text-sm">{description}</p>
            <div className="text-xs text-primary-500 dark:text-darkPrimary-500">Proposed by: <AddressDisplay address={proposal.proposer} /></div>
            
            <div className="space-y-2">
                <div className="w-full bg-primary-200 dark:bg-darkPrimary-700 rounded-full h-4 flex overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${forPercentage}%` }}></div>
                    <div className="bg-red-500 h-full" style={{ width: `${againstPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                    <span className="text-green-600 dark:text-green-400">{t('votes_for')}: {forPercentage.toFixed(2)}%</span>
                    <span className="text-red-600 dark:text-red-400">{t('votes_against')}: {againstPercentage.toFixed(2)}%</span>
                </div>
            </div>
            
            {proposal.status === 'active' && (
                <div className="flex justify-between items-center border-t border-primary-200 dark:border-darkPrimary-700 pt-4">
                    <div className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('ends_in')}: <Countdown endDate={proposal.endDate} /></div>
                    {address && (
                        hasVoted ? (
                             <div className="flex items-center gap-2 text-accent-600 dark:text-darkAccent-500 font-bold"><CheckCircle size={16}/> {t('you_voted')}</div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => handleVote('for')} disabled={loading} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"><ThumbsUp size={16}/></button>
                                <button onClick={() => handleVote('against')} disabled={loading} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50"><ThumbsDown size={16}/></button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default function Governance() {
    const { t, proposals, addProposal, solana } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    
    const activeProposals = useMemo(() => proposals.filter(p => p.status === 'active'), [proposals]);
    const pastProposals = useMemo(() => proposals.filter(p => p.status !== 'active'), [proposals]);
    
    // Create Proposal Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newDescription) return;
        setIsSubmitting(true);
        const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
        try {
            await addProposal({ title: newTitle, description: newDescription, endDate });
            setNewTitle('');
            setNewDescription('');
            setCreateModalOpen(false);
        } catch (error) {
            console.error("Failed to create proposal:", error);
            // Optionally show an error to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('governance_title')}</h1>
                    <p className="mt-2 text-lg text-primary-600 dark:text-darkPrimary-400">{t('governance_subtitle')}</p>
                </div>
                {solana.connected && (
                    <button 
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors"
                    >
                        <PlusCircle size={20} /> {t('create_proposal')}
                    </button>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">{t('active_proposals')}</h2>
                {activeProposals.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {activeProposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
                    </div>
                ) : (
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_active_proposals')}</p> 
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">{t('past_proposals')}</h2>
                {pastProposals.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {pastProposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
                    </div>
                ) : (
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_past_proposals')}</p>
                )}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-xl p-8 w-full max-w-2xl relative animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                        <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-primary-500 hover:text-primary-800 dark:text-darkPrimary-400 dark:hover:text-darkPrimary-100">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">{t('create_proposal')}</h2>
                        <form onSubmit={handleCreateProposal} className="space-y-4">
                            <div>
                                <label htmlFor="prop-title" className="block text-sm font-medium mb-1">{t('proposal_title')}</label>
                                <input
                                    id="prop-title"
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                    className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="prop-desc" className="block text-sm font-medium mb-1">{t('proposal_description')}</label>
                                <textarea
                                    id="prop-desc"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    required
                                    rows={5}
                                    className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 py-3 rounded-lg font-bold hover:bg-accent-500 dark:hover:bg-darkAccent-600 disabled:opacity-50"
                            >
                                {isSubmitting ? t('processing') : t('submit_proposal')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
