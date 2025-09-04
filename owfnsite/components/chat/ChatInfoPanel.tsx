import React from 'react';
import type { ChatConversation } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
// FIX: Added Hash to imports
import { Users, User, Crown, Shield, Hash } from 'lucide-react';

const UserListItem = ({ userId, role }: { userId: string, role: 'owner' | 'moderator' | 'member' }) => {
    const { communityUsers, openProfileModal } = useAppContext();
    const user = communityUsers.find(u => u.id === userId);

    if (!user) return null;

    // FIX: lucide-react icons don't accept a 'title' prop for tooltips.
    // Wrapped the icon in a span with a title attribute to achieve the tooltip effect.
    const roleIcon = {
        owner: <span title="Proprietar"><Crown size={14} className="text-yellow-500" /></span>,
        moderator: <span title="Moderator"><Shield size={14} className="text-blue-500" /></span>,
        member: null,
    }[role];

    return (
        <button 
            onClick={() => openProfileModal(userId)}
            className="flex items-center space-x-3 p-2 rounded-lg w-full text-left hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
        >
            <div className="relative">
                <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full" />
                {user.isOnline && !user.isBot && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 border border-primary-50 dark:border-darkPrimary-800"></span>}
            </div>
            <div className="flex-1 min-w-0">
                 <span className="text-sm font-medium truncate">{user.username}</span>
            </div>
            {roleIcon}
        </button>
    );
};


export default function ChatInfoPanel({ chat }: { chat: ChatConversation }) {
    const { solana, openProfileModal, t } = useAppContext();
    
    if (chat.type === 'dm') {
        const otherUserId = chat.participants.find(id => id !== solana.address);
        if (!otherUserId) return null;
        
        const otherUser = useAppContext().communityUsers.find(u => u.id === otherUserId);
        if (!otherUser) return null;

        return (
            <aside className="w-80 bg-primary-50 dark:bg-darkPrimary-800 border-l border-primary-200 dark:border-darkPrimary-700/50 p-4">
                 <h3 className="text-lg font-bold mb-4 text-primary-900 dark:text-darkPrimary-100 flex items-center gap-2"><User size={18} /> {t('community_about')}</h3>
                 <div className="flex flex-col items-center text-center p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg">
                    <button onClick={() => openProfileModal(otherUser.id)} className="focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full">
                        <img src={otherUser.avatar} alt={otherUser.username} className="w-20 h-20 rounded-full mb-3" />
                    </button>
                    <h3 className="font-bold text-lg">{otherUser.username}</h3>
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{otherUser.isOnline ? t('community_online') : t('community_offline')}</p>
                </div>
            </aside>
        );
    }
    
    const owner = chat.participants.find(id => id === chat.ownerId);
    const moderators = chat.participants.filter(id => chat.moderatorIds?.includes(id));
    const members = chat.participants.filter(id => id !== owner && !moderators.includes(id));


    return (
        <aside className="w-80 bg-primary-50 dark:bg-darkPrimary-800 border-l border-primary-200 dark:border-darkPrimary-700/50 p-4 flex flex-col">
             <div className="text-center mb-4">
                <div className="w-20 h-20 bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center rounded-full mx-auto">
                    <Hash className="w-8 h-8 text-primary-500 dark:text-darkPrimary-400"/>
                </div>
                <h2 className="text-xl font-bold mt-3">{chat.name}</h2>
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{chat.description}</p>
             </div>

            <h3 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2 mt-4 mb-2 flex items-center gap-2">
                <Users size={14}/> {t('community_members')} - {chat.participants.length}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1">
                {owner && <UserListItem userId={owner} role="owner" />}
                {moderators.map(id => <UserListItem key={id} userId={id} role="moderator" />)}
                {members.map(id => <UserListItem key={id} userId={id} role="member" />)}
            </div>
        </aside>
    );
}