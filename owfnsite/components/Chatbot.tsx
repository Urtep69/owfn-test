import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { MessageCircle, X, Send, User, Loader2, Twitter, Minus, Maximize, Shrink } from 'lucide-react';
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
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading, loadingText]);
    
    // Cleanup interval on component unmount
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
        
        updateLoadingText(); // Set initial text immediately
        loadingIntervalRef.current = window.setInterval(updateLoadingText, 2500);

        try {
            let firstChunkReceived = false;

            await getChatbotResponse(
                historyForApi,
                currentInput,
                currentLanguage.code,
                currentTime,
                (chunk) => { // onChunk: Append text to the last message
                    if (loadingIntervalRef.current) {
                        window.clearInterval(loadingIntervalRef.current);
                        loadingIntervalRef.current = null;
                        setIsLoading(false); // Stop loading animation
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
                (errorMsg) => { // onError: Display error in a new message bubble
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
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 bg-accent-500 dark:bg-darkAccent-600 text-white p-4 rounded-full shadow-lg hover:bg-accent-600 dark:hover:bg-darkAccent-700 transition-transform transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <MessageCircle size={28} />
            </button>
        );
    }

    return (
        <div className={`fixed ${isFullScreen ? 'inset-0 w-full h-full max-w-full max-h-full rounded-none' : 'bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] rounded-lg'} flex flex-col bg-white dark:bg-darkPrimary-800 shadow-3d-lg animate-slide-in z-50`}>
            <header className="flex items-center justify-between p-4 bg-accent-500 dark:bg-darkAccent-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <OwfnIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsOpen(false)} className="hover:opacity-75 p-1" title="Minimize" aria-label="Minimize Chat">
                        <Minus size={20} />
                    </button>
                    <button onClick={() => setIsFullScreen(prev => !prev)} className="hover:opacity-75 p-1" title={isFullScreen ? "Restore" : "Maximize"} aria-label={isFullScreen ? "Restore chat window" : "Maximize chat window"}>
                        {isFullScreen ? <Shrink size={20} /> : <Maximize size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:opacity-75 p-1" title="Close" aria-label="Close Chat">
                        <X size={24} />
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