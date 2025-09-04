import React, { useRef, useEffect } from 'react';
import type { ChatConversation } from '../../types.ts';
import ChatHeader from './ChatHeader.tsx';
import ChatMessage from './ChatMessage.tsx';
import MessageInput from './MessageInput.tsx';

export default function ChatView({ chat }: { chat: ChatConversation }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            <ChatHeader chat={chat} />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {chat.messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <MessageInput chat={chat} />
        </div>
    );
}
