import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService.ts';
import type { ChatMessage } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';

export const Chatbot = () => {
    const { t, currentLanguage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponseText = await getChatbotResponse(messages, input, currentLanguage.code);
            const botMessage: ChatMessage = { role: 'model', parts: [{ text: botResponseText }] };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: t('chatbot_error') }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
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
                className="fixed bottom-5 right-5 bg-accent-600 text-white p-4 rounded-full shadow-lg hover:bg-accent-700 transition-transform transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <MessageCircle size={28} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 w-full max-w-sm h-full max-h-[70vh] flex flex-col bg-primary-800 rounded-lg shadow-3d-lg animate-slide-in z-50">
            <header className="flex items-center justify-between p-4 bg-accent-700 text-white rounded-t-lg">
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
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-accent-500 text-primary-950' : 'bg-primary-700 text-primary-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.parts[0].text}</p>
                            </div>
                            {msg.role === 'user' && <User className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <OwfnIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                            <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-xl bg-primary-700 text-primary-200 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-primary-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatbot_placeholder')}
                        className="w-full p-3 pr-20 bg-primary-700 rounded-lg focus:ring-2 focus:ring-accent-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-600 text-white p-2 rounded-md hover:bg-accent-700 disabled:bg-primary-600 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                       {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} /> }
                    </button>
                </div>
            </div>
        </div>
    );
};
