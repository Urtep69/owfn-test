
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

const faqKeys = [
    { q: 'faq_q1', a: 'faq_a1' },
    { q: 'faq_q2', a: 'faq_a2' },
    { q: 'faq_q3', a: 'faq_a3' },
    { q: 'faq_q4', a: 'faq_a4' },
    { q: 'faq_q5', a: 'faq_a5' },
    { q: 'faq_q6', a: 'faq_a6' },
    { q: 'faq_q7', a: 'faq_a7' },
    { q: 'faq_q8', a: 'faq_a8' },
    { q: 'faq_q9', a: 'faq_a9' },
    { q: 'faq_q10', a: 'faq_a10' },
];

const FaqItem = ({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-primary-200 dark:border-darkPrimary-700 py-4">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-primary-800 dark:text-darkPrimary-200"
            >
                <span>{q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen mt-2' : 'max-h-0'}`}
            >
                <p className="text-primary-600 dark:text-darkPrimary-400 leading-relaxed pt-2">
                    {a}
                </p>
            </div>
        </div>
    );
};

export default function FAQ() {
    const { t } = useAppContext();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <HelpCircle className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('faq_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('faq_subtitle')}
                </p>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                {faqKeys.map((item, index) => (
                    <FaqItem
                        key={index}
                        q={t(item.q)}
                        a={t(item.a)}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
    );
}