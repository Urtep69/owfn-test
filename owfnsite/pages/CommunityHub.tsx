import React from 'react';
import { useParams, Redirect } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import ChatList from '../components/chat/ChatList.tsx';
import ChatView from '../components/chat/ChatView.tsx';
import ChatInfoPanel from '../components/chat/ChatInfoPanel.tsx';
import { MessageSquare } from 'lucide-react';

export default function CommunityHub() {
    const { chats, solana } = useAppContext();
    const params = useParams();
    // FIX: Destructuring `id` from `useParams` can cause type inference issues. Accessing it directly is safer and more consistent with other components in the project.
    const activeChatId = params?.id;
    
    // Redirect to the first chat if no specific chat is selected
    if (!activeChatId && chats.length > 0) {
        return <Redirect to={`/community/${chats[0].id}`} />;
    }

    const activeChat = chats.find(c => c.id === activeChatId);
    
    if (!solana.connected) {
        return (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="w-24 h-24 text-primary-300 dark:text-darkPrimary-600 mb-6" />
                <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200">Bun venit în Hub-ul Comunitar</h2>
                <p className="text-primary-600 dark:text-darkPrimary-400 max-w-md mt-2">Conectează-ți portofelul pentru a te alătura conversației, a discuta cu alți membri și a accesa grupuri exclusive.</p>
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
                            <p className="font-semibold">Selectează o conversație</p>
                            <p className="text-sm">Alege un grup sau un mesaj direct pentru a începe.</p>
                        </div>
                    </div>
                )}
            </main>

            {activeChat && <ChatInfoPanel chat={activeChat} />}
        </div>
    );
}