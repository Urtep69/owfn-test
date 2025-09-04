import React, { useState } from 'react';
import type { ChatConversation, CommunityMessage } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Hash, User, Bot, Loader2 } from 'lucide-react';

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
    const { communityUsers, solana } = useAppContext();
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

    const info = chat.type === 'group' ? { name: chat.name } : getDmInfo();

    return (
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-primary-200 dark:border-darkPrimary-700">
            <div className="flex items-center space-x-3">
                 <div className="relative">
                    {chat.type === 'group' ? (
                        <div className="w-10 h-10 bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center rounded-full">
                            <Hash className="text-primary-500 dark:text-darkPrimary-400"/>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center">
                            <User className="text-primary-500 dark:text-darkPrimary-400"/>
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">{info.name}</h2>
                    {/* FIX: The `info` object is a union type, and the 'group' type doesn't have `isOnline`. The `in` operator acts as a type guard to ensure `isOnline` exists before it's accessed, satisfying TypeScript's type checker. */}
                    {chat.type === 'dm' && 'isOnline' in info && <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{info.isOnline ? 'Online' : 'Offline'}</p>}
                </div>
            </div>
            <div>
                 <button 
                    onClick={handleSummarize} 
                    disabled={isSummarizing || chat.messages.length < 2}
                    className="flex items-center gap-2 text-xs font-semibold p-2 rounded-lg bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 disabled:opacity-50"
                    title="Summarize recent messages"
                 >
                    {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                    <span>Rezumă</span>
                 </button>
                 {summary && (
                     <div className="absolute right-4 top-16 mt-2 w-72 bg-white dark:bg-darkPrimary-800 p-3 rounded-lg shadow-lg z-10 border border-primary-200 dark:border-darkPrimary-600">
                        <p className="text-xs font-bold mb-1">Rezumat AI:</p>
                        <p className="text-xs text-primary-700 dark:text-darkPrimary-300">{summary}</p>
                        <button onClick={() => setSummary(null)} className="text-xs font-bold mt-2 text-accent-600 dark:text-darkAccent-400">Închide</button>
                     </div>
                 )}
            </div>
        </header>
    );
}