import React, { useState } from 'react';
import type { CommunityMessage } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { translateText } from '../../services/geminiService.ts';
import { Languages, Loader2 } from 'lucide-react';
import MessageReactions from './MessageReactions.tsx';

interface ChatMessageProps {
    message: CommunityMessage;
    chatId: string;
    onAvatarClick: () => void;
}

export default function ChatMessage({ message, chatId, onAvatarClick }: ChatMessageProps) {
    const { communityUsers, solana, t } = useAppContext();
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const sender = communityUsers.find(u => u.id === message.senderId);
    const isCurrentUser = message.senderId === solana.address;

    const handleTranslate = async () => {
        setIsTranslating(true);
        const result = await translateText(message.content, 'English');
        setTranslatedText(result);
        setIsTranslating(false);
    }

    if (!sender) {
        return null; // Don't render if sender info is not found
    }

    const messageDate = new Date(message.timestamp);
    const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex items-start gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <button onClick={onAvatarClick} className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full">
                 <img src={sender.avatar} alt={sender.username} className="w-10 h-10 rounded-full" />
            </button>
            <div className={`group relative flex flex-col gap-1 max-w-lg ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-3">
                    {!isCurrentUser && 
                        <button onClick={onAvatarClick} className="font-bold text-sm text-primary-800 dark:text-darkPrimary-200 hover:underline">
                            {sender.username}
                        </button>
                    }
                    <span className="text-xs text-primary-400 dark:text-darkPrimary-500">{formattedTime}</span>
                </div>
                 <div className={`relative px-4 py-2.5 rounded-xl text-sm ${isCurrentUser ? 'bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-br-none' : 'bg-white text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {translatedText && (
                        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                            <p className="text-xs font-semibold opacity-70">{t('community_translation_label')}</p>
                            <p className="text-sm italic">{translatedText}</p>
                        </div>
                    )}
                    <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'}`}>
                        <button 
                            onClick={handleTranslate} 
                            disabled={isTranslating}
                            className="p-1.5 bg-primary-200 hover:bg-primary-300 dark:bg-darkPrimary-600 dark:hover:bg-darkPrimary-500 rounded-full"
                            title={t('community_translate')}
                        >
                            {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
                        </button>
                    </div>
                </div>
                 <MessageReactions chatId={chatId} message={message} isCurrentUser={isCurrentUser} />
            </div>
        </div>
    );
}