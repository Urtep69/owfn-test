import React from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CommentSection } from '../components/CommentSection.tsx';

export default function BlogPostDetail() {
    const { t, currentLanguage, blogPosts, isDataLoading } = useAppContext();
    const params = useParams();
    const slug = params?.['slug'];
    const post = blogPosts.find(p => p.slug === slug);

    if (isDataLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('blog_post_not_found')}</h2>
                <Link to="/blog" className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block">{t('back_to_blog')}</Link>
            </div>
        );
    }
    
    const title = post.title[currentLanguage.code] || post.title['en'];
    const content = post.content[currentLanguage.code] || post.content['en'];
    const createdAt = new Date(post.createdAt);

    return (
        <div className="animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <Link to="/blog" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-8">
                    <ArrowLeft size={16} /> {t('back_to_blog')}
                </Link>
                
                <article>
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-primary-900 dark:text-darkPrimary-100 leading-tight">{title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-primary-500 dark:text-darkPrimary-400">
                            <div className="flex items-center gap-3">
                                <WalletAvatar address={post.authorAddress} className="w-10 h-10"/>
                                <div>
                                    <p className="font-semibold text-primary-700 dark:text-darkPrimary-300">{t('author')}</p>
                                    <p className="text-xs">{post.authorAddress}</p>
                                </div>
                            </div>
                            <span className="text-primary-300 dark:text-darkPrimary-600">&bull;</span>
                            <time dateTime={post.createdAt} className="font-semibold">
                                {createdAt.toLocaleDateString(currentLanguage.code, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </div>
                    </header>

                    <img src={post.imageUrl} alt={title} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-8" />

                    <div className="prose dark:prose-invert max-w-none text-lg lg:text-xl leading-relaxed text-primary-800 dark:text-darkPrimary-200">
                        {content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-6">{paragraph}</p>
                        ))}
                    </div>
                </article>

                <div className="mt-16 pt-8 border-t border-primary-200 dark:border-darkPrimary-700">
                    <CommentSection parentId={post.id} title={t('comments')} />
                </div>
            </div>
        </div>
    );
}