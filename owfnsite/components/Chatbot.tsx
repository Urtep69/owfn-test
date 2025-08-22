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
        if (match.index > lastIndex) {
            result.push(text.substring(lastIndex, match.index));
        }
        
        if (match[1] === 'Visit Page') {
            const pageName = match[2];
            const path = pageNameToPath[pageName];
            if (path) {
                result.push(
                    <Link key={match.index} href={path} className="text-accent-light font-bold underline hover:opacity-80">
                        {pageName}
                    </Link>
                );
            } else {
                result.push(`[Visit Page: ${pageName}]`);
            }
        } else if (match[3] === 'Social Link') {
            const platformName = match[4];
            const url = match[5];
            const icon = socialIconMap[platformName];
            if (url && platformName) {
                 result.push(
                    <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-accent-light font-bold underline hover:opacity-80 inline-flex items-center gap-1.5">
                        {icon} {platformName}
                    </a>
                );
            } else {
                 result.push(`[Social Link: ${platformName}|${url}]`);
            }
        }

        lastIndex = regex.lastIndex;
    }

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

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
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }], timestamp: new Date() };
        const historyForApi = messages.slice(-MAX_HISTORY_MESSAGES);
        const currentInput = input;
        const currentTime = new Date().toISOString();

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const loadingMessages = [
            t('chatbot_loading_1'), t('chatbot_loading_2'), t('chatbot_loading_3'),
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
                historyForApi, currentInput, currentLanguage.code, currentTime,
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
                            if (lastMessage?.role === 'model') {
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
        if (e.key === 'Enter') handleSend();
    };
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 bg-accent-light text-accent-foreground p-4 rounded-full shadow-glow-accent hover:bg-accent-hover transition-transform transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <MessageCircle size={28} />
            </button>
        );
    }

    const containerClasses = isMaximized
        ? "fixed inset-0 flex flex-col bg-background z-50 animate-fade-in-up"
        : "fixed bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] flex flex-col bg-surface-dark rounded-lg shadow-glow-lg animate-slide-in z-50 border border-border-color";

    return (
        <div className={containerClasses} style={{ animationDuration: isMaximized ? '200ms' : '500ms' }}>
            <header className="flex items-center justify-between p-4 bg-accent-light text-accent-foreground rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <OwfnIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-black/20 rounded-full transition-colors" aria-label="Minimize Chat"> <Minus size={20} /> </button>
                    <button onClick={() => setIsMaximized(prev => !prev)} className="p-1.5 hover:bg-black/20 rounded-full transition-colors" aria-label={isMaximized ? "Restore Chat" : "Maximize Chat"}>
                        {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-black/20 rounded-full transition-colors" aria-label="Close Chat"> <X size={20} /> </button>
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
                                        <p className={`text-xs text-text-secondary mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {formatTimestamp(msg.timestamp)}
                                        </p>
                                    )}
                                    <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-accent-light text-accent-foreground rounded-br-none' : 'bg-surface-light text-text-primary rounded-bl-none'}`}>
                                       <div className="text-sm whitespace-pre-wrap">
                                           {msg.role === 'model' ? renderMessageContent(msg.parts[0].text) : msg.parts[0].text}
                                       </div>
                                    </div>
                                </div>
                                {msg.role === 'user' && <User className="w-6 h-6 text-accent-light flex-shrink-0 mt-1" />}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                            <OwfnIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                            <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-xl bg-surface-light text-text-primary rounded-bl-none">
                                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                                    <span>{loadingText}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-border-color">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text" value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress} placeholder={t('chatbot_placeholder')}
                        className="w-full p-3 pr-20 bg-surface-light rounded-lg focus:ring-2 focus:ring-accent-light focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-light text-accent-foreground p-2 rounded-md hover:bg-accent-hover disabled:bg-surface-dark disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                       {isLoading ? <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></div> : <Send size={20} /> }
                    </button>
                </div>
            </div>
        </div>
    );
};