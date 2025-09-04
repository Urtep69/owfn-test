import React, { useState } from 'react';
import type { ChatConversation } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Send, AlertTriangle } from 'lucide-react';

async function moderateMessage(message: string): Promise<{ isToxic: boolean, reason: string }> {
    try {
        const response = await fetch('/api/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) return { isToxic: false, reason: '' };
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Moderation API call failed:", error);
        return { isToxic: false, reason: '' };
    }
}

export default function MessageInput({ chat }: { chat: ChatConversation }) {
    const { sendMessageToChat } = useAppContext();
    const [input, setInput] = useState('');
    const [moderationWarning, setModerationWarning] = useState<string | null>(null);

    const handleSend = async () => {
        if (input.trim() === '') return;

        // AI Guardian: Proactive Moderation
        const moderationResult = await moderateMessage(input);
        if (moderationResult.isToxic) {
            setModerationWarning(moderationResult.reason);
            return;
        }

        sendMessageToChat(chat.id, input);
        setInput('');
        setModerationWarning(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (moderationWarning) {
            setModerationWarning(null); // Clear warning on new input
        }
    };

    return (
        <div className="p-4 bg-primary-50 dark:bg-darkPrimary-800 border-t border-primary-200 dark:border-darkPrimary-700">
            {moderationWarning && (
                <div className="mb-2 p-2 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-semibold rounded-md flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{moderationWarning}</span>
                </div>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Mesaj către ${chat.type === 'group' ? chat.name : 'utilizator'}...`}
                    className="w-full bg-white dark:bg-darkPrimary-700 rounded-lg py-3 pl-4 pr-14 focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-accent-500 text-white p-2 rounded-md hover:bg-accent-600 disabled:bg-primary-300 dark:disabled:bg-darkPrimary-600 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
