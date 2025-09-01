import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    const regex = /\[(Visit Page): (.*?)\]|\[(Social Link): (.*?)\|(.*?)\]|\[(Action: Navigate)\|(.*?)\|(.*?)\]/g;
    const result: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            result.push(text.substring(lastIndex, match.index));
        }
        
        const [fullMatch, visitPage, pageName, socialLink, platformName, url, actionNavigate, buttonText, path] = match;

        if (visitPage === 'Visit Page') {
            const resolvedPath = pageNameToPath[pageName];
            if (resolvedPath) {
                result.push(
                    <Link key={match.index} href={resolvedPath} className="text-accent-600 dark:text-darkAccent-400 font-bold underline hover:opacity-80">
                        {pageName}
                    </Link>
                );
            } else {
                result.push(`[Visit Page: ${pageName}]`); // Fallback
            }
        } else if (socialLink === 'Social Link') {
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
        } else if (actionNavigate === 'Action: Navigate') {
             result.push(
                <Link key={match.index} href={path}>
                    <a className="inline-block mt-2 bg-accent-500 text-white dark:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-600 dark:hover:bg-darkAccent-700 transition-colors btn-tactile">
                       {buttonText}
                    </a>
                </Link>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    return <>{result.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};


export const Chatbot = () => {
    const { t, currentLanguage, solana } = useAppContext();
    const [location] = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

     useEffect(() => {
        if (isOpen) {
            setProactiveMessage(null);
            return;
        }

        const proactiveMessages: Record<string, string> = {
            '/presale': t('chatbot_proactive_presale'),
            '/donations': t('chatbot_proactive_donations'),
        };
        const message = proactiveMessages[location];
        const key = `owfn-proactive-${location}`;

        if (message && !sessionStorage.getItem(key)) {
            const timer = setTimeout(() => {
                if (!isOpen) { // Check again in case user opened chat during timeout
                    setProactiveMessage(message);
                }
            }, 3000); // 3-second delay
            return () => clearTimeout(timer);
        }
    }, [location, t, isOpen]);

    const handleDismissProactive = () => {
        setProactiveMessage(null);
        const key = `owfn-proactive-${location}`;
        sessionStorage.setItem(key, 'true');
    };

    const handleOpenChat = (initialMessage?: string) => {
        setIsOpen(true);
        if (proactiveMessage) {
            setMessages([{ role: 'model', parts: [{ text: proactiveMessage }], timestamp: new Date() }]);
            setProactiveMessage(null);
            const key = `owfn-proactive-${location}`;
            sessionStorage.setItem(key, 'true');
        } else if (initialMessage) {
            setMessages([{ role: 'model', parts: [{ text: initialMessage }], timestamp: new Date() }]);
        }
    };

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
        
        const walletData = solana.connected ? solana.userTokens.map(t => ({ symbol: t.symbol, balance: t.balance })) : null;

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const loadingMessages = [
            t('chatbot_loading_1'),
            t('chatbot_loading_2'),
            t('chatbot_loading_3'),
        ];
        let index = 0;
        
        const updateLoadingText = () => {
            setLoadingText(loadingMessages[index]);
            index = (index + 1) % loadingMessages.length;
        };
        
        updateLoadingText();
        loadingIntervalRef.current = window.setInterval(updateLoadingText, 2500);

        try {
            let firstChunkReceived = false;

            await getChatbotResponse(
                historyForApi,
                currentInput,
                currentLanguage.code,
                currentTime,
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
                },
                location,
                walletData
            );
        } catch (error) {
            console.error("Chatbot stream failed:", error);
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
             setMessages(prev => [...prev, { role: 'model', parts: [{ text: t('chatbot_error') }], timestamp: new Date() }]);
        } finally {
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    if (!isOpen) {
        return (
            <>
            {proactiveMessage && (
                 <div className="fixed bottom-24 right-5 w-72 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg p-4 text-sm z-50 animate-fade-in-up cursor-pointer" onClick={() => handleOpenChat(proactiveMessage)}>
                    <button onClick={(e) => { e.stopPropagation(); handleDismissProactive(); }} className="absolute top-1 right-1 p-1 text-primary-400 hover:text-primary-600 dark:text-darkPrimary-500 dark:hover:text-darkPrimary-300">
                        <X size={16} />
                    </button>
                    <div className="flex items-start gap-3">
                        <OwfnIcon className="w-8 h-8 flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-bold mb-1">{t('chatbot_title')}</p>
                            <p>{proactiveMessage}</p>
                        </div>
                    </div>
                </div>
            )}
            <button
                onClick={() => handleOpenChat()}
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
                                           {renderMessageContent(msg.parts[0].text)}
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