import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Loader2 } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService.ts';
import type { ChatMessage } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';

const MAX_HISTORY_MESSAGES = 8; // Keep last 4 user/model pairs for context to prevent memory errors on the server.

export const Chatbot = () => {
    const { t, currentLanguage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
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

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        const historyForApi = messages.slice(-MAX_HISTORY_MESSAGES);
        const currentInput = input;

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
            let fullResponse = '';
            let firstChunkReceived = false;

            await getChatbotResponse(
                historyForApi,
                currentInput,
                currentLanguage.code,
                (chunk) => { // onChunk: Append text to the last message
                    if (loadingIntervalRef.current) {
                        window.clearInterval(loadingIntervalRef.current);
                        loadingIntervalRef.current = null;
                        setIsLoading(false); // Stop loading animation
                    }
                    if (!firstChunkReceived) {
                        setMessages(prev => [...prev, { role: 'model', parts: [{ text: chunk }] }]);
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
                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorMsg }] }]);
                }
            );
        } catch (error) {
            console.error("Chatbot stream failed:", error);
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
             setMessages(prev => [...prev, { role: 'model', parts: [{ text: t('chatbot_error') }] }]);
        } finally {
            if (loadingIntervalRef.current) {
                window.clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
            setIsLoading(false);
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
        <div className="fixed bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] flex flex-col bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg animate-slide-in z-50">
            <header className="flex items-center justify-between p-4 bg-accent-500 dark:bg-darkAccent-700 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <OwfnIcon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:opacity-75">
                    <X size={24} />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <OwfnIcon className="w-6 h-6 flex-shrink-0 mt-1" />}
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950' : 'bg-primary-100 text-primary-800 dark:bg-darkPrimary-700 dark:text-darkPrimary-200 rounded-bl-none'}`}>
                               <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                            </div>
                            {msg.role === 'user' && <User className="w-6 h-6 text-accent-500 dark:text-darkAccent-400 flex-shrink-0 mt-1" />}
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