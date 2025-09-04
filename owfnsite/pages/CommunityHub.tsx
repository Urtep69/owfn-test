import React, { useEffect } from 'react';
import { useParams, Redirect } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import ChatList from '../components/chat/ChatList.tsx';
import ChatView from '../components/chat/ChatView.tsx';
import ChatInfoPanel from '../components/chat/ChatInfoPanel.tsx';
import UserProfileModal from '../components/chat/UserProfileModal.tsx';
import GroupSettingsModal from '../components/chat/GroupSettingsModal.tsx';
import { MessageSquare } from 'lucide-react';

export default function CommunityHub() {
    const { 
        chats, 
        solana, 
        isProfileModalOpen, 
        viewingProfileId, 
        closeProfileModal, 
        t, 
        isGroupSettingsModalOpen, 
        closeGroupSettingsModal,
        markMessagesAsRead
    } = useAppContext();
    const params = useParams<{ id?: string }>();
    const activeChatId = params?.id;
    
    useEffect(() => {
        if (activeChatId) {
            markMessagesAsRead(activeChatId);
        }
    }, [activeChatId, chats, markMessagesAsRead]);

    // Redirect to the first chat if no specific chat is selected
    if (!activeChatId && chats.length > 0) {
        const firstChat = chats.find(c => c.type === 'channel' || c.type === 'group') || chats[0];
        return <Redirect to={`/community/${firstChat.id}`} />;
    }

    const activeChat = chats.find(c => c.id === activeChatId);
    
    if (!solana.connected) {
        return (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="w-24 h-24 text-primary-300 dark:text-darkPrimary-600 mb-6" />
                <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200">{t('community_hub_welcome_title')}</h2>
                <p className="text-primary-600 dark:text-darkPrimary-400 max-w-md mt-2">{t('community_hub_welcome_desc')}</p>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-8 font-sans">
            <ChatList chats={chats} activeChatId={activeChatId} />
            
            <main className="flex-1 flex flex-col bg-primary-100 dark:bg-darkPrimary-900">
                {activeChat ? (
                    <ChatView chat={activeChat} />
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center">
                        <div className="text-primary-500 dark:text-darkPrimary-400">
                            <MessageSquare size={48} className="mx-auto mb-4"/>
                            <p className="font-semibold">{t('community_select_conversation_title')}</p>
                            <p className="text-sm">{t('community_select_conversation_desc')}</p>
                        </div>
                    </div>
                )}
            </main>

            {activeChat && <ChatInfoPanel chat={activeChat} />}

            {isProfileModalOpen && viewingProfileId && (
                <UserProfileModal userId={viewingProfileId} onClose={closeProfileModal} />
            )}
            
            {isGroupSettingsModalOpen && activeChat && (activeChat.type === 'group' || activeChat.type === 'channel') && (
                 <GroupSettingsModal chat={activeChat} onClose={closeGroupSettingsModal} />
            )}
        </div>
    );
}