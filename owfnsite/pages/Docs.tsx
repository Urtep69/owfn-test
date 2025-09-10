import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ArrowUp } from 'lucide-react';

const SECTIONS = [
    { id: 'intro', titleKey: 'docs_intro_title' },
    { id: 'background', titleKey: 'docs_background_title' },
    { id: 'dev-plan', titleKey: 'docs_dev_plan_title' },
    { id: 'roadmap', titleKey: 'docs_roadmap_title' },
    { id: 'empower', titleKey: 'docs_empower_title' },
    { id: 'empower-plan', titleKey: 'docs_empower_plan_title' },
    { id: 'relationship', titleKey: 'docs_relationship_title' },
    { id: 'partner-program', titleKey: 'docs_partner_program_title' },
];

export default function Docs() {
    const { t } = useAppContext();
    const [activeSection, setActiveSection] = useState('intro');
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px', threshold: 0 }
        );

        const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
        sections.forEach(section => observer.current?.observe(section!));

        return () => {
            sections.forEach(section => observer.current?.unobserve(section!));
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-9">
                    <article className="prose prose-lg dark:prose-invert max-w-none text-primary-700 dark:text-darkPrimary-300 leading-relaxed space-y-8">
                        <header>
                            <h1 className="text-4xl md:text-5xl font-bold text-accent-600 dark:text-darkAccent-400 !mb-4">{t('docs_main_title')}</h1>
                            <div className="aspect-video bg-primary-200 dark:bg-darkPrimary-800 rounded-lg flex items-center justify-center text-primary-500 dark:text-darkPrimary-500">
                                <span>{t('video_placeholder')}</span>
                            </div>
                        </header>
                        
                        <section id="intro">
                            <h2 className="!mt-12">{t('docs_intro_title')}</h2>
                            <p>{t('docs_intro_p1')}</p>
                            <p>{t('docs_intro_p2')}</p>
                        </section>

                        <section id="background">
                            <h2>{t('docs_background_title')}</h2>
                            <p>{t('docs_background_p1')}</p>
                        </section>

                        <section id="dev-plan">
                            <h2>{t('docs_dev_plan_title')}</h2>
                            <p>{t('docs_dev_plan_p1')}</p>
                            <h3>{t('docs_dev_plan_initial_title')}</h3>
                            <p>{t('docs_dev_plan_initial_p1')}</p>
                            <h3>{t('docs_dev_plan_professional_title')}</h3>
                            <p>{t('docs_dev_plan_professional_p1')}</p>
                            <h3>{t('docs_dev_plan_extended_title')}</h3>
                            <p>{t('docs_dev_plan_extended_p1')}</p>
                        </section>
                        
                        <section id="roadmap">
                            <h2>{t('docs_roadmap_title')}</h2>
                            <p><strong>{t('docs_roadmap_overview_title')}</strong></p>
                            <p>v0.1</p>
                            <ul>
                                <li>{t('docs_roadmap_item1')}</li>
                                <li>{t('docs_roadmap_item2')}</li>
                                <li>{t('docs_roadmap_item3')}</li>
                                <li>{t('docs_roadmap_item4')}</li>
                                <li>{t('docs_roadmap_item5')}</li>
                            </ul>
                            <p>{t('docs_roadmap_additional_services')}</p>
                             <ul>
                                <li>{t('docs_roadmap_item6')}</li>
                                <li>{t('docs_roadmap_item7')}</li>
                                <li>{t('docs_roadmap_item8')}</li>
                                <li>{t('docs_roadmap_item9')}</li>
                                <li>{t('docs_roadmap_item10')}</li>
                            </ul>
                        </section>

                        <section id="empower">
                            <h2>{t('docs_empower_title')}</h2>
                            <p>{t('docs_empower_p1')}</p>
                        </section>
                        
                        <section id="empower-plan">
                            <h2>{t('docs_empower_plan_title')}</h2>
                            <p>{t('docs_empower_plan_p1')}</p>
                            <ul>
                                <li>{t('docs_empower_plan_item1')}</li>
                                <li>{t('docs_empower_plan_item2')}</li>
                                <li>{t('docs_empower_plan_item3')}</li>
                                <li>{t('docs_empower_plan_item4')}</li>
                            </ul>
                            <p>{t('docs_empower_plan_p2')}</p>
                        </section>

                        <section id="relationship">
                             <h2>{t('docs_relationship_title')}</h2>
                             <p>{t('docs_relationship_p1')}</p>
                        </section>

                        <section id="partner-program">
                            <h2>{t('docs_partner_program_title')}</h2>
                            <p>{t('docs_partner_program_p1')}</p>
                            <p><strong>{t('docs_partner_program_invitation_title')}</strong></p>
                            <p>{t('docs_partner_program_invitation_p1')}</p>
                            <p><strong>{t('docs_partner_program_system_title')}</strong></p>
                            <p>{t('docs_partner_program_system_p1')}</p>
                        </section>

                    </article>
                </div>

                <aside className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-24">
                        <nav className="border-l border-primary-200 dark:border-darkPrimary-700">
                            <ul>
                                {SECTIONS.map(section => (
                                    <li key={section.id}>
                                        <a 
                                            href={`#${section.id}`}
                                            className={`block -ml-px pl-4 py-2 border-l-2 transition-colors ${
                                                activeSection === section.id
                                                    ? 'border-darkAccent-500 text-darkAccent-500 font-bold'
                                                    : 'border-transparent text-primary-600 dark:text-darkPrimary-400 hover:border-primary-300 dark:hover:border-darkPrimary-600'
                                            }`}
                                        >
                                            {t(section.titleKey)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <button onClick={scrollToTop} className="mt-8 flex items-center gap-2 text-primary-600 dark:text-darkPrimary-400 hover:text-darkAccent-500 transition-colors">
                            <ArrowUp size={16} /> {t('back_to_top')}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}