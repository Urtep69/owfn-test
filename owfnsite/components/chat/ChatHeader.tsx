import React, { useState, useMemo } from 'react';
import type { ChatConversation, CommunityMessage } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Hash, User, Bot, Loader2, Pin, X, Settings, Megaphone } from 'lucide-react';

async function summarizeChat(messages: CommunityMessage[]): Promise<string> {
    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
        });
        if (!response.ok) return "Rezumatul nu a putut fi generat.";
        const data = await response.json();
        return data.summary || "Nu s-a putut genera un rezumat.";
    } catch (error) {
        console.error("Summarization API call failed:", error);
        return "Eroare la generarea rezumatului.";
    }
}


export default function ChatHeader({ chat }: { chat: ChatConversation }) {
    const { communityUsers, solana, openGroupSettingsModal, pinMessage, t } = useAppContext();
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string|null>(null);

    const getDmInfo = () => {
        if (chat.type !== 'dm' || !solana.address) return { name: 'Unknown', isOnline: false };
        const otherUserId = chat.participants.find(p => p !== solana.address);
        const otherUser = communityUsers.find(u => u.id === otherUserId);
        return {
            name: otherUser?.username ?? 'Unknown User',
            isOnline: otherUser?.isOnline ?? false,
        };
    };

    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummary(null);
        const result = await summarizeChat(chat.messages.slice(-20)); // Summarize last 20 messages
        setSummary(result);
        setIsSummarizing(false);
    }
    
    const pinnedMessage = useMemo(() => {
        if (!chat.pinnedMessageId) return null;
        return chat.messages.find(m => m.id === chat.pinnedMessageId);
    }, [chat.pinnedMessageId, chat.messages]);

    const pinnedMessageSender = communityUsers.find(u => u.id === pinnedMessage?.senderId);

    const info = chat.type === 'dm' ? getDmInfo() : { name: chat.name };
    
    const isOwner = chat.ownerId === solana.address;

    return (
        <div className="flex-shrink-0 flex flex-col border-b border-primary-200 dark:border-darkPrimary-700">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                     <div className="relative">
                        <div className="w-10 h-10 bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center rounded-full">
                            {chat.type === 'group' && <Hash className="text-primary-500 dark:text-darkPrimary-400"/>}
                            {chat.type === 'channel' && <Megaphone className="text-primary-500 dark:text-darkPrimary-400"/>}
                            {chat.type === 'dm' && <User className="text-primary-500 dark:text-darkPrimary-400"/>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">{info.name}</h2>
                         {chat.type === 'dm' && 'isOnline' in info && <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{info.isOnline ? 'Online' : 'Offline'}</p>}
                         {(chat.type === 'group' || chat.type === 'channel') && <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{chat.participants.length} {t('community_members')}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={handleSummarize} 
                        disabled={isSummarizing || chat.messages.length < 2}
                        className="flex items-center gap-2 text-xs font-semibold p-2 rounded-lg bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 disabled:opacity-50"
                        title="Summarize recent messages"
                     >
                        {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                        <span className="hidden sm:inline">{t('community_summarize')}</span>
                     </button>
                     {isOwner && (
                        <button 
                            onClick={openGroupSettingsModal}
                            className="flex items-center gap-2 text-xs font-semibold p-2 rounded-lg bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700"
                        >
                            <Settings size={14} />
                        </button>
                     )}
                     {summary && (
                         <div className="absolute right-4 top-16 mt-2 w-72 bg-white dark:bg-darkPrimary-800 p-3 rounded-lg shadow-lg z-10 border border-primary-200 dark:border-darkPrimary-600">
                            <p className="text-xs font-bold mb-1">{t('community_ai_summary_title')}</p>
                            <p className="text-xs text-primary-700 dark:text-darkPrimary-300">{summary}</p>
                            <button onClick={() => setSummary(null)} className="text-xs font-bold mt-2 text-accent-600 dark:text-darkAccent-400">{t('community_close')}</button>
                         </div>
                     )}
                </div>
            </div>
             {pinnedMessage && (
                <div className="p-2.5 bg-primary-100/70 dark:bg-darkPrimary-800/70 border-t border-primary-200 dark:border-darkPrimary-700 flex items-center justify-between gap-2 animate-fade-in-up" style={{animationDuration: '300ms'}}>
                    <div className="flex items-center gap-2 min-w-0">
                        <Pin size={14} className="text-primary-500 dark:text-darkPrimary-400 flex-shrink-0" />
                        <div className="text-sm min-w-0">
                             <p className="font-bold text-accent-600 dark:text-darkAccent-400 text-xs">{pinnedMessageSender?.username || 'Utilizator'}</p>
                             <p className="truncate text-primary-700 dark:text-darkPrimary-300">{pinnedMessage.content}</p>
                        </div>
                    </div>
                    {isOwner && (
                         <button onClick={() => pinMessage(chat.id, '')} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full flex-shrink-0">
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}