import React from 'react';
import { Link } from 'wouter';
import { HeartHandshake, BookOpen, HomeIcon, Globe, Handshake as HandshakeIcon, Heart, Zap, ShieldCheck, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function About() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-serif text-accent-600 dark:text-darkAccent-400">{t('about_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('about_subtitle')}
                </p>
            </div>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold font-serif mb-4">{t('about_mission_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_mission_desc')}
                </p>
            </div>

            <div className="p-8 bg-primary-50 dark:bg-darkPrimary-800/50 rounded-lg shadow-3d border border-primary-200 dark:border-darkPrimary-700">
                <div className="text-center mb-10">
                    <Globe className="mx-auto w-12 h-12 text-accent-500 dark:text-darkAccent-400 mb-4" />
                    <h2 className="text-3xl font-bold font-serif text-primary-900 dark:text-darkPrimary-100">{t('about_new_section_title')}</h2>
                    <p className="mt-4 text-primary-700 dark:text-darkPrimary-300 leading-relaxed max-w-3xl mx-auto">{t('about_new_section_subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="flex items-center text-xl font-bold font-serif mb-3"><HandshakeIcon className="w-6 h-6 mr-3 text-accent-500 dark:text-darkAccent-500 flex-shrink-0" />{t('about_new_section_mission_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400 mb-2">{t('about_new_section_mission_desc')}</p>
                            <ul className="space-y-2 text-primary-700 dark:text-darkPrimary-300">
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_mission_item1')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_mission_item2')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_mission_item3')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_mission_item4')}</span></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="flex items-center text-xl font-bold font-serif mb-3"><Heart className="w-6 h-6 mr-3 text-rose-500 flex-shrink-0" />{t('about_new_section_connection_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_new_section_connection_desc')}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <h3 className="flex items-center text-xl font-bold font-serif mb-3"><Zap className="w-6 h-6 mr-3 text-yellow-500 flex-shrink-0" />{t('about_new_section_access_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_new_section_access_desc')}</p>
                        </div>
                        <div>
                            <h3 className="flex items-center text-xl font-bold font-serif mb-3"><ShieldCheck className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />{t('about_new_section_transparency_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400 mb-2">{t('about_new_section_transparency_desc')}</p>
                            <ul className="space-y-2 text-primary-700 dark:text-darkPrimary-300">
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_transparency_item1')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_transparency_item2')}</span></li>
                                <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2.5 mt-1 text-green-500 flex-shrink-0" /><span>{t('about_new_section_transparency_item3')}</span></li>
                            </ul>
                        </div>
                        <div className="bg-primary-100 dark:bg-darkPrimary-700 p-4 rounded-lg">
                            <h3 className="flex items-center text-xl font-bold font-serif mb-3"><LinkIcon className="w-6 h-6 mr-3 text-primary-600 dark:text-darkPrimary-400 flex-shrink-0" />{t('about_new_section_info_title')}</h3>
                            <ul className="space-y-1.5 text-sm text-primary-800 dark:text-darkPrimary-200">
                                <li><strong>{t('about_new_section_info_symbol')}</strong></li>
                                <li><strong>{t('about_new_section_info_supply')}</strong></li>
                                <li><strong>{t('about_new_section_info_purpose')}</strong></li>
                            </ul>
                            <p className="mt-4 text-xs font-bold uppercase text-accent-700 dark:text-darkAccent-300 tracking-wider">{t('about_new_section_info_disclaimer')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold font-serif mb-4">{t('about_vision_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_vision_desc')}
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold font-serif text-center mb-8">{t('about_impact_areas_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/impact/category/health">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HeartHandshake className="mx-auto text-accent-500 dark:text-darkAccent-400 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold font-serif mb-2">{t('about_impact_health_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_health_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/education">
                         <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <BookOpen className="mx-auto text-accent-500 dark:text-darkAccent-500 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold font-serif mb-2">{t('about_impact_education_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_education_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/basic-needs">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HomeIcon className="mx-auto text-accent-600 dark:text-darkAccent-600 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold font-serif mb-2">{t('about_impact_needs_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_needs_desc')}</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}