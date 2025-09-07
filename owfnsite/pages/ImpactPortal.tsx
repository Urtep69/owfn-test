import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ADMIN_WALLET_ADDRESS, SUPPORTED_LANGUAGES } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';
import { Globe, HeartHandshake, BookOpen, HomeIcon, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { CaseCard } from '../components/CaseCard.tsx';

const WORLD_MAP_GEODATA_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WorldImpactMap = ({ cases }: { cases: SocialCase[] }) => {
    const { t } = useAppContext();
    const [, navigate] = useLocation();

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d-lg border border-primary-200 dark:border-darkPrimary-700 h-[500px]">
            <ComposableMap projectionConfig={{ scale: 180, center: [10, 20] }}>
                <Geographies geography={WORLD_MAP_GEODATA_URL}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                className="fill-primary-200 dark:fill-darkPrimary-700 stroke-primary-100 dark:stroke-darkPrimary-800"
                                style={{
                                    default: { outline: 'none' },
                                    hover: { outline: 'none' },
                                    pressed: { outline: 'none' },
                                }}
                            />
                        ))
                    }
                </Geographies>
                {cases.map((socialCase) => (
                    <Marker key={socialCase.id} coordinates={socialCase.coordinates}>
                        <g
                            className="cursor-pointer group"
                            onClick={() => navigate(`/impact/case/${socialCase.id}`)}
                        >
                            <circle r={8} className="fill-accent-500 dark:fill-darkAccent-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <circle r={8} className="stroke-accent-400 dark:stroke-darkAccent-400 animate-ping" />
                        </g>
                    </Marker>
                ))}
            </ComposableMap>
        </div>
    );
};


const AdminPortal = ({ onAddCase }: { onAddCase: (newCase: SocialCase) => void }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('Health');
    const [goal, setGoal] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const handleGenerateImage = async () => {
        if (!title.trim() || !description.trim()) {
            alert("Please enter a title and description first to generate a relevant image.");
            return;
        }
        setIsGeneratingImage(true);
        try {
            const prompt = `A social impact project for ${category}: ${title}. ${description}`;
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setImageUrl(`data:image/jpeg;base64,${data.base64Image}`);
            } else {
                throw new Error(data.error || "Failed to generate image.");
            }
        } catch (error) {
            console.error("Image generation failed:", error);
            alert(`Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsGeneratingImage(false);
        }
    };

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
                coordinates: [0,0] // Placeholder, should be set by admin
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
        <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d mt-12">
            <h2 className="text-3xl font-bold mb-6 text-accent-600 dark:text-darkAccent-400">{t('create_new_case')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t('case_title')} value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                <textarea placeholder={t('case_description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-32"></textarea>
                <textarea placeholder={t('case_details')} value={details} onChange={e => setDetails(e.target.value)} required className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-24"></textarea>
                
                 <div className="relative">
                    <input type="text" placeholder={t('image_url')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md pr-40" />
                    <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-accent-500 text-white text-xs font-bold py-1.5 px-3 rounded-md hover:bg-accent-600 disabled:opacity-50">
                        {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate with AI
                    </button>
                </div>
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-md max-h-48 object-cover"/>}

                <div className="grid grid-cols-2 gap-4">
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md">
                        <option value="Health">{t('category_health')}</option>
                        <option value="Education">{t('category_education')}</option>
                        <option value="Basic Needs">{t('category_basic_needs')}</option>
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
    const { t, solana, socialCases, addSocialCase } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;
    const [activeCategory, setActiveCategory] = useState('All');
    
    const categories = ['All', 'Health', 'Education', 'Basic Needs'];

    const filteredCases = useMemo(() => {
        if (activeCategory === 'All') return socialCases;
        return socialCases.filter(c => c.category === activeCategory);
    }, [socialCases, activeCategory]);

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <Globe className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_portal')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('social_cases_desc')}
                </p>
            </div>

            <WorldImpactMap cases={socialCases} />
            
            <div>
                 <div className="flex justify-center flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                activeCategory === cat
                                    ? 'bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950'
                                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:text-darkPrimary-300 dark:hover:bg-darkPrimary-600'
                            }`}
                        >
                            {cat === 'All' ? cat : t(`category_${cat.toLowerCase().replace(' ', '_')}`)}
                        </button>
                    ))}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCases.map(c => <CaseCard key={c.id} socialCase={c} />)}
                </div>
            </div>

            {isAdmin && <AdminPortal onAddCase={addSocialCase} />}
        </div>
    );
}