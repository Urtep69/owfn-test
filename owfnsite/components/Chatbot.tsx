import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { MessageCircle, X, Send, User, Loader2, Twitter, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService.ts';
import type { ChatMessage } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon, DiscordIcon } from './IconComponents.tsx';

const MAX_HISTORY_MESSAGES = 8; // Keep last 4 user/model pairs for context to prevent memory errors on the server.

const pageNameToPath: { [key: string]: string } = {
  'Home': '/',
  'Presale': '/presale',
  'About': '/about',
  'Whitepaper': '/whitepaper',
  'Tokenomics': '/tokenomics',
  'Roadmap': '/roadmap',
  'Staking': '/staking',
  'Vesting': '/vesting',
  'Donations': '/donations',
  'Dashboard': '/dashboard',
  'Profile': '/profile',
  'Impact Portal': '/impact',
  'Partnerships': '/partnerships',
  'FAQ': '/faq',
  'Contact': '/contact'
};

const socialIconMap: { [key: string]: React.ReactNode } = {
    'X': <Twitter className="w-4 h-4" />,
    'Telegram': <Send className="w-4 h-4" />,
    'Telegram Group': <Send className="w-4 h-4" />,
    'Telegram Channel': <Send className="w-4 h-4" />,
    'Discord': <DiscordIcon className="w-4 h-4" />,
};


const renderMessageContent = (text: string) => {
    const regex = /\[(Visit Page): (.*?)\]|\[(Social Link): (.*?)\|(.*?)\]/g;
    const result: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Push the text before the match
        if (match.index > lastIndex) {
            result.push(text.substring(lastIndex, match.index));
        }
        
        // match[1] is 'Visit Page', match[2] is page name
        // OR
        // match[3] is 'Social Link', match[4] is platform, match[5] is URL

        if (match[1] === 'Visit Page') {
            const pageName = match[2];
            const path = pageNameToPath[pageName];
            if (path) {
                result.push(
                    <Link key={match.index} href={path} className="text-accent-600 dark:text-darkAccent-400 font-bold underline hover:opacity-80">
                        {pageName}
                    </Link>
                );
            } else {
                result.push(`[Visit Page: ${pageName}]`); // Fallback
            }
        } else if (match[3] === 'Social Link') {
            const platformName = match[4];
            const url = match[5];
            const icon = socialIconMap[platformName];
            if (url && platformName) {
                 result.push(
                    <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-darkAccent-400 font-bold underline hover:opacity-80 inline-flex items-center gap-1.5">
                        {icon} {platformName}
                    </a>
                );
            } else {
                 result.push(`[Social Link: ${platformName}|${url}]`); // Fallback
            }
        }

        lastIndex = regex.lastIndex;
    }

    // Push the remaining text after the last match
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    return <>{result.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};


export const Chatbot = () => {
    const { t, currentLanguage, solana } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);
    const [location, setLocation] = useLocation();

    // State for the proactive message bubble
    const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
    const [isBubbleVisible, setIsBubbleVisible] = useState(false);
    const [hasBeenOpened, setHasBeenOpened] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading, loadingText]);
    
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMaximized]);

    useEffect(() => {
        return () => {
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
            }
        };
    }, []);
    
    // Proactive, contextual messaging bubble logic
    useEffect(() => {
        const pageKey = location.split('/')[1] || 'home';
        const storageKey = `owfn-proactive-msg-${pageKey}`;

        if (sessionStorage.getItem(storageKey)) return;

        let messageKey = '';
        const comingSoonPages = ['staking', 'vesting', 'airdrop', 'governance', 'dashboard'];
        
        if(location.includes('/dashboard/token/')) {
            messageKey = 'chatbot_proactive_coming_soon';
        } else if (pageKey === 'presale') {
            messageKey = 'chatbot_proactive_presale';
        } else if (pageKey === 'donations') {
            messageKey = 'chatbot_proactive_donations';
        } else if (comingSoonPages.includes(pageKey)) {
             messageKey = 'chatbot_proactive_coming_soon';
        } else if (pageKey === 'home') {
             if (solana.connected && solana.userTokens.some(t => t.symbol === 'OWFN' && t.balance > 0)) {
                const owfnToken = solana.userTokens.find(t => t.symbol === 'OWFN');
                const personalizedMessage = t('chatbot_proactive_staking_personalized', { amount: owfnToken!.balance.toLocaleString() });
                setProactiveMessage(personalizedMessage);
            } else {
                messageKey = 'chatbot_proactive_home';
            }
        } else {
             messageKey = 'chatbot_proactive_generic';
        }
        
        const messageText = proactiveMessage || (messageKey ? t(messageKey) : null);

        if (messageText) {
            setProactiveMessage(messageText);
            const timer = setTimeout(() => {
                // Only show the bubble if the chat is not already open
                if (!isOpen) {
                    setIsBubbleVisible(true);
                }
                sessionStorage.setItem(storageKey, 'true');
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [location, isOpen, solana.connected, solana.userTokens, t, proactiveMessage]);


     // Action parsing for guided flows
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'model' && !lastMessage.isActionProcessed) {
            const text = lastMessage.parts[0].text;
            const actionMatch = text.match(/^\[ACTION:([^|\]]+)\|?(.*)\]$/);
            
            if (actionMatch) {
                const action = actionMatch[1];
                const paramsStr = actionMatch[2];
                const params = new URLSearchParams(paramsStr.replace(/\|/g, '&'));

                let url = '';
                let confirmationMessage = '';
                
                if (action === 'NAVIGATE_DONATE') {
                    const token = params.get('TOKEN');
                    const amount = params.get('AMOUNT');
                    if (token && amount) {
                        url = `/donations?token=${token}&amount=${amount}`;
                        confirmationMessage = t('chatbot_donation_guide_prefilled', { amount, token });
                    }
                } else if (action === 'NAVIGATE_PRESALE') {
                    const amount = params.get('AMOUNT');
                    if (amount) {
                        url = `/presale?amount=${amount}`;
                        confirmationMessage = t('chatbot_presale_guide_prefilled', { amount });
                    }
                }
                
                if (url && confirmationMessage) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const processedMessage = { ...newMessages[newMessages.length - 1], isActionProcessed: true };
                        processedMessage.parts = [{ text: confirmationMessage }];
                        newMessages[newMessages.length - 1] = processedMessage;
                        return newMessages;
                    });
                    
                    setTimeout(() => {
                        setLocation(url);
                        if (window.innerWidth < 768) setIsOpen(false);
                    }, 2000);
                }
            }
        }
    }, [messages, setLocation, t]);

    const formatTimestamp = (date: Date) => {
        return date.toLocaleString(currentLanguage.code, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }], timestamp: new Date() };
        const historyForApi = messages.slice(-MAX_HISTORY_MESSAGES);
        const currentInput = input;
        const currentTime = new Date().toISOString();
        const pageName = (location.split('/')[1] || 'home').charAt(0).toUpperCase() + (location.split('/')[1] || 'home').slice(1);
        const walletContext = solana.connected ? {
            address: solana.address,
            userTokens: solana.userTokens.map(({ symbol, balance }) => ({ symbol, balance }))
        } : null;

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const loadingMessages = [ t('chatbot_loading_1'), t('chatbot_loading_2'), t('chatbot_loading_3') ];
        let index = 0;
        const updateLoadingText = () => { setLoadingText(loadingMessages[index]); index = (index + 1) % loadingMessages.length; };
        
        updateLoadingText();
        loadingIntervalRef.current = window.setInterval(updateLoadingText, 2500);

        try {
            let firstChunkReceived = false;
            await getChatbotResponse(
                historyForApi, currentInput, currentLanguage.code, currentTime, pageName, walletContext,
                (chunk) => {
                    if (loadingIntervalRef.current) {
                        window.clearInterval(loadingIntervalRef.current);
                        loadingIntervalRef.current = null;
                        setIsLoading(false);
                    }
                    if (!firstChunkReceived) {
                        setMessages(prev => [...prev, { role: 'model', parts: [{ text: chunk }], timestamp: new Date() }]);
                        firstChunkReceived = true;
                    } else {
                         setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && lastMessage.role === 'model') {
                                lastMessage.parts[0].text += chunk;
                            }
                            return newMessages;
                        });
                    }
                },
                (errorMsg) => {
                    if (loadingIntervalRef.current) {
                        window.clearInterval(loadingIntervalRef.current);
                        loadingIntervalRef.current = null;
                    }
                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorMsg }], timestamp: new Date() }]);
                }
            );
        } catch (error) {
            console.error("Chatbot stream failed:", error);
            if (loadingIntervalRef.current) { window.clearInterval(loadingIntervalRef.current); loadingIntervalRef.current = null; }
             setMessages(prev => [...prev, { role: 'model', parts: [{ text: t('chatbot_error') }], timestamp: new Date() }]);
        } finally {
            if (loadingIntervalRef.current) { window.clearInterval(loadingIntervalRef.current); loadingIntervalRef.current = null; }
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };
    
    const openChatAndHideBubble = () => {
        setIsOpen(true);
        setIsBubbleVisible(false);

        if (!hasBeenOpened && proactiveMessage) {
            const proactiveChatMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: proactiveMessage }],
                timestamp: new Date()
            };
            // Add the proactive message to the start of the conversation if it's not already there
            if (!messages.some(m => m.parts[0].text === proactiveMessage)) {
                setMessages(prev => [proactiveChatMessage, ...prev]);
            }
        }
        setHasBeenOpened(true);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSend(); };
    
    if (!isOpen) {
        return (
            <>
                {isBubbleVisible && (
                    <div 
                        className="fixed bottom-24 right-5 max-w-[calc(100vw-40px)] sm:max-w-xs w-full bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg p-4 animate-fade-in-up z-50 cursor-pointer"
                        onClick={openChatAndHideBubble}
                        role="alert"
                        aria-live="assertive"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsBubbleVisible(false); }}
                            className="absolute top-2 right-2 p-1 text-primary-400 dark:text-darkPrimary-500 hover:text-primary-700 dark:hover:text-darkPrimary-200 rounded-full"
                            aria-label="Dismiss message"
                        >
                            <X size={16} />
                        </button>
                        <p className="text-sm text-primary-800 dark:text-darkPrimary-200 pr-4">
                            {proactiveMessage}
                        </p>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-darkPrimary-800 transform rotate-45"></div>
                    </div>
                )}
                <button
                    onClick={openChatAndHideBubble}
                    className="fixed bottom-5 right-5 bg-accent-500 dark:bg-darkAccent-600 text-white p-4 rounded-full shadow-lg hover:bg-accent-600 dark:hover:bg-darkAccent-700 transition-transform transform hover:scale-110"
                    aria-label="Open Chatbot"
                >
                    <MessageCircle size={28} />
                </button>
            </>
        );
    }

    const containerClasses = isMaximized
        ? "fixed inset-0 flex flex-col bg-white dark:bg-darkPrimary-800 z-50 animate-fade-in-up"
        : "fixed bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] flex flex-col bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg animate-slide-in z-50";

    return (
        <div className={containerClasses} style={{ animationDuration: isMaximized ? '200ms' : '500ms' }}>
            <header className="flex items-center justify-between p-4 bg-accent-500 dark:bg-darkAccent-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <OwfnIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" aria-label="Minimize Chat">
                        <Minus size={20} />
                    </button>
                    <button onClick={() => setIsMaximized(prev => !prev)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" aria-label={isMaximized ? "Restore Chat" : "Maximize Chat"}>
                        {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" aria-label="Close Chat">
                        <X size={20} />
                    </button>
                </div>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <OwfnIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
                                <div className="flex flex-col">
                                    {msg.timestamp && (
                                        <p className={`text-xs text-primary-400 dark:text-darkPrimary-500 mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {formatTimestamp(msg.timestamp)}
                                        </p>
                                    )}
                                    <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-br-none' : 'bg-primary-100 text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none'}`}>
                                       <div className="text-sm whitespace-pre-wrap">
                                           {msg.role === 'model' ? renderMessageContent(msg.parts[0].text) : msg.parts[0].text}
                                       </div>
                                    </div>
                                </div>
                                {msg.role === 'user' && <User className="w-6 h-6 text-accent-500 dark:text-darkAccent-400 flex-shrink-0 mt-1" />}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                            <OwfnIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                            <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-xl bg-primary-100 text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none">
                                <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-darkPrimary-300">
                                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                    <span>{loadingText}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-primary-200 dark:border-darkPrimary-700">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatbot_placeholder')}
                        className="w-full p-3 pr-20 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-500 dark:bg-darkAccent-600 text-white p-2 rounded-md hover:bg-accent-600 dark:hover:bg-darkAccent-700 disabled:bg-primary-300 dark:disabled:bg-darkPrimary-600 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                       {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} /> }
                    </button>
                </div>
            </div>
        </div>
    );
};