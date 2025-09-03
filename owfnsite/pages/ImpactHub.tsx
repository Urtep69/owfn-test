import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { HUB_CHANNELS, OWFN_MINT_ADDRESS, CHAT_HOLDERS_CIRCLE_REQUIREMENT } from '../constants.ts';
import type { HubChannel, HubMessage } from '../types.ts';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { Send, Lock, Smile, Paperclip, Mic, Wallet as WalletIcon, MessageSquare } from 'lucide-react';

const ConnectWalletPrompt = () => {
    const { t, setWalletModalOpen } = useAppContext();
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-24 h-24 text-primary-300 dark:text-darkPrimary-600 mb-6" />
            <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200 mb-2">{t('hub_connect_prompt_title')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6 max-w-sm">{t('hub_connect_prompt_desc')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-accent-950 dark:text-darkPrimary-950 rounded-lg shadow-3d hover:shadow-3d-lg transition-all duration-300 transform hover:-translate-y-0.5 btn-tactile"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent-400 to-accent-500 dark:from-darkAccent-400 dark:to-darkAccent-600"></span>
                <span className="relative flex items-center gap-2">
                    <WalletIcon size={18} /> {t('connect_wallet')}
                </span>
            </button>
        </div>
    );
};

const AccessDeniedCard = ({ channel }: { channel: HubChannel }) => {
    const { t } = useAppContext();
    const message = channel.level === 2
        ? t('hub_access_denied_holders_circle', { amount: CHAT_HOLDERS_CIRCLE_REQUIREMENT.toLocaleString() })
        : t('hub_access_denied_higher_levels');

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-primary-50 dark:bg-darkPrimary-800/50 p-8 rounded-2xl shadow-lg text-center max-w-lg animate-fade-in-up">
                <Lock className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-2">{t('hub_access_denied_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300">{message}</p>
            </div>
        </div>
    );
};

export default function ImpactHub() {
    const { t, solana } = useAppContext();
    const { connected, address, userTokens } = solana;
    const [selectedChannel, setSelectedChannel] = useState<HubChannel | null>(HUB_CHANNELS[0]);
    const [messages, setMessages] = useState<HubMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const owfnBalance = useMemo(() => {
        const owfnToken = userTokens.find(token => token.mintAddress === OWFN_MINT_ADDRESS);
        return owfnToken?.balance ?? 0;
    }, [userTokens]);

    const userAccessLevel = useMemo(() => {
        if (!connected) return 0;
        if (owfnBalance >= CHAT_HOLDERS_CIRCLE_REQUIREMENT) return 2;
        return 1;
    }, [connected, owfnBalance]);

    const hasAccess = (channelLevel: number) => userAccessLevel >= channelLevel;
    
    // Mock message generation
    useEffect(() => {
        if (selectedChannel && hasAccess(selectedChannel.level)) {
            const mockMessages: HubMessage[] = Array.from({ length: 15 }).map((_, i) => ({
                id: `${selectedChannel.id}-${i}`,
                authorAddress: i % 3 === 0 ? address || 'MyWalletAddress' : `OtherWallet${i}`,
                authorName: i % 3 === 0 ? 'You' : `User ${i}`,
                text: `This is a sample message for the ${t(selectedChannel.nameKey)} channel. Message number ${i + 1}.`,
                timestamp: new Date(Date.now() - (15 - i) * 60000).toISOString(),
            }));
            setMessages(mockMessages);
        } else {
            setMessages([]);
        }
    }, [selectedChannel, t, address, userAccessLevel]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim() || !address || !selectedChannel) return;
        const newMessage: HubMessage = {
            id: `msg-${Date.now()}`,
            authorAddress: address,
            authorName: 'You',
            text: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };
    
    if (!connected) {
        return <ConnectWalletPrompt />;
    }

    return (
        <div className="flex h-[calc(100vh-14rem)] bg-white dark:bg-darkPrimary-900 rounded-2xl shadow-3d-lg overflow-hidden -my-4">
            {/* Sidebar with Channels */}
            <aside className="w-64 bg-primary-50 dark:bg-darkPrimary-800/50 border-r border-primary-200 dark:border-darkPrimary-700/50 flex-shrink-0 flex flex-col">
                <header className="p-4 border-b border-primary-200 dark:border-darkPrimary-700/50">
                    <h2 className="font-bold text-lg text-primary-900 dark:text-darkPrimary-100">{t('hub_sidebar_title')}</h2>
                </header>
                <nav className="flex-1 p-2 overflow-y-auto">
                    {HUB_CHANNELS.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`w-full flex items-center gap-3 p-3 my-1 rounded-lg text-left transition-colors duration-200 ${
                                selectedChannel?.id === channel.id
                                    ? 'bg-accent-100 text-accent-800 dark:bg-darkAccent-900/50 dark:text-darkAccent-200 font-semibold'
                                    : 'text-primary-600 dark:text-darkPrimary-300 hover:bg-primary-100 dark:hover:bg-darkPrimary-700'
                            }`}
                        >
                            {hasAccess(channel.level) ? channel.icon : <Lock size={18} className="text-primary-500 dark:text-darkPrimary-500"/>}
                            <div className="flex-1">
                                <span>{t(channel.nameKey)}</span>
                                <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{t(channel.accessKey)}</p>
                            </div>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {!selectedChannel ? (
                     <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare className="w-24 h-24 text-primary-300 dark:text-darkPrimary-600 mb-6" />
                        <h2 className="text-2xl font-bold text-primary-800 dark:text-darkPrimary-200 mb-2">{t('hub_welcome_title')}</h2>
                        <p className="text-primary-600 dark:text-darkPrimary-400 max-w-sm">{t('hub_welcome_desc')}</p>
                    </div>
                ) : !hasAccess(selectedChannel.level) ? (
                    <AccessDeniedCard channel={selectedChannel} />
                ) : (
                    <>
                        <header className="p-4 border-b border-primary-200 dark:border-darkPrimary-700/50 flex-shrink-0">
                            <h2 className="font-bold text-xl text-primary-900 dark:text-darkPrimary-100"># {t(selectedChannel.nameKey)}</h2>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                             {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.authorAddress === address ? 'flex-row-reverse' : ''}`}>
                                    <WalletAvatar address={msg.authorAddress} className="w-10 h-10 flex-shrink-0 mt-1" />
                                    <div className={`p-3 rounded-xl max-w-lg ${msg.authorAddress === address ? 'bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-br-none' : 'bg-primary-100 dark:bg-darkPrimary-700 rounded-bl-none'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">{msg.authorAddress === address ? 'You' : `${msg.authorAddress.slice(0,4)}...${msg.authorAddress.slice(-4)}`}</span>
                                            <span className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-primary-200 dark:border-darkPrimary-700/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={t('hub_chat_placeholder')}
                                    className="w-full bg-primary-100 dark:bg-darkPrimary-700 rounded-lg p-3 pr-28 text-sm focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button className="p-2 text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 rounded-full"><Smile size={18}/></button>
                                    <button className="p-2 text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 rounded-full"><Paperclip size={18}/></button>
                                    <button onClick={handleSendMessage} disabled={!input.trim()} className="bg-accent-500 text-white p-2 rounded-lg hover:bg-accent-600 disabled:opacity-50">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}