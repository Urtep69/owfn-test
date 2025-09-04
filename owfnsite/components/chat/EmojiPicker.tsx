import React from 'react';

const EMOJIS = [
  '😀', '😂', '❤️', '👍', '🙏', '🎉', '🔥', '🚀', '🤔', '😊', '😍', '😭',
  '😎', '🤯', '🥳', '💯', '🙌', '👀', '👋', '👏', '💔', '👌', ' HOPA', 'SOL'
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
    return (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-darkPrimary-700 rounded-lg shadow-lg border border-primary-200 dark:border-darkPrimary-600 p-2 z-20">
            <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="p-2 text-2xl rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-600 transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}