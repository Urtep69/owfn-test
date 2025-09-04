import React from 'react';
import type { ChatConversation } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Users, User, AtSign } from 'lucide-react';

const UserProfileCard = ({ userId }: { userId: string }) => {
    const { communityUsers } = useAppContext();
    const user = communityUsers.find(u => u.id === userId);

    if (!user) return null;

    return (
         <div className="flex flex-col items-center text-center p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg">
            <img src={user.avatar} alt={user.username} className="w-20 h-20 rounded-full mb-3" />
            <h3 className="font-bold text-lg">{user.username}</h3>
            {/* Placeholder for more user details */}
        </div>
    );
};

export default function ChatInfoPanel({ chat }: { chat: ChatConversation }) {
    const { communityUsers, solana } = useAppContext();
    
    return (
        <aside className="w-80 bg-primary-50 dark:bg-darkPrimary-800 border-l border-primary-200 dark:border-darkPrimary-700/50 p-4">
            {chat.type === 'group' && (
                <div>
                    <h3 className="text-lg font-bold mb-2 text-primary-900 dark:text-darkPrimary-100 flex items-center gap-2"><Users size={18}/> Membri</h3>
                    <div className="space-y-3">
                        {chat.participants.map(userId => {
                            const user = communityUsers.find(u => u.id === userId);
                            if (!user) return null;
                            return (
                                <div key={userId} className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full" />
                                        {user.isOnline && !user.isBot && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 border border-primary-50 dark:border-darkPrimary-800"></span>}
                                    </div>
                                    <span className="text-sm font-medium">{user.username}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {chat.type === 'dm' && (
                <div>
                     <h3 className="text-lg font-bold mb-4 text-primary-900 dark:text-darkPrimary-100 flex items-center gap-2"><User size={18} /> Despre</h3>
                     {chat.participants.filter(id => id !== solana.address).map(id => (
                         <UserProfileCard key={id} userId={id} />
                     ))}
                </div>
            )}
        </aside>
    );
}
