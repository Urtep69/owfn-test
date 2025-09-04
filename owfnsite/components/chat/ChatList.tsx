import React from 'react';
import { Link } from 'wouter';
import type { ChatConversation } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Lock, Users, Hash, User, Megaphone } from 'lucide-react';

const ChatListItem = ({ chat, isActive }: { chat: ChatConversation, isActive: boolean }) => {
    const { t, communityUsers, solana } = useAppContext();

    const getDmInfo = () => {
        if (chat.type !== 'dm' || !solana.address) return { name: 'Unknown', avatar: '', isOnline: false };
        const otherUserId = chat.participants.find(p => p !== solana.address);
        const otherUser = communityUsers.find(u => u.id === otherUserId);
        return {
            name: otherUser?.username ?? 'Unknown User',
            avatar: otherUser?.avatar ?? 'https://i.pravatar.cc/150',
            isOnline: otherUser?.isOnline ?? false,
        };
    };

    const owfnToken = solana.userTokens.find(t => t.symbol === 'OWFN');
    const hasAccess = !chat.isTokenGated || (owfnToken && owfnToken.balance >= (chat.requiredTokenAmount || 0));

    let info: { name?: string; avatar?: string; isOnline?: boolean };
    let icon: React.ReactNode;

    switch(chat.type) {
        case 'dm':
            info = getDmInfo();
            icon = <img src={info.avatar} alt={info.name} className="w-10 h-10 rounded-full" />;
            break;
        case 'group':
            info = { name: chat.name, avatar: chat.image };
            icon = <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center"><Hash className="w-5 h-5 text-primary-500 dark:text-darkPrimary-400" /></div>;
            break;
        case 'channel':
            info = { name: chat.name, avatar: chat.image };
            icon = <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center"><Megaphone className="w-5 h-5 text-primary-500 dark:text-darkPrimary-400" /></div>;
            break;
        default:
            info = { name: 'Unknown Chat' };
            icon = <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-darkPrimary-700" />;
    }


    const linkClasses = `flex items-center space-x-3 p-2.5 rounded-lg w-full text-left transition-colors duration-200 ${
        isActive ? 'bg-accent-500/20 text-accent-700 dark:bg-darkAccent-500/20 dark:text-darkAccent-300 font-semibold' : 'text-primary-600 dark:text-darkPrimary-300 hover:bg-primary-200/50 dark:hover:bg-darkPrimary-700/50'
    }`;
    
    const content = (
         <>
            <div className="relative flex-shrink-0">
                {icon}
                {chat.type === 'dm' && info.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-primary-50 dark:border-darkPrimary-800"></span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{info.name}</p>
                {chat.isTokenGated && <p className="text-xs text-amber-600 dark:text-amber-400">{t('community_requires_owfn', { amount: (chat.requiredTokenAmount || 0).toLocaleString() })}</p>}
            </div>
            {chat.isTokenGated && !hasAccess && <Lock size={14} className="text-primary-400 dark:text-darkPrimary-500" />}
        </>
    );

    if (!hasAccess) {
        return (
            <div className={`${linkClasses} cursor-not-allowed opacity-60`} title={t('community_requires_owfn', { amount: (chat.requiredTokenAmount || 0).toLocaleString() }) || undefined}>
                {content}
            </div>
        )
    }

    return (
        <Link href={`/community/${chat.id}`} className={linkClasses}>
           {content}
        </Link>
    );
};


export default function ChatList({ chats, activeChatId }: { chats: ChatConversation[], activeChatId: string | null }) {
    const { t } = useAppContext();
    const dms = chats.filter(c => c.type === 'dm');
    const groups = chats.filter(c => c.type === 'group');
    const channels = chats.filter(c => c.type === 'channel');

    return (
        <aside className="w-80 bg-primary-50 dark:bg-darkPrimary-800 border-r border-primary-200 dark:border-darkPrimary-700/50 flex flex-col p-3 overflow-y-auto">
            <div className="flex-shrink-0">
                <h2 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2.5 mb-2 flex items-center gap-2"><Megaphone size={14} /> {t('community_channels')}</h2>
                <nav className="space-y-1 mb-4">
                    {channels.map(chat => (
                        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                    ))}
                </nav>

                <h2 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2.5 mb-2 flex items-center gap-2"><Users size={14} /> {t('community_groups')}</h2>
                <nav className="space-y-1 mb-4">
                    {groups.map(chat => (
                        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                    ))}
                </nav>
            
                <h2 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2.5 mb-2 flex items-center gap-2"><User size={14} /> {t('community_private_messages')}</h2>
                <nav className="space-y-1">
                    {dms.map(chat => (
                        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                    ))}
                </nav>
            </div>
        </aside>
    );
}