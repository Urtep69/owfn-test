import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
// FIX: Imported the 'Info' icon component from lucide-react to resolve a 'Cannot find name' error.
import { Wallet, CheckCircle, XCircle, Gift, Loader2, Twitter, Send, Repeat, Info } from 'lucide-react';
import { DiscordIcon } from '../components/IconComponents.js';
import { PROJECT_LINKS } from '../lib/constants.js';

interface Task {
    id: string;
    textKey: string;
    icon: React.ReactNode;
    href: string;
}

const AirdropTask = ({ task, isChecked, onToggle }: { task: Task; isChecked: boolean; onToggle: (id: string) => void; }) => {
    const { t } = useAppContext();
    return (
        <a 
            href={task.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); onToggle(task.id); window.open(task.href, '_blank'); }}
            className="flex items-center justify-between p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg shadow-sm hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 text-primary-600 dark:text-darkPrimary-400 group-hover:text-accent-500 dark:group-hover:text-darkAccent-400`}>
                    {task.icon}
                </div>
                <span className="font-semibold text-primary-800 dark:text-darkPrimary-200">{t(task.textKey)}</span>
            </div>
            <div 
                 className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? 'bg-green-500 border-green-500' : 'bg-transparent border-primary-300 dark:border-darkPrimary-600 group-hover:border-accent-400 dark:group-hover:border-darkAccent-500'}`}
            >
                {isChecked && <CheckCircle className="w-5 h-5 text-white" />}
            </div>
        </a>
    );
};


export default function Airdrop() {
    const { t, solana, setWalletModalOpen, showNotification } = useAppContext();
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_registered' | 'error'>('idle');

    const tasks: Task[] = [
        { id: 'follow_x', textKey: 'airdrop_task_follow_x', icon: <Twitter size={24} />, href: PROJECT_LINKS.x },
        { id: 'join_telegram', textKey: 'airdrop_task_join_telegram', icon: <Send size={24} />, href: PROJECT_LINKS.telegramGroup },
        { id: 'join_discord', textKey: 'airdrop_task_join_discord', icon: <DiscordIcon className="w-6 h-6" />, href: PROJECT_LINKS.discord },
        { id: 'retweet', textKey: 'airdrop_task_retweet', icon: <Repeat size={24} />, href: PROJECT_LINKS.airdropTweet },
    ];

    const allTasksCompleted = checkedTasks.size === tasks.length;

    const handleToggleTask = (taskId: string) => {
        setCheckedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                // This logic can be removed if we don't want to allow unchecking
                // newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleRegister = async () => {
        if (!solana.connected || !solana.address) {
            setWalletModalOpen(true);
            return;
        }

        if (!allTasksCompleted) {
            showNotification({
                status: 'error',
                title: t('airdrop_tasks_incomplete_title'),
                messages: [t('airdrop_tasks_incomplete_desc')],
            });
            return;
        }

        setStatus('loading');
        try {
            const response = await fetch('/api/airdrop-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: solana.address }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
            } else if (response.status === 409) {
                setStatus('already_registered');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error("Airdrop registration failed:", err);
            setStatus('error');
        }
    };
    
    const renderStatusMessage = () => {
        switch(status) {
            case 'success':
                return (
                    <div className="text-center p-8 bg-green-500/10 dark:bg-green-500/20 rounded-lg animate-fade-in-up">
                        <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{t('airdrop_success_title')}</h3>
                        <p className="text-primary-700 dark:text-darkPrimary-300 mt-2">{t('airdrop_success_desc')}</p>
                    </div>
                );
            case 'already_registered':
                 return (
                    <div className="text-center p-8 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg animate-fade-in-up">
                        <Info className="mx-auto w-16 h-16 text-blue-500 mb-4" />
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{t('airdrop_registered_title')}</h3>
                        <p className="text-primary-700 dark:text-darkPrimary-300 mt-2">{t('airdrop_registered_desc')}</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8 bg-red-500/10 dark:bg-red-500/20 rounded-lg animate-fade-in-up">
                        <XCircle className="mx-auto w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">{t('airdrop_error_title')}</h3>
                        <p className="text-primary-700 dark:text-darkPrimary-300 mt-2">{t('airdrop_error_desc')}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <Gift className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('airdrop_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('airdrop_page_subtitle')}
                </p>
            </div>
            
            <div className="max-w-xl mx-auto bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d-lg">
                {/* FIX: Adjusted the conditional rendering logic. The form should remain visible during the 'loading' state to show the loading spinner on the button. This resolves incorrect type comparison errors. */}
                {status !== 'idle' && status !== 'loading' ? renderStatusMessage() : (
                    <>
                        <h2 className="text-2xl font-bold mb-2 text-center">{t('airdrop_join_title')}</h2>
                        <p className="text-primary-600 dark:text-darkPrimary-400 mb-6 text-center">{t('airdrop_join_desc')}</p>

                        <div className="space-y-4 mb-8">
                            {tasks.map(task => (
                                <AirdropTask 
                                    key={task.id}
                                    task={task}
                                    isChecked={checkedTasks.has(task.id)}
                                    onToggle={handleToggleTask}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={status === 'loading' || !allTasksCompleted}
                            className="w-full flex items-center justify-center gap-2 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? <Loader2 className="animate-spin" /> : <Gift size={22} />}
                            {solana.connected ? t('airdrop_register_button') : t('connect_wallet')}
                        </button>
                    </>
                )}
            </div>

            <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d border border-primary-200/50 dark:border-darkPrimary-700/50">
                <h3 className="text-xl font-bold mb-2">{t('airdrop_rules_title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-primary-600 dark:text-darkPrimary-400 text-sm">
                    <li>{t('airdrop_rule_1')}</li>
                    <li>{t('airdrop_rule_2')}</li>
                    <li>{t('airdrop_rule_3')}</li>
                    <li>{t('airdrop_rule_4')}</li>
                </ul>
            </div>
        </div>
    );
}