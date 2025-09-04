import React from 'react';
import type { CommunityMessage } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';

const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '👎'];

interface MessageReactionsProps {
    chatId: string;
    message: CommunityMessage;
    isCurrentUser: boolean;
}

export default function MessageReactions({ chatId, message, isCurrentUser }: MessageReactionsProps) {
    const { solana, toggleMessageReaction } = useAppContext();

    if (!solana.address) return null;

    return (
        <div className={`flex items-center gap-1.5 mt-1.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {AVAILABLE_REACTIONS.map(emoji => {
                const reactionsForEmoji = message.reactions?.[emoji] || [];
                const userHasReacted = reactionsForEmoji.includes(solana.address!);
                const count = reactionsForEmoji.length;

                if (count === 0) return null;

                return (
                     <button
                        key={emoji}
                        onClick={() => toggleMessageReaction(chatId, message.id, emoji)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                            userHasReacted 
                                ? 'bg-accent-500/30 dark:bg-darkAccent-500/30 border border-accent-500 dark:border-darkAccent-400'
                                : 'bg-primary-200/70 dark:bg-darkPrimary-600/70 border border-transparent'
                        }`}
                     >
                        <span>{emoji}</span>
                        <span className="font-semibold">{count}</span>
                    </button>
                );
            })}
             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center bg-white dark:bg-darkPrimary-600 rounded-full shadow-sm p-0.5 border border-primary-200 dark:border-darkPrimary-500">
                    {AVAILABLE_REACTIONS.map(emoji => (
                         <button
                            key={`add-${emoji}`}
                            onClick={() => toggleMessageReaction(chatId, message.id, emoji)}
                            className="p-1 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-500 text-lg"
                         >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
