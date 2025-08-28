
import React from 'react';
import { Link } from 'wouter';
import { HeartHandshake, BookOpen, HomeIcon, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function About() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('about_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('about_subtitle')}
                </p>
            </div>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold mb-4">{t('about_mission_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_mission_desc')}
                </p>
            </div>

            <div className="p-8 bg-primary-50/50 dark:bg-darkPrimary-800/50 rounded-lg shadow-inner-3d border border-primary-200 dark:border-darkPrimary-700 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-darkAccent-400">
                        🌍 Official World Family Network (OWFN)
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-700 dark:text-darkPrimary-300 mt-2">
                        A Token Created to Support Humanity, Not Profit
                    </p>
                </div>
                
                <p className="text-lg text-center text-primary-700 dark:text-darkPrimary-300 leading-relaxed max-w-4xl mx-auto">
                    Official World Family Network (OWFN) is a token born from compassion, designed with a single mission: to bring real help to real people in times of true need. This is not a speculative project. This is a movement built on empathy, solidarity, and humanity.
                </p>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h4 className="text-xl font-semibold text-primary-800 dark:text-darkPrimary-200">The Mission of OWFN</h4>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">The primary purpose of OWFN is to serve as a bridge between human kindness and real action. The token will be used to:</p>
                        <ul className="mt-3 space-y-2 text-primary-600 dark:text-darkPrimary-400">
                            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" /><span>Support people living in extreme poverty or homelessness.</span></li>
                            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" /><span>Aid victims of natural disasters like earthquakes, floods, and fires.</span></li>
                            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" /><span>Fund urgent medical treatments, surgeries, transplants, or cancer therapies.</span></li>
                            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" /><span>Assist children, the elderly, and all vulnerable souls left behind by the system.</span></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xl font-semibold text-primary-800 dark:text-darkPrimary-200">Help Without Conditions. Pure Human Connection.</h4>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">Official World Family Network was created with a single truth at its core: to stand by people when they feel alone in this world. Each token is not just a digital asset—it's a symbol of hope, a gesture of support, a spark of dignity.</p>
                    </div>

                    <div>
                         <h4 className="text-xl font-semibold text-primary-800 dark:text-darkPrimary-200">Simple, Fast, and Accessible</h4>
                         <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">OWFN is designed to be sent directly to anyone in need—with no red tape, no paperwork, no waiting. Whether for food, medicine, or shelter, the value of OWFN can be used instantly, offering real impact in real time.</p>
                    </div>

                    <div>
                        <h4 className="text-xl font-semibold text-primary-800 dark:text-darkPrimary-200">Full Transparency. A Lifelong Commitment.</h4>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">A significant portion of the total supply will be allocated to a public wallet, known as the Impact Treasury & Social Initiatives Wallet, used exclusively for: Verified humanitarian aid, Emergency response, and Transparent social initiatives that truly make a difference.</p>
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md border border-primary-200 dark:border-darkPrimary-700">
                         <h4 className="text-xl font-semibold text-primary-800 dark:text-darkPrimary-200 mb-4">Basic Information</h4>
                         <div className="space-y-2 text-sm">
                             <div className="flex justify-between"><span className="font-medium text-primary-600 dark:text-darkPrimary-400">Symbol:</span><span className="font-mono font-bold">OWFN</span></div>
                             <div className="flex justify-between"><span className="font-medium text-primary-600 dark:text-darkPrimary-400">Total Supply:</span><span className="font-mono font-bold">18,000,000,000</span></div>
                             <div className="flex justify-between"><span className="font-medium text-primary-600 dark:text-darkPrimary-400">Purpose:</span><span className="font-bold text-right">Humanitarian, Social, Community Oriented</span></div>
                         </div>
                         <p className="mt-4 pt-3 border-t border-primary-200 dark:border-darkPrimary-600 text-center font-bold text-accent-700 dark:text-darkAccent-300">Not a speculative asset. No profit promises. Just real help.</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold mb-4">{t('about_vision_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_vision_desc')}
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t('about_impact_areas_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/impact/category/health">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HeartHandshake className="mx-auto text-accent-500 dark:text-darkAccent-400 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_health_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_health_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/education">
                         <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <BookOpen className="mx-auto text-accent-500 dark:text-darkAccent-500 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_education_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_education_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/basic-needs">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HomeIcon className="mx-auto text-accent-600 dark:text-darkAccent-600 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_needs_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_needs_desc')}</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
