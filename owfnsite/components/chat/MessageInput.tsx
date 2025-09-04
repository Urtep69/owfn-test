import React, { useState, useEffect, useRef } from 'react';
import type { ChatConversation, CommunityMessage, Attachment } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Send, MessageSquare, Edit3, X, Paperclip, Smile, Image, File, Camera } from 'lucide-react';
import EmojiPicker from './EmojiPicker.tsx';
import AttachmentPreview from './AttachmentPreview.tsx';

interface MessageInputProps {
    chat: ChatConversation;
    replyingTo: CommunityMessage | null;
    editingMessage: CommunityMessage | null;
    onCancelReply: () => void;
    onCancelEdit: () => void;
}

export default function MessageInput({ chat, replyingTo, editingMessage, onCancelReply, onCancelEdit }: MessageInputProps) {
    const { sendMessage, editMessage, communityUsers, setUserTyping, t } = useAppContext();
    const [input, setInput] = useState('');
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [isAttachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (editingMessage) {
            setInput(editingMessage.content);
        } else {
            setInput('');
        }
    }, [editingMessage]);
    
    // Typing indicator logic
    const typingTimeoutRef = useRef<number | null>(null);
    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (input) {
            setUserTyping(chat.id, true);
            typingTimeoutRef.current = window.setTimeout(() => {
                setUserTyping(chat.id, false);
            }, 3000);
        } else {
            setUserTyping(chat.id, false);
        }
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setUserTyping(chat.id, false);
        }
    }, [input, chat.id, setUserTyping]);


    // Click outside handlers for popovers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setEmojiPickerOpen(false);
            }
             if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
                setAttachmentMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = async () => {
        if (input.trim() === '' && !attachment) return;

        if (editingMessage) {
            editMessage(chat.id, editingMessage.id, input);
            onCancelEdit();
        } else {
            sendMessage(chat.id, input, attachment || undefined, replyingTo?.id);
            onCancelReply();
        }
        
        setInput('');
        setAttachment(null);
        setEmojiPickerOpen(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAttachment({
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: e.target?.result as string,
                    name: file.name,
                    size: file.size,
                });
            };
            reader.readAsDataURL(file);
        }
        setAttachmentMenuOpen(false);
        // Reset input value to allow selecting the same file again
        event.target.value = '';
    };

    const repliedToUser = communityUsers.find(u => u.id === replyingTo?.senderId);
    
    return (
        <div className="p-4 bg-primary-50 dark:bg-darkPrimary-800 border-t border-primary-200 dark:border-darkPrimary-700">
            {attachment && (
                <AttachmentPreview attachment={attachment} onCancel={() => setAttachment(null)} onCaptionChange={setInput} caption={input} />
            )}
            {replyingTo && !attachment && (
                <div className="flex justify-between items-center px-3 py-1.5 mb-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md text-sm animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare size={16} className="text-primary-500 dark:text-darkPrimary-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="font-bold text-primary-700 dark:text-darkPrimary-300">Răspuns către {repliedToUser?.username}</p>
                            <p className="truncate text-primary-600 dark:text-darkPrimary-400 text-xs">{replyingTo.content}</p>
                        </div>
                    </div>
                    <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={14} /></button>
                </div>
            )}
            {editingMessage && !attachment && (
                 <div className="flex justify-between items-center px-3 py-1.5 mb-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md text-sm animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="flex items-center gap-2">
                        <Edit3 size={16} className="text-primary-500 dark:text-darkPrimary-400" />
                        <p className="font-bold text-primary-700 dark:text-darkPrimary-300">{t('action_edit')}...</p>
                    </div>
                    <button onClick={onCancelEdit} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X size={14} /></button>
                </div>
            )}
           
            <div className="relative">
                <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .zip, .rar" />
                    <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
                    
                    <button onClick={() => setAttachmentMenuOpen(p => !p)} className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-600">
                         <Paperclip size={20} />
                    </button>

                    {isAttachmentMenuOpen && (
                        <div ref={attachmentMenuRef} className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-darkPrimary-700 rounded-lg shadow-lg border border-primary-200 dark:border-darkPrimary-600 p-2 z-20">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-600"><File size={18}/> {t('community_upload_file')}</button>
                            <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-600"><Camera size={18}/> {t('community_take_photo')}</button>
                        </div>
                    )}

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={attachment ? t('community_add_caption') : `${t('community_message_to', {name: chat.name || ''})}...`}
                        className="w-full bg-white dark:bg-darkPrimary-700 rounded-lg py-3 pl-12 pr-24 focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                        autoFocus
                    />
                     <div className="absolute right-12 top-1/2 -translate-y-1/2" ref={emojiPickerRef}>
                        <button onClick={() => setEmojiPickerOpen(p => !p)} className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-600">
                            <Smile size={20} />
                        </button>
                        {isEmojiPickerOpen && <EmojiPicker onSelect={(emoji) => setInput(prev => prev + emoji)} />}
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={!input.trim() && !attachment}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-accent-500 text-white p-2 rounded-full hover:bg-accent-600 disabled:bg-primary-300 dark:disabled:bg-darkPrimary-600 disabled:cursor-not-allowed transition-transform transform active:scale-90"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}