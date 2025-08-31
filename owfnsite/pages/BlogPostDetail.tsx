
import React from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { ArrowLeft } from 'lucide-react';
import { CommentSection } from '../components/CommentSection.tsx';

export default function BlogPostDetail() {
    const { t, currentLanguage, blogPosts } = useAppContext();
    const params = useParams();
    const slug = params?.['slug'];
    const post = blogPosts.find(p => p.slug === slug);

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
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-8">
                <ArrowLeft size={16} /> {t('back_to_blog')}
            </Link>
            
            <article className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg overflow-hidden">
                <img src={post.imageUrl} alt={title} className="w-full h-64 md:h-96 object-cover" />
                <div className="p-6 md:p-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-primary-500 dark:text-darkPrimary-400 mb-8">
                        <div>
                           <span>{t('author')}: </span>
                           <AddressDisplay address={post.authorAddress} />
                        </div>
                        <span>&bull;</span>
                        <time dateTime={post.createdAt}>
                            {createdAt.toLocaleDateString(currentLanguage.code, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-primary-800 dark:text-darkPrimary-200">
                        {content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </article>

            <div className="mt-12">
                <CommentSection parentId={post.id} title={t('comments')} />
            </div>
        </div>
    );
}
