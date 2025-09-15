import React from 'react';
import { Link } from 'wouter';
import { HeartHandshake, BookOpen, HomeIcon, Globe, Handshake as HandshakeIcon, Heart, Zap, ShieldCheck, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';

export default function About() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('about_title')}</h1>
                <p className="mt-4 text-lg text-dextools-text-secondary">
                    {t('about_subtitle')}
                </p>
            </div>

            <div className="p-6 bg-dextools-card border border-dextools-border rounded-md">
                <h2 className="text-3xl font-bold mb-4 text-dextools-text-primary">{t('about_mission_title')}</h2>
                <p className="text-dextools-text-secondary leading-relaxed">
                    {t('about_mission_desc')}
                </p>
            </div>

            <div className="p-6 bg-dextools-card border border-dextools-border rounded-md">
                <div className="text-center mb-10">
                    <Globe className="mx-auto w-12 h-12 text-dextools-accent-blue mb-4" />
                    <h2 className="text-3xl font-bold text-dextools-text-primary">{t('about_new_section_title')}</h2>
                    <p className="mt-4 text-dextools-text-secondary leading-relaxed max-w-3xl mx-auto">{t('about_new_section_subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="flex items-center text-xl font-bold mb-3 text-dextools-text-primary"><HandshakeIcon className="w-6 h-6 mr-3 text-dextools-special flex-shrink-0" />{t('about_new_section_mission_title')}</h3>
                            <p className="text-dextools-text-secondary mb-2">{t('about_new_section_mission_desc')}</p>
                            <ul className="space-y-2 text-dextools-text-secondary">
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_mission_item1')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_mission_item2')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_mission_item3')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_mission_item4')}</span></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="flex items-center text-xl font-bold mb-3 text-dextools-text-primary"><Heart className="w-6 h-6 mr-3 text-dextools-accent-red flex-shrink-0" />{t('about_new_section_connection_title')}</h3>
                            <p className="text-dextools-text-secondary">{t('about_new_section_connection_desc')}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <h3 className="flex items-center text-xl font-bold mb-3 text-dextools-text-primary"><Zap className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />{t('about_new_section_access_title')}</h3>
                            <p className="text-dextools-text-secondary">{t('about_new_section_access_desc')}</p>
                        </div>
                        <div>
                            <h3 className="flex items-center text-xl font-bold mb-3 text-dextools-text-primary"><ShieldCheck className="w-6 h-6 mr-3 text-dextools-accent-blue flex-shrink-0" />{t('about_new_section_transparency_title')}</h3>
                            <p className="text-dextools-text-secondary mb-2">{t('about_new_section_transparency_desc')}</p>
                            <ul className="space-y-2 text-dextools-text-secondary">
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_transparency_item1')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_transparency_item2')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-dextools-accent-green flex-shrink-0" /><span>{t('about_new_section_transparency_item3')}</span></li>
                            </ul>
                        </div>
                        <div className="bg-dextools-background border border-dextools-border p-4 rounded-md">
                            <h3 className="flex items-center text-xl font-bold mb-3 text-dextools-text-primary"><LinkIcon className="w-6 h-6 mr-3 text-dextools-text-secondary flex-shrink-0" />{t('about_new_section_info_title')}</h3>
                            <ul className="space-y-1.5 text-sm text-dextools-text-primary">
                                <li><strong>{t('about_new_section_info_symbol')}</strong></li>
                                <li><strong>{t('about_new_section_info_supply')}</strong></li>
                                <li><strong>{t('about_new_section_info_purpose')}</strong></li>
                            </ul>
                            <p className="mt-4 text-xs font-bold uppercase text-dextools-special tracking-wider">{t('about_new_section_info_disclaimer')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-dextools-card border border-dextools-border rounded-md">
                <h2 className="text-3xl font-bold mb-4 text-dextools-text-primary">{t('about_vision_title')}</h2>
                <p className="text-dextools-text-secondary leading-relaxed">
                    {t('about_vision_desc')}
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold text-center mb-8 text-dextools-text-primary">{t('about_impact_areas_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/impact/category/health">
                        <a className="block text-center p-6 bg-dextools-card border border-dextools-border rounded-md hover:border-dextools-accent-blue hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HeartHandshake className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-dextools-text-primary">{t('about_impact_health_title')}</h3>
                            <p className="text-dextools-text-secondary">{t('about_impact_health_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/education">
                         <a className="block text-center p-6 bg-dextools-card border border-dextools-border rounded-md hover:border-dextools-accent-blue hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <BookOpen className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-dextools-text-primary">{t('about_impact_education_title')}</h3>
                            <p className="text-dextools-text-secondary">{t('about_impact_education_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/basic-needs">
                        <a className="block text-center p-6 bg-dextools-card border border-dextools-border rounded-md hover:border-dextools-accent-blue hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HomeIcon className="mx-auto text-dextools-accent-blue w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-dextools-text-primary">{t('about_impact_needs_title')}</h3>
                            <p className="text-dextools-text-secondary">{t('about_impact_needs_desc')}</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}