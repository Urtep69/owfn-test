import React from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ArrowLeft, Calendar, User, Star } from 'lucide-react';

export default function ArticleDetail() {
    const { t, articles, currentLanguage, articleFavorites } = useAppContext();
    const params = useParams();
    const id = params?.['id'];
    const article = articles.find(a => a.id === id);

    if (!article) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('article_not_found')}</h2>
                <Link to="/news" className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block">{t('back_to_all_articles')}</Link>
            </div>
        );
    }
    
    const { isFavorite, toggleFavorite } = articleFavorites;
    const isArticleFavorite = isFavorite(article.id);
    
    const title = article.title[currentLanguage.code] || article.title['en'];
    const content = article.content[currentLanguage.code] || article.content['en'];

    const formattedDate = new Date(article.date).toLocaleDateString(currentLanguage.code, {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <Link to="/news" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                        <ArrowLeft size={16} /> {t('back_to_all_articles')}
                    </Link>
                     <button 
                        onClick={() => toggleFavorite(article.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${isArticleFavorite ? 'bg-amber-400/20 border-amber-500 text-amber-600 dark:text-amber-400' : 'bg-primary-100 dark:bg-darkPrimary-700 border-transparent hover:border-amber-400'}`}
                        aria-label={t(isArticleFavorite ? 'remove_from_favorites' : 'add_to_favorites')}
                    >
                        <Star size={16} className={`${isArticleFavorite ? 'fill-current' : ''}`} />
                        <span>{t(isArticleFavorite ? 'favorited' : 'favorite')}</span>
                    </button>
                </div>
                
                <article className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg overflow-hidden">
                    <img src={article.imageUrl} alt={title} className="w-full h-64 md:h-96 object-cover" />
                    <div className="p-6 md:p-10">
                        <span className="text-lg font-semibold text-accent-600 dark:text-darkAccent-500 mb-2 inline-block">
                            {article.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
                        <div className="flex items-center space-x-6 text-sm text-primary-500 dark:text-darkPrimary-400 mb-8 border-b border-t border-primary-200 dark:border-darkPrimary-700 py-3">
                            <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{t('by')} {article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-primary-700 dark:text-darkPrimary-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {content}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}