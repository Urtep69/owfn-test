import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
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
    const { t, currentLanguage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [quickReplies, setQuickReplies] = useState<{label: string, value: string}[]>([]);
    const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading, loadingText, quickReplies]);
    
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMaximized]);

    const setWelcomed = () => {
        sessionStorage.setItem('owfn-chatbot-welcomed-session', 'true');
        setShowWelcomeBubble(false);
    };

    // Effect to show the welcome bubble once per session
    useEffect(() => {
        const hasBeenWelcomed = sessionStorage.getItem('owfn-chatbot-welcomed-session');
        if (!hasBeenWelcomed && !isOpen) {
            const timer = setTimeout(() => setShowWelcomeBubble(true), 2000); // 2-second delay
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Effect to populate the welcome message when the chat is opened for the first time in a session
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const hasBeenWelcomedThisSession = sessionStorage.getItem('owfn-chatbot-welcomed-session');
             if (hasBeenWelcomedThisSession) { // It's not the first time ever, but the chat state is empty
                 const reWelcomeMessage: ChatMessage = {
                    role: 'model',
                    parts: [{ text: t('chatbot_placeholder') }],
                    timestamp: new Date()
                };
                setMessages([reWelcomeMessage]);

            } else { // It is the very first time this user is opening the chat in this session
                const welcomeMessage: ChatMessage = {
                    role: 'model',
                    parts: [{ text: t('chatbot_welcome_message') }],
                    timestamp: new Date()
                };
                const initialQuickReplies = [
                    { label: t('chatbot_qr_mission'), value: t('chatbot_qr_mission_q') },
                    { label: t('chatbot_qr_presale'), value: t('chatbot_qr_presale_q') },
                    { label: t('chatbot_qr_impact'), value: t('chatbot_qr_impact_q') },
                ];
                setMessages([welcomeMessage]);
                setQuickReplies(initialQuickReplies);
            }
        }
    }, [isOpen, messages.length, t]);


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

    const handleSend = async (questionOverride?: string) => {
        const currentInput = (questionOverride || input).trim();
        if (currentInput === '' || isLoading) return;

        setQuickReplies([]);
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentInput }], timestamp: new Date() };
        const historyForApi = messages.slice(-MAX_HISTORY_MESSAGES);
        const currentTime = new Date().toISOString();

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
                }
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
    
    const handleQuickReply = (value: string) => {
        handleSend(value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    if (!isOpen) {
        return (
            <>
                 {showWelcomeBubble && (
                    <div className="fixed bottom-24 right-5 w-64 animate-fade-in-up z-40">
                        <div className="bg-accent-500 dark:bg-darkAccent-600 text-white p-3 rounded-lg shadow-lg relative">
                            <button 
                                onClick={setWelcomed} 
                                className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded-full" 
                                aria-label="Dismiss welcome message"
                            >
                                <X size={16} />
                            </button>
                            <p className="text-sm pr-4">{t('chatbot_welcome_bubble', { defaultValue: 'Hello! 👋 Do you have questions about our mission? Ask me anything!'})}</p>
                            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-accent-500 dark:bg-darkAccent-600 transform rotate-45"></div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setWelcomed();
                    }}
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
                     {quickReplies.length > 0 && !isLoading && (
                        <div className="flex flex-wrap justify-start gap-2 pt-2">
                            {quickReplies.map((qr, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickReply(qr.value)}
                                    className="px-3 py-1.5 bg-accent-100 dark:bg-darkAccent-800/50 text-accent-700 dark:text-darkAccent-200 text-sm font-semibold rounded-full hover:bg-accent-200 dark:hover:bg-darkAccent-700 transition-colors"
                                >
                                    {qr.label}
                                </button>
                            ))}
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
                        onClick={() => handleSend()}
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