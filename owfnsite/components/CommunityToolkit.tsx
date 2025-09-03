
import React, { useState, useEffect, useCallback } from 'react';
import { Repeat, Copy, Check, Twitter, Loader2, Send } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { PROJECT_LINKS } from '../constants.ts';
import { FacebookIcon } from './IconComponents.tsx';

export const CommunityToolkit = () => {
    const { t, currentLanguage } = useAppContext();
    const [post, setPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePost = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ langCode: currentLanguage.code }),
            });
            if (response.ok) {
                const data = await response.json();
                setPost(data.post);
            } else {
                setPost(t('community_toolkit_error_message', { defaultValue: "Failed to generate post. Please try again."}));
            }
        } catch (error) {
            console.error("Failed to fetch post:", error);
            setPost(t('community_toolkit_error_message_network', { defaultValue: "An error occurred. Please try again."}));
        } finally {
            setLoading(false);
        }
    }, [currentLanguage.code, t]);

    useEffect(() => {
        generatePost();
    }, [generatePost]);

    const handleCopy = () => {
        navigator.clipboard.writeText(post);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: 'x' | 'telegram' | 'facebook') => {
        const url = PROJECT_LINKS.website;
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(post);
        let shareUrl = '';

        switch (platform) {
            case 'x':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'facebook':
                // The 'quote' parameter is unreliable for pre-filling text on Facebook.
                // Sharing just the URL is more robust and ensures Facebook's crawler
                // correctly generates a preview with the site's title, description, and logo.
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <section className="container mx-auto animate-scroll">
            <div className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-3d-lg perspective-1000">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-serif text-primary-900 dark:text-darkPrimary-100 mb-2">{t('community_toolkit_title')}</h2>
                    <p className="max-w-3xl mx-auto text-primary-600 dark:text-darkPrimary-300">{t('community_toolkit_subtitle')}</p>
                </div>

                <div className="mt-6 bg-primary-100 dark:bg-darkPrimary-900/50 p-6 rounded-xl shadow-inner-3d min-h-[150px] flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-accent-500 dark:text-darkAccent-400" />
                    ) : (
                        <p className="text-lg text-primary-800 dark:text-darkPrimary-200 text-center font-serif leading-relaxed animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                            {post}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={generatePost} disabled={loading} className="flex items-center gap-2 font-semibold bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm border-2 border-accent-400 text-accent-500 dark:border-darkAccent-500 dark:text-darkAccent-500 py-2.5 px-6 rounded-full hover:bg-accent-400/20 dark:hover:bg-darkAccent-500/20 transition-all transform hover:-translate-y-0.5 shadow-3d hover:shadow-3d-lg btn-tactile disabled:opacity-50">
                        <Repeat size={18} /> {t('community_toolkit_generate_button')}
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <button onClick={handleCopy} disabled={!post || loading} className="flex items-center gap-2 font-semibold bg-primary-200 dark:bg-darkPrimary-700 py-2.5 px-6 rounded-full hover:bg-primary-300 dark:hover:bg-darkPrimary-600 transition-all transform hover:-translate-y-0.5 shadow-3d hover:shadow-3d-lg btn-tactile disabled:opacity-50">
                            {copied ? <><Check size={18} className="text-green-500" /> {t('community_toolkit_copied_button')}</> : <><Copy size={18} /> {t('community_toolkit_copy_button')}</>}
                        </button>

                        <div className="flex items-center gap-2 bg-primary-200/50 dark:bg-darkPrimary-700/50 p-1.5 rounded-full shadow-inner-3d">
                            <button onClick={() => handleShare('x')} disabled={!post || loading} aria-label={t('community_toolkit_share_x_aria')} className="p-2.5 rounded-full bg-gray-700 text-white hover:bg-black transition-colors transform disabled:bg-gray-400 dark:disabled:bg-gray-600 btn-tactile">
                                <Twitter size={18} />
                            </button>
                            <button onClick={() => handleShare('telegram')} disabled={!post || loading} aria-label={t('community_toolkit_share_telegram_aria')} className="p-2.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors transform disabled:bg-sky-300 dark:disabled:bg-sky-700 btn-tactile">
                                <Send size={18} />
                            </button>
                            <button onClick={() => handleShare('facebook')} disabled={!post || loading} aria-label={t('community_toolkit_share_facebook_aria')} className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors transform disabled:bg-blue-400 dark:disabled:bg-blue-800 btn-tactile">
                                <FacebookIcon className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};