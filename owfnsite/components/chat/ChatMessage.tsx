import React from 'react';
import type { CommunityMessage, ChatConversation } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Trash2, File, Download, Check, CheckCheck } from 'lucide-react';
import MessageReactions from './MessageReactions.tsx';
import MessageContextMenu from './MessageContextMenu.tsx';

interface ChatMessageProps {
    message: CommunityMessage;
    chat: ChatConversation;
    onAvatarClick: () => void;
    onPin: (messageId: string) => void;
    onEdit: (message: CommunityMessage) => void;
    onDelete: (messageId: string) => void;
    onReply: (message: CommunityMessage) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const ReplyPreview = ({ messageId, messages }: { messageId: string, messages: CommunityMessage[] }) => {
    const { communityUsers } = useAppContext();
    const repliedToMessage = messages.find(m => m.id === messageId);
    if (!repliedToMessage) return null;

    const sender = communityUsers.find(u => u.id === repliedToMessage.senderId);
    const contentPreview = repliedToMessage.isDeleted 
        ? 'Mesaj șters' 
        : (repliedToMessage.attachment ? `[${repliedToMessage.attachment.type === 'image' ? 'Imagine' : 'Fișier'}] ${repliedToMessage.content}` : repliedToMessage.content);

    return (
        <div className="pl-2 mb-1.5 border-l-2 border-black/20 dark:border-white/20">
            <p className="text-xs font-bold">{sender?.username || 'Utilizator'}</p>
            <p className="text-xs opacity-80 truncate">{contentPreview}</p>
        </div>
    )
}

const AttachmentDisplay = ({ attachment }: { attachment: NonNullable<CommunityMessage['attachment']> }) => {
    if (attachment.type === 'image') {
        return <img src={attachment.url} alt={attachment.name} className="mt-2 rounded-lg max-w-xs max-h-80 object-cover cursor-pointer" onClick={() => window.open(attachment.url, '_blank')} />;
    }
    if (attachment.type === 'file') {
        return (
            <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-black/10 dark:bg-white/10 rounded-md flex items-center justify-center">
                    <File size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{attachment.name}</p>
                    <p className="text-xs opacity-70">{formatBytes(attachment.size)}</p>
                </div>
                <a href={attachment.url} download={attachment.name} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                    <Download size={20} />
                </a>
            </div>
        );
    }
    return null;
}

const MessageStatus = ({ status }: { status: CommunityMessage['status'] }) => {
    if (status === 'sending') return <Check size={16} className="text-black/50 dark:text-white/50" />;
    if (status === 'sent') return <Check size={16} className="text-black/80 dark:text-white/80" />;
    if (status === 'read') return <CheckCheck size={16} className="text-blue-500" />;
    return null;
}

export default function ChatMessage(props: ChatMessageProps) {
    const { message, chat, onAvatarClick } = props;
    const { communityUsers, solana, t } = useAppContext();

    const sender = communityUsers.find(u => u.id === message.senderId);
    const isCurrentUser = message.senderId === solana.address;

    if (!sender) return null;

    const messageDate = new Date(message.timestamp);
    const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageContent = message.isDeleted ? (
        <p className="italic text-black/60 dark:text-white/60 flex items-center gap-2"><Trash2 size={14}/> {message.content}</p>
    ) : (
        <>
            {message.attachment && <AttachmentDisplay attachment={message.attachment} />}
            {message.content && <p className="whitespace-pre-wrap mt-1">{message.content}</p>}
        </>
    );

    return (
        <div className={`group flex items-start gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <button onClick={onAvatarClick} className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full">
                 <img src={sender.avatar} alt={sender.username} className="w-10 h-10 rounded-full" />
            </button>
            <div className={`relative flex flex-col gap-1 max-w-lg ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-3">
                    {!isCurrentUser && 
                        <button onClick={onAvatarClick} className="font-bold text-sm text-primary-800 dark:text-darkPrimary-200 hover:underline">
                            {sender.username}
                        </button>
                    }
                </div>
                 <div className={`relative px-3 py-2 rounded-xl text-sm ${isCurrentUser ? 'bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-br-none' : 'bg-white text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none'}`}>
                    {message.replyToMessageId && <ReplyPreview messageId={message.replyToMessageId} messages={chat.messages} />}
                    {messageContent}
                    <div className="absolute right-2 bottom-1.5 flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
                        {message.isEdited && <span className="text-xs">(editat)</span>}
                        <span>{formattedTime}</span>
                        {isCurrentUser && <MessageStatus status={message.status} />}
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    {!message.isDeleted && <MessageReactions chatId={chat.id} message={message} isCurrentUser={isCurrentUser} />}
                 </div>
                 {!message.isDeleted && <MessageContextMenu {...props} isCurrentUser={isCurrentUser} />}
            </div>
        </div>
    );
}