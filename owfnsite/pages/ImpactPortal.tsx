import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { SocialCase } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { translateText } from '../services/geminiService.js';
import { SUPPORTED_LANGUAGES } from '../lib/constants.js';
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
            const newCase: SocialCase = { id: Date.now().toString(), title: { en: title }, description: { en: description }, details: { en: details }, category, imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`, goal: parseFloat(goal), donated: 0 };
            languagesToTranslate.forEach((lang, index) => {
                newCase.title[lang.code] = translations[index * 3];
                newCase.description[lang.code] = translations[index * 3 + 1];
                newCase.details[lang.code] = translations[index * 3 + 2];
            });
            onAddCase(newCase);
            setTitle(''); setDescription(''); setDetails(''); setImageUrl(''); setCategory('Health'); setGoal('');
        } catch (error) {
            console.error("Translation failed:", error);
            alert(t('translation_error_alert'));
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="bg-dextools-card border border-dextools-border p-8 rounded-md mt-12">
            <h2 className="text-3xl font-bold mb-6 text-dextools-accent-blue">{t('create_new_case')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t('case_title')} value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md" />
                <textarea placeholder={t('case_description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md h-32"></textarea>
                <textarea placeholder={t('case_details')} value={details} onChange={e => setDetails(e.target.value)} required className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md h-24"></textarea>
                <input type="text" placeholder={t('image_url')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md" />
                <div className="grid grid-cols-2 gap-4">
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md">
                        <option value="Health">{t('category_health')}</option>
                        <option value="Education">{t('category_education')}</option>
                        <option value="Basic Needs">{t('category_basic_needs')}</option>
                    </select>
                    <input type="number" placeholder={t('funding_goal_usd')} value={goal} onChange={e => setGoal(e.target.value)} required className="w-full p-2 bg-dextools-background border border-dextools-border rounded-md" min="1" />
                </div>
                <button type="submit" disabled={isTranslating} className="w-full bg-dextools-special text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
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
        { name: 'Health', icon: <HeartHandshake className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />, titleKey: 'about_impact_health_title', descKey: 'about_impact_health_desc' },
        { name: 'Education', icon: <BookOpen className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />, titleKey: 'about_impact_education_title', descKey: 'about_impact_education_desc' },
        { name: 'Basic Needs', icon: <HomeIcon className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />, titleKey: 'about_impact_needs_title', descKey: 'about_impact_needs_desc' }
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('about_impact_areas_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-dextools-text-secondary">{t('social_cases_desc')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {categories.map(category => (
                    <Link key={category.name} href={`/impact/category/${category.name.toLowerCase().replace(' ', '-')}`}>
                       <a className="block text-center p-8 bg-dextools-card border border-dextools-border rounded-md hover:border-dextools-accent-blue hover:-translate-y-1 transition-all duration-300">
                            {category.icon}
                            <h2 className="text-2xl font-bold text-dextools-text-primary">{t(category.titleKey)}</h2>
                            <p className="text-dextools-text-secondary mt-2">{t(category.descKey)}</p>
                       </a>
                    </Link>
                ))}
            </div>
            {isAdmin && <AdminPortal onAddCase={addSocialCase} />}
        </div>
    );
}