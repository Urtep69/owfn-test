

import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-dark-border py-4 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-text-primary"
            >
                <span>{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen mt-2' : 'max-h-0'}`}
            >
                <p className="text-text-secondary leading-relaxed pt-2 whitespace-pre-wrap">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default function FAQ() {
    const { t } = useAppContext();
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const categories = [
        { key: 'all', nameKey: 'faq_category_all' },
        { key: 'presale', nameKey: 'faq_category_presale' },
        { key: 'technical', nameKey: 'faq_category_technical' },
        { key: 'mission', nameKey: 'faq_category_mission' },
        { key: 'security', nameKey: 'faq_category_security' },
    ];
    
    const allFaqData = useMemo(() => [
        { qKey: 'faq_q1', aKey: 'faq_a1', category: 'mission' },
        { qKey: 'faq_q2', aKey: 'faq_a2', category: 'presale' },
        { qKey: 'faq_q3', aKey: 'faq_a3', category: 'technical' },
        { qKey: 'faq_q4', aKey: 'faq_a4', category: 'mission' },
        { qKey: 'faq_q5', aKey: 'faq_a5', category: 'technical' },
        { qKey: 'faq_q6', aKey: 'faq_a6', category: 'mission' },
        { qKey: 'faq_q7', aKey: 'faq_a7', category: 'mission' },
        { qKey: 'faq_q8', aKey: 'faq_a8', category: 'presale' },
        { qKey: 'faq_q9', aKey: 'faq_a9', category: 'mission' },
        { qKey: 'faq_q10', aKey: 'faq_a10', category: 'technical' },
        { qKey: 'faq_q11', aKey: 'faq_a11', category: 'presale' },
        { qKey: 'faq_q12', aKey: 'faq_a12', category: 'presale' },
        { qKey: 'faq_q13', aKey: 'faq_a13', category: 'presale' },
        { qKey: 'faq_q14', aKey: 'faq_a14', category: 'technical' },
        { qKey: 'faq_q15', aKey: 'faq_a15', category: 'technical' },
        { qKey: 'faq_q16', aKey: 'faq_a16', category: 'technical' },
        { qKey: 'faq_q17', aKey: 'faq_a17', category: 'mission' },
        { qKey: 'faq_q18', aKey: 'faq_a18', category: 'mission' },
        { qKey: 'faq_q20', aKey: 'faq_a20', category: 'security' },
    ], []);

    const filteredFaqData = useMemo(() => {
        const translatedData = allFaqData
            .map(item => ({...item, question: t(item.qKey), answer: t(item.aKey)}))
            .filter(item => item.question && item.answer && item.question !== item.qKey && item.answer !== item.aKey);

        let byCategory = activeCategory === 'all'
            ? translatedData
            : translatedData.filter(item => item.category === activeCategory);
        
        if (!searchTerm.trim()) {
            return byCategory;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        return byCategory.filter(item => 
            item.question.toLowerCase().includes(lowercasedTerm) || 
            item.answer.toLowerCase().includes(lowercasedTerm)
        );
    }, [allFaqData, activeCategory, searchTerm, t]);

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <HelpCircle className="mx-auto w-16 h-16 text-neon-cyan mb-4" />
                <h1 className="text-4xl font-bold text-text-primary" style={{ textShadow: '0 0 10px var(--neon-cyan)' }}>{t('faq_title')}</h1>
                <p className="mt-4 text-lg text-text-secondary">
                    {t('faq_subtitle')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/70" />
                    <input
                        type="text"
                        placeholder={t('faq_search_placeholder')}
                        aria-label={t('faq_search_aria_label')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-dark-card border-2 border-dark-border rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-transparent focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                activeCategory === cat.key
                                    ? 'bg-neon-cyan text-dark-bg'
                                    : 'bg-dark-card text-text-secondary hover:bg-dark-border'
                            }`}
                        >
                            {t(cat.nameKey)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card p-8">
                {filteredFaqData.length > 0 ? (
                    filteredFaqData.map((item, index) => (
                        <FaqItem
                            key={item.qKey + index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))
                ) : (
                    <p className="text-center text-text-secondary py-8">
                        {t('faq_no_results')}
                    </p>
                )}
            </div>
        </div>
    );
}