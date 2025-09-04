import React, { useRef, useEffect, useState } from 'react';
import type { ChatConversation, CommunityMessage } from '../../types.ts';
import ChatHeader from './ChatHeader.tsx';
import ChatMessage from './ChatMessage.tsx';
import MessageInput from './MessageInput.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';

export default function ChatView({ chat }: { chat: ChatConversation }) {
    const { communityUsers, solana, openProfileModal, pinMessage, editMessage, deleteMessage, t } = useAppContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<CommunityMessage | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // A slight delay ensures the view is rendered before scrolling
        setTimeout(scrollToBottom, 50);
    }, [chat.messages, chat.id]);
    
    useEffect(() => {
        // Reset reply/edit state when switching chats
        setReplyingTo(null);
        setEditingMessage(null);
    }, [chat.id]);

    const handlePin = (messageId: string) => pinMessage(chat.id, messageId);
    const handleEdit = (message: CommunityMessage) => {
        setEditingMessage(message);
        setReplyingTo(null);
    }
    const handleDelete = (messageId: string) => deleteMessage(chat.id, messageId);
    const handleReply = (message: CommunityMessage) => {
        setReplyingTo(message);
        setEditingMessage(null);
    }

    const typingUsers = (chat.typingUserIds || [])
        .filter(id => id !== solana.address)
        .map(id => communityUsers.find(u => u.id === id)?.username)
        .filter(Boolean);
    
    return (
        <div className="flex-1 flex flex-col h-full">
            <ChatHeader chat={chat} />
            <div className="flex-1 overflow-y-auto p-6 relative">
                <div className="space-y-6">
                    {chat.messages.map(message => (
                        <ChatMessage 
                            key={message.id} 
                            message={message} 
                            chat={chat}
                            onAvatarClick={() => openProfileModal(message.senderId)}
                            onPin={handlePin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReply={handleReply}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {typingUsers.length > 0 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-start px-6 py-1">
                         <div className="bg-white dark:bg-darkPrimary-700 px-3 py-1.5 rounded-lg text-sm text-primary-600 dark:text-darkPrimary-300 shadow-md">
                            {typingUsers.join(', ')} {t('community_is_typing', {defaultValue: 'is typing...'})}
                         </div>
                    </div>
                )}
            </div>
            <MessageInput 
                chat={chat} 
                replyingTo={replyingTo}
                editingMessage={editingMessage}
                onCancelReply={() => setReplyingTo(null)}
                onCancelEdit={() => setEditingMessage(null)}
            />
        </div>
    );
}