import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ArticleCard } from '../components/ArticleCard.tsx';
import { BookCopy } from 'lucide-react';

type ArticleCategory = 'All' | 'Crypto News' | 'OWFN Updates' | 'Impact Stories';

export default function News() {
    const { t, articles } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<ArticleCategory>('All');

    const categories: { key: ArticleCategory, nameKey: string }[] = [
        { key: 'All', nameKey: 'all_categories' },
        { key: 'OWFN Updates', nameKey: 'category_owfn_updates' },
        { key: 'Impact Stories', nameKey: 'category_impact_stories' },
        { key: 'Crypto News', nameKey: 'category_crypto_news' },
    ];

    const filteredArticles = useMemo(() => {
        if (activeCategory === 'All') {
            return articles;
        }
        return articles.filter(article => article.category === activeCategory);
    }, [articles, activeCategory]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                 <BookCopy className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_journal')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('impact_journal_subtitle')}
                </p>
            </div>

             <div className="bg-white/50 dark:bg-darkPrimary-800/50 p-4 rounded-lg shadow-inner-3d flex flex-wrap items-center justify-center gap-3">
                 {categories.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                            activeCategory === cat.key
                                ? 'bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 shadow-md'
                                : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:text-darkPrimary-300 dark:hover:bg-darkPrimary-600'
                        }`}
                    >
                        {t(cat.nameKey)}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
}