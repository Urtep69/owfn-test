
import React, { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Settings, Newspaper, HeartHandshake, Loader2, Wand2, Languages } from 'lucide-react';
import type { SocialCase, BlogPost } from '../types.ts';
import { ADMIN_WALLET_ADDRESS, SUPPORTED_LANGUAGES } from '../constants.ts';
import { GEO_DATA } from '../lib/geodata.ts';
import { translateText } from '../services/geminiService.ts';

// Main Admin Page Component
export default function Admin() {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState<'cases' | 'blog'>('cases');

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400 flex items-center justify-center md:justify-start gap-3">
                    <Settings size={36} /> {t('admin_panel')}
                </h1>
                <p className="mt-2 text-lg text-primary-600 dark:text-darkPrimary-400">{t('admin_panel_desc')}</p>
            </div>

            <div className="border-b border-primary-200 dark:border-darkPrimary-700 flex">
                <button 
                    onClick={() => setActiveTab('cases')} 
                    className={`flex items-center gap-2 py-3 px-6 font-semibold transition-colors ${activeTab === 'cases' ? 'border-b-2 border-accent-500 text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400'}`}
                >
                    <HeartHandshake size={18} /> {t('manage_social_cases')}
                </button>
                <button 
                    onClick={() => setActiveTab('blog')} 
                    className={`flex items-center gap-2 py-3 px-6 font-semibold transition-colors ${activeTab === 'blog' ? 'border-b-2 border-accent-500 text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400'}`}
                >
                    <Newspaper size={18} /> {t('manage_blog_posts')}
                </button>
            </div>

            <div>
                {activeTab === 'cases' && <ManageSocialCases />}
                {activeTab === 'blog' && <ManageBlogPosts />}
            </div>
        </div>
    );
}

// Placeholder for managing Social Cases
const ManageSocialCases = () => {
    const { t, socialCases, setSocialCases } = useAppContext();
    // In a real app, you'd have functions to edit/delete cases.
    // For now, we'll just show the list and add functionality.

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{t('current_social_cases')}</h2>
            {/* List of cases would go here */}
            <p>{t('feature_under_development')}</p>
        </div>
    );
};


// Placeholder for managing Blog Posts
const ManageBlogPosts = () => {
    const { t, blogPosts, setBlogPosts } = useAppContext();
    // Similar to cases, list and manage posts here.

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{t('current_blog_posts')}</h2>
            {/* List of posts would go here */}
            <p>{t('feature_under_development')}</p>
        </div>
    );
};
