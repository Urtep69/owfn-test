import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';
import { HeartHandshake, BookOpen, HomeIcon, Search, Filter } from 'lucide-react';
import { countries } from '../lib/countries.ts';
import { CaseCard } from '../components/CaseCard.tsx';

const caseCategories = [
    { key: 'Health', labelKey: 'category_health' },
    { key: 'Education', labelKey: 'category_education' },
    { key: 'Basic Needs', labelKey: 'category_basic_needs' },
    { key: 'Modernization', labelKey: 'category_modernization' },
    { key: 'Social Support', labelKey: 'category_social_support' },
    { key: 'Hospital & Surgery', labelKey: 'category_hospital_surgery' },
    { key: 'Food & Clothing Aid', labelKey: 'category_food_clothing' },
    { key: 'House Construction', labelKey: 'category_house_construction' },
];

const AdminPortal = ({ onAddCase }: { onAddCase: (newCase: SocialCase) => void }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState('');
    const [category, setCategory] = useState(caseCategories[0].key);
    const [goal, setGoal] = useState('');
    const [countryCode, setCountryCode] = useState(countries[0].code);
    const [city, setCity] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !details || !goal || !city || !countryCode) {
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
                galleryImageUrls: galleryUrls.split('\n').filter(url => url.trim() !== ''),
                goal: parseFloat(goal),
                donated: 0,
                countryCode,
                city,
            };
            
            languagesToTranslate.forEach((lang, index) => {
                newCase.title[lang.code] = translations[index * 3];
                newCase.description[lang.code] = translations[index * 3 + 1];
                newCase.details[lang.code] = translations[index * 3 + 2];
            });

            onAddCase(newCase);
            
            // Reset form
            setTitle(''); setDescription(''); setDetails(''); setImageUrl('');
            setGalleryUrls(''); setCategory(caseCategories[0].key); setGoal('');
            setCountryCode(countries[0].code); setCity('');

        } catch (error) {
            console.error("Translation failed for one or more languages:", error);
            alert(t('translation_error_alert'));
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d mt-12">
            <h2 className="text-3xl font-bold mb-6 text-accent-600 dark:text-darkAccent-400">{t('create_new_case')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t('case_title')} value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md">
                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder={t('admin_city')} value={city} onChange={e => setCity(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                </div>
                <textarea placeholder={t('case_description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-24"></textarea>
                <textarea placeholder={t('case_details')} value={details} onChange={e => setDetails(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-20"></textarea>
                <input type="text" placeholder={t('image_url')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                <textarea placeholder={t('admin_gallery_images')} value={galleryUrls} onChange={e => setGalleryUrls(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-24"></textarea>
                <div className="grid grid-cols-2 gap-4">
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md">
                        {caseCategories.map(cat => <option key={cat.key} value={cat.key}>{t(cat.labelKey)}</option>)}
                    </select>
                    <input type="number" placeholder={t('funding_goal_usd')} value={goal} onChange={e => setGoal(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" min="1" />
                </div>
                <button type="submit" disabled={isTranslating} className="w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 py-3 rounded-lg font-bold hover:bg-accent-500 dark:hover:bg-darkAccent-600 disabled:bg-primary-300 dark:disabled:bg-darkPrimary-600 transition-colors">
                    {isTranslating ? t('admin_saving_case') : t('save_case')}
                </button>
            </form>
        </div>
    );
};


export default function ImpactPortal() {
    const { t, solana, socialCases, addSocialCase, currentLanguage } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;
    
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const availableCountries = useMemo(() => {
        const uniqueCodes = [...new Set(socialCases.map(c => c.countryCode))];
        return countries.filter(c => uniqueCodes.includes(c.code));
    }, [socialCases]);

    const filteredCases = useMemo(() => {
        return socialCases.filter(c => {
            const categoryMatch = categoryFilter === 'all' || c.category === categoryFilter;
            const countryMatch = countryFilter === 'all' || c.countryCode === countryFilter;
            const title = c.title[currentLanguage.code] || c.title['en'] || '';
            const searchMatch = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && countryMatch && searchMatch;
        });
    }, [socialCases, categoryFilter, countryFilter, searchQuery, currentLanguage.code]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_portal')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('social_cases_desc')}
                </p>
            </div>

            <div className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg sticky top-20 z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 dark:text-darkPrimary-500" />
                        <input
                            type="text"
                            placeholder={t('search_by_name')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-darkPrimary-800 border border-primary-300 dark:border-darkPrimary-600 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none transition-colors"
                        />
                    </div>
                     <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full p-2 bg-white dark:bg-darkPrimary-800 border border-primary-300 dark:border-darkPrimary-600 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none">
                        <option value="all">{t('all_categories')}</option>
                        {caseCategories.map(cat => <option key={cat.key} value={cat.key}>{t(cat.labelKey)}</option>)}
                    </select>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="w-full p-2 bg-white dark:bg-darkPrimary-800 border border-primary-300 dark:border-darkPrimary-600 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none">
                        <option value="all">{t('all_countries')}</option>
                        {availableCountries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {filteredCases.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCases.map(c => (
                        <CaseCard key={c.id} socialCase={c} />
                    ))}
                </div>
            ) : (
                 <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_active_cases_in_category')}</p>
                </div>
            )}

            {isAdmin && <AdminPortal onAddCase={addSocialCase} />}
        </div>
    );
}
