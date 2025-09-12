import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { MessageCircle, X, Send, User, Loader2, Twitter, Minus, Maximize2, Minimize2, Mail, Check, AlertCircle } from 'lucide-react';
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

const SuggestionChip = ({ text, onSelect }: { text: string; onSelect: (text: string) => void }) => (
    <button
        onClick={() => onSelect(text)}
        className="px-3 py-1.5 bg-primary-100 dark:bg-darkPrimary-700/80 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 rounded-full text-sm font-medium transition-colors"
    >
        {text}
    </button>
);


export const Chatbot = () => {
    const { t, currentLanguage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    
    const getWelcomeMessage = (): ChatMessage => {
        const now = new Date();
        return {
            role: 'model',
            parts: [{ text: t('chatbot_welcome_message', { defaultValue: "Hello! I'm the OWFN Assistant. How can I help you learn about our mission today?" }) }],
            timestamp: now,
            formattedTimestamp: formatTimestamp(now)
        };
    };

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [isEmailFormVisible, setIsEmailFormVisible] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [emailError, setEmailError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading, loadingText]);
    
    useEffect(() => {
        if (isOpen) {
            if (messages.length === 0) {
                setMessages([getWelcomeMessage()]);
            }
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
        });
    };

    const handleSendEmail = async () => {
        if (!recipientEmail.trim() || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
            setEmailError('Please enter a valid email address.');
            setEmailStatus('error');
            return;
        }
        setEmailStatus('loading');
        setEmailError('');

        try {
            const res = await fetch('/api/email-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipientEmail, 
                    messages,
                    langCode: currentLanguage.code 
                }),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            setEmailStatus('success');
            setTimeout(() => {
                setIsEmailFormVisible(false);
                setEmailStatus('idle');
                setRecipientEmail('');
            }, 3000);

        } catch (error) {
            console.error("Failed to send chat email:", error);
            setEmailError('Failed to send email. Please try again.');
            setEmailStatus('error');
        }
    };


    const handleSend = async (questionToSend?: string) => {
        const currentInput = questionToSend || input;
        if (currentInput.trim() === '' || isLoading) return;

        const now = new Date();
        const userMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: currentInput }],
            timestamp: now,
            formattedTimestamp: formatTimestamp(now)
        };
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
            let firstChunkTime: Date | null = null;

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
                        firstChunkTime = new Date();
                        setMessages(prev => [...prev, {
                            role: 'model',
                            parts: [{ text: chunk }],
                            timestamp: firstChunkTime,
                            formattedTimestamp: formatTimestamp(firstChunkTime)
                        }]);
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
                    const errorTime = new Date();
                    setMessages(prev => [...prev, {
                        role: 'model',
                        parts: [{ text: errorMsg }],
                        timestamp: errorTime,
                        formattedTimestamp: formatTimestamp(errorTime)
                    }]);
                }
            );
        } catch (error) {
            console.error("Chatbot stream failed:", error);
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
            const errorTime = new Date();
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: t('chatbot_error') }],
                timestamp: errorTime,
                formattedTimestamp: formatTimestamp(errorTime)
            }]);
        } finally {
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };
    
    const handleSuggestionClick = (text: string) => {
        handleSend(text);
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

    const containerClasses = isMaximized
        ? "fixed inset-0 flex flex-col bg-white dark:bg-darkPrimary-800 z-50 animate-fade-in-up"
        : "fixed bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] flex flex-col bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg animate-slide-in z-50";

    const showSuggestions = messages.length === 1; // Only show after the initial welcome message
    const isInputDisabled = isLoading;

    return (
        <div className={containerClasses} style={{ animationDuration: isMaximized ? '200ms' : '500ms' }}>
            <header className="flex items-center justify-between p-4 bg-accent-500 dark:bg-darkAccent-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <OwfnIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsEmailFormVisible(prev => !prev)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" aria-label="Email conversation">
                        <Mail size={20} />
                    </button>
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
                        <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role === 'model' ? <OwfnIcon className="w-6 h-6" /> : <User className="w-6 h-6 text-accent-500 dark:text-darkAccent-400" />}
                                {msg.formattedTimestamp && (
                                    <p className="text-xs text-primary-400 dark:text-darkPrimary-500">
                                        {msg.formattedTimestamp}
                                    </p>
                                )}
                            </div>
                            <div className={`mt-1 max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-br-none mr-8' : 'bg-primary-100 text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none ml-8'}`}>
                                <div className="text-sm whitespace-pre-wrap">
                                    {msg.role === 'model' ? renderMessageContent(msg.parts[0].text) : msg.parts[0].text}
                                </div>
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
            {isEmailFormVisible && (
                <div className="p-4 border-t border-primary-200 dark:border-darkPrimary-700 bg-primary-50 dark:bg-darkPrimary-700/50 animate-fade-in-up" style={{animationDuration: '300ms'}}>
                    <h4 className="font-semibold text-sm mb-2 text-center text-primary-800 dark:text-darkPrimary-200">Email this conversation</h4>
                    {emailStatus === 'success' ? (
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold p-2 bg-green-500/10 rounded-md">
                            <Check size={18} /> Conversation sent successfully!
                        </div>
                    ) : (
                         <div className="space-y-3">
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="Enter your email address..."
                                className="w-full p-2 text-sm bg-primary-100 dark:bg-darkPrimary-700 rounded-md focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                                disabled={emailStatus === 'loading'}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setIsEmailFormVisible(false)} className="flex-1 text-sm py-2 px-3 rounded-md bg-primary-200 dark:bg-darkPrimary-600 hover:bg-primary-300 dark:hover:bg-darkPrimary-500 transition-colors">Cancel</button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={emailStatus === 'loading' || !recipientEmail}
                                    className="flex-1 text-sm py-2 px-3 rounded-md bg-accent-500 dark:bg-darkAccent-600 text-white hover:bg-accent-600 dark:hover:bg-darkAccent-700 disabled:bg-primary-300 dark:disabled:bg-darkPrimary-600 flex items-center justify-center"
                                >
                                    {emailStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                                </button>
                            </div>
                            {emailStatus === 'error' && (
                                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5"><AlertCircle size={14}/> {emailError}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            <div className="p-4 border-t border-primary-200 dark:border-darkPrimary-700">
                 {showSuggestions && (
                    <div className="flex flex-wrap gap-2 mb-3 animate-fade-in-up">
                        <SuggestionChip text={t('chatbot_suggestion_1', { defaultValue: 'What is OWFN?' })} onSelect={handleSuggestionClick} />
                        <SuggestionChip text={t('chatbot_suggestion_2', { defaultValue: 'How do I buy?' })} onSelect={handleSuggestionClick} />
                        <SuggestionChip text={t('chatbot_suggestion_3', { defaultValue: 'Tell me about bonuses.' })} onSelect={handleSuggestionClick} />
                    </div>
                )}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatbot_placeholder')}
                        className="w-full p-3 pr-20 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none disabled:cursor-wait"
                        disabled={isInputDisabled}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isInputDisabled || input.trim() === ''}
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