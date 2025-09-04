import React from 'react';
import { Link } from 'wouter';
import type { ChatConversation, CommunityUser } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Lock, Users, Hash, User } from 'lucide-react';

const ChatListItem = ({ chat, isActive }: { chat: ChatConversation, isActive: boolean }) => {
    const { communityUsers, solana } = useAppContext();

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

    const info = chat.type === 'group' ? { name: chat.name, avatar: chat.image } : getDmInfo();

    const linkClasses = `flex items-center space-x-3 p-2.5 rounded-lg w-full text-left transition-colors duration-200 ${
        isActive ? 'bg-accent-500/20 text-accent-700 dark:bg-darkAccent-500/20 dark:text-darkAccent-300 font-semibold' : 'text-primary-600 dark:text-darkPrimary-300 hover:bg-primary-200/50 dark:hover:bg-darkPrimary-700/50'
    }`;
    
    const content = (
         <>
            <div className="relative flex-shrink-0">
                {chat.type === 'dm' ? (
                    <img src={info.avatar} alt={info.name} className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-primary-500 dark:text-darkPrimary-400" />
                    </div>
                )}
                 {/* FIX: The `info` object is a union type, and the 'group' type doesn't have `isOnline`. The `in` operator acts as a type guard to ensure `isOnline` exists before it's accessed, satisfying TypeScript's type checker. */}
                 {chat.type === 'dm' && 'isOnline' in info && info.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-primary-100 dark:border-darkPrimary-800"></span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{info.name}</p>
            </div>
            {chat.isTokenGated && <Lock size={14} className="text-primary-400 dark:text-darkPrimary-500" />}
        </>
    );

    if (!hasAccess) {
        return (
            <div className={`${linkClasses} cursor-not-allowed opacity-60`} title={`Necesită ${chat.requiredTokenAmount} OWFN`}>
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
    const { solana } = useAppContext();
    const dms = chats.filter(c => c.type === 'dm');
    const groups = chats.filter(c => c.type === 'group');

    return (
        <aside className="w-80 bg-primary-50 dark:bg-darkPrimary-800 border-r border-primary-200 dark:border-darkPrimary-700/50 flex flex-col p-3">
            <h2 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2.5 mb-2 mt-4 flex items-center gap-2"><User size={14} /> Mesaje Private</h2>
            <nav className="space-y-1">
                {dms.map(chat => (
                    <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                ))}
            </nav>
            <h2 className="text-xs font-bold uppercase text-primary-500 dark:text-darkPrimary-400 px-2.5 mb-2 mt-6 flex items-center gap-2"><Users size={14} /> Grupuri</h2>
            <nav className="space-y-1">
                {groups.map(chat => (
                    <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} />
                ))}
            </nav>
        </aside>
    );
}