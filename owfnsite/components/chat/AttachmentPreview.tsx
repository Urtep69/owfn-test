import React from 'react';
import type { Attachment } from '../../types.ts';
import { X, File, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext.tsx';

interface AttachmentPreviewProps {
    attachment: Attachment;
    caption: string;
    onCaptionChange: (caption: string) => void;
    onCancel: () => void;
}

export default function AttachmentPreview({ attachment, caption, onCaptionChange, onCancel }: AttachmentPreviewProps) {
    const { t } = useAppContext();
    return (
        <div className="relative p-2 mb-2 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg border border-primary-200 dark:border-darkPrimary-600 animate-fade-in-up" style={{animationDuration: '200ms'}}>
            <button onClick={onCancel} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                <X size={14} />
            </button>
            <div className="flex items-start gap-3">
                {attachment.type === 'image' ? (
                    <img src={attachment.url} alt={attachment.name} className="w-20 h-20 object-cover rounded-md" />
                ) : (
                    <div className="w-20 h-20 bg-primary-200 dark:bg-darkPrimary-600 rounded-md flex flex-col items-center justify-center text-center p-1">
                        <File size={32} />
                        <p className="text-xs mt-1 truncate w-full">{attachment.name}</p>
                    </div>
                )}
                <div className="flex-1">
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => onCaptionChange(e.target.value)}
                        placeholder={t('community_add_caption') || "Add a caption..."}
                        className="w-full bg-white dark:bg-darkPrimary-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                    />
                     <p className="text-xs text-primary-500 dark:text-darkPrimary-400 mt-1">{attachment.type === 'image' ? t('community_sending_image') : t('community_sending_file')}</p>
                </div>
            </div>
        </div>
    );
}