import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Settings, Newspaper, HeartHandshake, PlusCircle } from 'lucide-react';
import type { SocialCase, BlogPost } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';

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

            <div className="border-b border-primary-200 dark:border-darkPrimary-700 flex space-x-2">
                <button 
                    onClick={() => setActiveTab('cases')} 
                    className={`flex items-center gap-2 py-3 px-4 font-semibold transition-colors rounded-t-lg ${activeTab === 'cases' ? 'border-b-2 border-accent-500 text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-100 dark:hover:bg-darkPrimary-800'}`}
                >
                    <HeartHandshake size={18} /> {t('manage_social_cases')}
                </button>
                <button 
                    onClick={() => setActiveTab('blog')} 
                    className={`flex items-center gap-2 py-3 px-4 font-semibold transition-colors rounded-t-lg ${activeTab === 'blog' ? 'border-b-2 border-accent-500 text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-100 dark:hover:bg-darkPrimary-800'}`}
                >
                    <Newspaper size={18} /> {t('manage_blog_posts')}
                </button>
            </div>

            <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                {activeTab === 'cases' && <ManageSocialCases />}
                {activeTab === 'blog' && <ManageBlogPosts />}
            </div>
        </div>
    );
}

const ManageSocialCases = () => {
    const { t, socialCases, currentLanguage } = useAppContext();

    return (
        <div className="bg-white dark:bg-darkPrimary-900 p-6 rounded-lg shadow-3d">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('current_social_cases')}</h2>
                <button className="flex items-center gap-2 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">
                    <PlusCircle size={20} /> {t('create_new_case')}
                </button>
            </div>
            <div className="space-y-4">
                {socialCases.length > 0 ? socialCases.map(item => (
                    <div key={item.id} className="bg-primary-50 dark:bg-darkPrimary-800 p-4 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{item.title[currentLanguage.code] || item.title['en']}</p>
                            <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{t('category')}: {item.category} | {t('status_active')}</p>
                        </div>
                        <div className="flex gap-2">
                           <button className="text-xs font-semibold py-1 px-3 rounded-md bg-primary-200 hover:bg-primary-300 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600">Edit</button>
                           <button className="text-xs font-semibold py-1 px-3 rounded-md bg-red-500/20 text-red-600 hover:bg-red-500/30">Delete</button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-4 text-primary-500 dark:text-darkPrimary-400">{t('feature_under_development')}</p>
                )}
            </div>
        </div>
    );
};


const ManageBlogPosts = () => {
    const { t, blogPosts, currentLanguage } = useAppContext();

    return (
        <div className="bg-white dark:bg-darkPrimary-900 p-6 rounded-lg shadow-3d">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('current_blog_posts')}</h2>
                 <button className="flex items-center gap-2 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">
                    <PlusCircle size={20} /> {t('create_new_post')}
                </button>
            </div>
             <div className="space-y-4">
                {blogPosts.length > 0 ? blogPosts.map(post => (
                    <div key={post.id} className="bg-primary-50 dark:bg-darkPrimary-800 p-4 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{post.title[currentLanguage.code] || post.title['en']}</p>
                            <p className="text-sm text-primary-500 dark:text-darkPrimary-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                         <div className="flex gap-2">
                           <button className="text-xs font-semibold py-1 px-3 rounded-md bg-primary-200 hover:bg-primary-300 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600">Edit</button>
                           <button className="text-xs font-semibold py-1 px-3 rounded-md bg-red-500/20 text-red-600 hover:bg-red-500/30">Delete</button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-4 text-primary-500 dark:text-darkPrimary-400">{t('feature_under_development')}</p>
                )}
            </div>
        </div>
    );
};