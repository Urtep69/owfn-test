import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';
import { HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';

const AdminPortal = ({ onAddCase }: { onAddCase: (newCase: SocialCase) => void }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('Health');
    const [goal, setGoal] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !details || !goal) {
            alert(t('admin_fill_fields_alert'));
            return;
        }
        setIsTranslating(true);

        const languagesToTranslate = SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en');
        
        try {
            const translationPromises = languagesToTranslate.flatMap(lang => [
                translateText(title, lang.name),
                translateText(description, lang.name),
                translateText(details, lang.name)
            ]);

            const translations = await Promise.all(translationPromises);

            const newCase: SocialCase = {
                id: Date.now().toString(),
                title: { en: title },
                description: { en: description },
                details: { en: details },
                category,
                imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
                goal: parseFloat(goal),
                donated: 0,
            };
            
            languagesToTranslate.forEach((lang, index) => {
                newCase.title[lang.code] = translations[index * 3];
                newCase.description[lang.code] = translations[index * 3 + 1];
                newCase.details[lang.code] = translations[index * 3 + 2];
            });

            onAddCase(newCase);
            
            // Reset form
            setTitle('');
            setDescription('');
            setDetails('');
            setImageUrl('');
            setCategory('Health');
            setGoal('');

        } catch (error) {
            console.error("Translation failed for one or more languages:", error);
            alert(t('translation_error_alert'));
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="bg-primary-800 p-8 rounded-lg shadow-3d mt-12">
            <h2 className="text-3xl font-bold mb-6 text-accent-400">{t('create_new_case')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t('case_title')} value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-primary-700 rounded-md" />
                <textarea placeholder={t('case_description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-primary-700 rounded-md h-32"></textarea>
                <textarea placeholder={t('case_details')} value={details} onChange={e => setDetails(e.target.value)} required className="w-full p-2 bg-primary-700 rounded-md h-24"></textarea>
                <input type="text" placeholder={t('image_url')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-primary-700 rounded-md" />
                <div className="grid grid-cols-2 gap-4">
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-primary-700 rounded-md">
                        <option value="Health">{t('category_health')}</option>
                        <option value="Education">{t('category_education')}</option>
                        <option value="Basic Needs">{t('category_basic_needs')}</option>
                    </select>
                    <input type="number" placeholder={t('funding_goal_usd')} value={goal} onChange={e => setGoal(e.target.value)} required className="w-full p-2 bg-primary-700 rounded-md" min="1" />
                </div>
                <button type="submit" disabled={isTranslating} className="w-full bg-accent-500 text-primary-950 py-3 rounded-lg font-bold hover:bg-accent-600 disabled:bg-primary-600 transition-colors">
                    {isTranslating ? t('admin_saving_case') : t('save_case')}
                </button>
            </form>
        </div>
    );
};


export default function ImpactPortal() {
    const { t, solana, socialCases, addSocialCase } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;
    
    const categories = [
        { 
            name: 'Health',
            icon: <HeartHandshake className="mx-auto text-accent-400 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_health_title',
            descKey: 'about_impact_health_desc',
            casesCount: socialCases.filter(c => c.category === 'Health').length
        },
        { 
            name: 'Education',
            icon: <BookOpen className="mx-auto text-accent-500 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_education_title',
            descKey: 'about_impact_education_desc',
            casesCount: socialCases.filter(c => c.category === 'Education').length
        },
        { 
            name: 'Basic Needs',
            icon: <HomeIcon className="mx-auto text-accent-600 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_needs_title',
            descKey: 'about_impact_needs_desc',
            casesCount: socialCases.filter(c => c.category === 'Basic Needs').length
        }
    ];

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-400">{t('about_impact_areas_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-400">
                    {t('social_cases_desc')}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {categories.map(category => (
                    category.casesCount > 0 && (
                        <Link 
                            key={category.name}
                            href={`/impact/category/${category.name.toLowerCase().replace(' ', '-')}`}
                        >
                           <a className="block text-center p-8 bg-primary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-500">
                                {category.icon}
                                <h2 className="text-2xl font-bold">{t(category.titleKey)}</h2>
                                <p className="text-primary-400 mt-2">{t(category.descKey)}</p>
                           </a>
                        </Link>
                    )
                ))}
            </div>

            {isAdmin && <AdminPortal onAddCase={addSocialCase} />}
        </div>
    );
}