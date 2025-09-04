import React from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import type { CommunityMessage, ChatConversation } from '../../types.ts';
import { Reply, Pin, Edit3, Trash2 } from 'lucide-react';

interface MessageContextMenuProps {
    message: CommunityMessage;
    chat: ChatConversation;
    isCurrentUser: boolean;
    onPin: (messageId: string) => void;
    onEdit: (message: CommunityMessage) => void;
    onDelete: (messageId: string) => void;
    onReply: (message: CommunityMessage) => void;
}

const checkPermission = (action: keyof NonNullable<ChatConversation['permissions']>, chat: ChatConversation, userId: string) => {
    if (chat.type === 'dm') return true; // All actions allowed in DMs for now
    const requiredRole = chat.permissions?.[action] || 'owner';
    const userIsOwner = chat.ownerId === userId;
    const userIsModerator = chat.moderatorIds?.includes(userId) || false;
    
    if (requiredRole === 'owner') return userIsOwner;
    if (requiredRole === 'moderator') return userIsOwner || userIsModerator;
    if (requiredRole === 'member') return true;
    return false;
}

export default function MessageContextMenu({ message, chat, isCurrentUser, onPin, onEdit, onDelete, onReply }: MessageContextMenuProps) {
    const { solana, t } = useAppContext();
    if (!solana.address) return null;

    const canReply = checkPermission('canSendMessage', chat, solana.address);
    const canPin = checkPermission('canPinMessages', chat, solana.address);
    const canEdit = isCurrentUser;
    const canDelete = isCurrentUser || checkPermission('canDeleteMessages', chat, solana.address);
    
    return (
         <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-darkPrimary-600 rounded-full shadow-md border border-primary-200 dark:border-darkPrimary-500 p-1 ${isCurrentUser ? 'left-0 -translate-x-full -translate-y-1/2 ml-[-8px]' : 'right-0 translate-x-full -translate-y-1/2 mr-[-8px]'}`}>
            {canReply && <button onClick={() => onReply(message)} className="p-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-500" title={t('action_reply')}><Reply size={16}/></button>}
            {canPin && chat.type !== 'dm' && <button onClick={() => onPin(message.id)} className="p-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-500" title={t('action_pin')}><Pin size={16}/></button>}
            {canEdit && <button onClick={() => onEdit(message)} className="p-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-500" title={t('action_edit')}><Edit3 size={16}/></button>}
            {canDelete && <button onClick={() => onDelete(message.id)} className="p-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-500 text-red-500" title={t('action_delete')}><Trash2 size={16}/></button>}
        </div>
    );
}