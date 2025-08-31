
import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { BlogPost } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { Loader2 } from 'lucide-react';

const BlogPostCard = ({ post }: { post: BlogPost }) => {
    const { t, currentLanguage } = useAppContext();
    const title = post.title[currentLanguage.code] || post.title['en'];
    const content = post.content[currentLanguage.code] || post.content['en'];
    const createdAt = new Date(post.createdAt);

    return (
        <Link href={`/blog/${post.slug}`}>
            <a className="block bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
                <div className="h-56 overflow-hidden">
                    <img src={post.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                    <p className="text-sm text-primary-500 dark:text-darkPrimary-400 mb-2">
                        {createdAt.toLocaleDateString(currentLanguage.code, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-3 h-20 overflow-hidden">{title}</h2>
                    <p className="text-primary-600 dark:text-darkPrimary-400 mb-4 h-24 overflow-hidden text-ellipsis">
                        {content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-xs">
                            <span className="font-semibold">{t('author')}: </span>
                            <AddressDisplay address={post.authorAddress} />
                        </div>
                        <span className="font-bold text-accent-600 dark:text-darkAccent-400 group-hover:underline">
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
                    {sortedPosts.map(post => (
                        <BlogPostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('blog_no_posts')}</p>
                </div>
            )}
        </div>
    );
}
