import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { Article } from '../types.ts';
import { Calendar, User } from 'lucide-react';

export const ArticleCard = ({ article }: { article: Article }) => {
    const { t, currentLanguage } = useAppContext();
    
    const title = article.title[currentLanguage.code] || article.title['en'];
    const summary = article.summary[currentLanguage.code] || article.summary['en'];

    const formattedDate = new Date(article.date).toLocaleDateString(currentLanguage.code, {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-white dark:bg-darkPrimary-800 rounded-2xl shadow-3d overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-3d-lg group">
            <Link to={`/news/article/${article.id}`}>
                <a>
                    <div className="relative">
                        <img src={article.imageUrl} alt={title} className="w-full h-56 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <span className="absolute top-4 right-4 bg-accent-400/80 text-accent-950 dark:bg-darkAccent-500/80 dark:text-darkPrimary-950 text-xs font-bold px-3 py-1 rounded-full">
                            {article.category}
                        </span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-primary-900 dark:text-darkPrimary-100 group-hover:text-accent-600 dark:group-hover:text-darkAccent-400 transition-colors duration-200 line-clamp-2" style={{ minHeight: '3.5rem' }}>
                            {title}
                        </h3>
                        <p className="text-primary-600 dark:text-darkPrimary-400 mb-4 line-clamp-3" style={{ minHeight: '4.5rem' }}>
                            {summary}
                        </p>
                        <div className="flex items-center justify-between text-sm text-primary-500 dark:text-darkPrimary-500 border-t border-primary-200 dark:border-darkPrimary-700 pt-4">
                            <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{t('by')} {article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    );
};