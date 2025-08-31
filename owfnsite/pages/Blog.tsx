import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { BlogPost } from '../types.ts';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { Loader2 } from 'lucide-react';

const BlogPostCard = ({ post, isFeatured = false }: { post: BlogPost, isFeatured?: boolean }) => {
    const { t, currentLanguage } = useAppContext();
    const title = post.title[currentLanguage.code] || post.title['en'];
    const content = post.content[currentLanguage.code] || post.content['en'];
    const createdAt = new Date(post.createdAt);

    if (isFeatured) {
        return (
            <Link href={`/blog/${post.slug}`}>
                <a className="block md:col-span-2 lg:col-span-3 bg-white dark:bg-darkPrimary-900 rounded-2xl shadow-3d-lg overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 grid md:grid-cols-2 items-center">
                    <div className="h-64 md:h-full overflow-hidden">
                        <img src={post.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                    </div>
                    <div className="p-8 md:p-12">
                        <p className="text-sm font-semibold text-accent-600 dark:text-darkAccent-400 mb-2">
                            {createdAt.toLocaleDateString(currentLanguage.code, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-4 leading-tight">{title}</h2>
                        <p className="text-primary-600 dark:text-darkPrimary-400 mb-6 text-lg">
                            {content.substring(0, 180)}...
                        </p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <WalletAvatar address={post.authorAddress} className="w-10 h-10"/>
                                <div>
                                    <p className="text-sm font-semibold text-primary-800 dark:text-darkPrimary-200">{t('author')}</p>
                                    <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{post.authorAddress.slice(0,6)}...{post.authorAddress.slice(-4)}</p>
                                </div>
                            </div>
                            <span className="font-bold text-accent-600 dark:text-darkAccent-400 group-hover:underline">
                                {t('read_more')} &rarr;
                            </span>
                        </div>
                    </div>
                </a>
            </Link>
        )
    }

    return (
        <Link href={`/blog/${post.slug}`}>
            <a className="block bg-white dark:bg-darkPrimary-900 rounded-2xl shadow-3d-lg overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                <div className="h-56 overflow-hidden">
                    <img src={post.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <p className="text-sm text-primary-500 dark:text-darkPrimary-400 mb-2">
                        {createdAt.toLocaleDateString(currentLanguage.code, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-3 flex-grow">{title}</h2>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-200 dark:border-darkPrimary-700">
                        <div className="flex items-center gap-2 text-xs">
                            <WalletAvatar address={post.authorAddress} className="w-8 h-8"/>
                            <span className="font-semibold text-primary-600 dark:text-darkPrimary-400">{post.authorAddress.slice(0,4)}...</span>
                        </div>
                        <span className="font-bold text-sm text-accent-600 dark:text-darkAccent-400 group-hover:underline">
                            {t('read_more')} &rarr;
                        </span>
                    </div>
                </div>
            </a>
        </Link>
    );
};


export default function Blog() {
    const { t, blogPosts, isDataLoading } = useAppContext();
    
    // Sort posts by creation date, newest first
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const featuredPost = sortedPosts[0];
    const otherPosts = sortedPosts.slice(1);

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('blog_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400 max-w-2xl mx-auto">
                    {t('blog_subtitle')}
                </p>
            </div>
            
            {isDataLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                </div>
            ) : sortedPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPost && <BlogPostCard post={featuredPost} isFeatured={true} />}
                    {otherPosts.map(post => (
                        <BlogPostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white dark:bg-darkPrimary-900 rounded-lg shadow-inner-3d">
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('blog_no_posts')}</p>
                </div>
            )}
        </div>
    );
}