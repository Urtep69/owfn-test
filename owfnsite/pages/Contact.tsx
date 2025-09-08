import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { useLocation, Link } from 'wouter';
import { Info, Handshake, Newspaper, Wrench, Loader2, CheckCircle, HelpCircle, Mail, Twitter, Send } from 'lucide-react';
import { DiscordIcon } from '../components/IconComponents.tsx';
import { PROJECT_LINKS } from '../constants.ts';

interface ContactCardProps {
    icon: React.ReactNode;
    title: string;
    email: string;
    description: string;
    reasonKey: string;
    onButtonClick: (reasonKey: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, email, description, reasonKey, onButtonClick }) => {
    const { t } = useAppContext();
    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all duration-300 transform flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
                    <p className="text-primary-500 dark:text-darkPrimary-500 break-all">{email}</p>
                </div>
            </div>
            <p className="text-primary-600 dark:text-darkPrimary-400 flex-grow mb-6">{description}</p>
            <button 
                onClick={() => onButtonClick(reasonKey)}
                className="mt-auto group relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-bold text-accent-950 dark:text-darkPrimary-950 rounded-lg shadow-md transition-transform transform hover:scale-105 w-full"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent-400 to-accent-500 dark:from-darkAccent-500 dark:to-darkAccent-600"></span>
                <span className="absolute bottom-0 right-0 w-full h-full transition-all duration-500 ease-in-out transform translate-x-full translate-y-full bg-accent-500 dark:bg-darkAccent-600 group-hover:translate-x-0 group-hover:translate-y-0"></span>
                <span className="relative flex items-center gap-2">
                    <Mail size={18} />
                    {t('send_direct_message', { defaultValue: 'Send a Direct Message' })}
                </span>
            </button>
        </div>
    );
};


const SocialLinkCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d hover:shadow-3d-lg hover:scale-105 transition-all duration-300 transform text-center"
    >
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400 mx-auto">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-2">{title}</h3>
        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{description}</p>
    </a>
);


export default function Contact() {
    const { t } = useAppContext();
    const [location] = useLocation();
    const formRef = useRef<HTMLElement>(null);

    const reasonOptions = [
        { key: 'general', labelKey: 'contact_reason_general' },
        { key: 'partnership', labelKey: 'contact_reason_partnership' },
        { key: 'press', labelKey: 'contact_reason_press' },
        { key: 'support', labelKey: 'contact_reason_support' },
        { key: 'feedback', labelKey: 'contact_reason_feedback' },
        { key: 'other', labelKey: 'contact_reason_other' },
    ];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState(reasonOptions[0].key);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reasonFromQuery = params.get('reason');
        if (reasonFromQuery && reasonOptions.some(opt => opt.key === reasonFromQuery)) {
            setReason(reasonFromQuery);
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    const handleCardButtonClick = (reasonKey: string) => {
        setReason(reasonKey);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, reason, message }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('error');
        }
    };
    
    const contactMethods = [
        { icon: <Info size={24} />, titleKey: 'contact_general_inquiries', descKey: 'contact_general_desc', email: 'info@owfn.org', reasonKey: 'general' },
        { icon: <Handshake size={24} />, titleKey: 'contact_partnerships', descKey: 'contact_partnerships_desc', email: 'partnerships@owfn.org', reasonKey: 'partnership' },
        { icon: <Newspaper size={24} />, titleKey: 'contact_press_media', descKey: 'contact_press_desc', email: 'press@owfn.org', reasonKey: 'press' },
        { icon: <Wrench size={24} />, titleKey: 'contact_technical_support', descKey: 'contact_support_desc', email: 'support@owfn.org', reasonKey: 'support' },
    ];

    const socialLinks = [
        { icon: <Twitter size={32} />, titleKey: 'contact_social_x_title', descKey: 'contact_social_x_desc', href: PROJECT_LINKS.x },
        { icon: <Send size={32} />, titleKey: 'contact_social_telegram_channel_title', descKey: 'contact_social_telegram_channel_desc', href: PROJECT_LINKS.telegramChannel },
        { icon: <Send size={32} />, titleKey: 'contact_social_telegram_group_title', descKey: 'contact_social_telegram_group_desc', href: PROJECT_LINKS.telegramGroup },
        { icon: <DiscordIcon className="w-8 h-8" />, titleKey: 'contact_social_discord_title', descKey: 'contact_social_discord_desc', href: PROJECT_LINKS.discord },
    ];

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('contact_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400 max-w-2xl mx-auto">
                    {t('contact_subtitle')}
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-bold text-center mb-8">{t('contact_how_can_we_help')}</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {contactMethods.map(method => (
                         <ContactCard 
                            key={method.email}
                            icon={method.icon}
                            title={t(method.titleKey)}
                            description={t(method.descKey)}
                            email={method.email}
                            reasonKey={method.reasonKey}
                            onButtonClick={handleCardButtonClick}
                         />
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-3xl font-bold text-center mb-8">{t('contact_socials_title')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {socialLinks.map(link => (
                        <SocialLinkCard 
                            key={link.titleKey}
                            icon={link.icon}
                            title={t(link.titleKey)}
                            description={t(link.descKey)}
                            href={link.href}
                        />
                    ))}
                </div>
            </section>

            <section ref={formRef} className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d-lg scroll-mt-24">
                <h2 className="text-3xl font-bold text-center mb-8">{t('contact_form_title')}</h2>
                {status === 'success' ? (
                    <div className="text-center p-8 bg-green-500/10 dark:bg-green-500/20 rounded-lg animate-fade-in-up">
                        <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{t('contact_success_title')}</h3>
                        <p className="text-primary-700 dark:text-darkPrimary-300 mt-2">{t('contact_success_message')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400 -mb-2">{t('contact_required_fields')}</p>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-primary-700 dark:text-darkPrimary-300">{t('contact_form_name')} <span className="text-red-500">*</span></label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-primary-100 dark:bg-darkPrimary-700 border border-primary-300 dark:border-darkPrimary-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-darkPrimary-300">{t('contact_form_email')} <span className="text-red-500">*</span></label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-primary-100 dark:bg-darkPrimary-700 border border-primary-300 dark:border-darkPrimary-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500" />
                        </div>
                         <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-primary-700 dark:text-darkPrimary-300">{t('contact_form_reason')} <span className="text-red-500">*</span></label>
                            <select id="reason" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-primary-100 dark:bg-darkPrimary-700 border border-primary-300 dark:border-darkPrimary-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500">
                                {reasonOptions.map(opt => <option key={opt.key} value={opt.key}>{t(opt.labelKey)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-primary-700 dark:text-darkPrimary-300">{t('contact_form_message')} <span className="text-red-500">*</span></label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 bg-primary-100 dark:bg-darkPrimary-700 border border-primary-300 dark:border-darkPrimary-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"></textarea>
                        </div>
                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center">{t('contact_error_message')}</p>
                        )}
                        <div>
                            <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-accent-950 bg-accent-400 hover:bg-accent-500 dark:text-darkPrimary-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {status === 'loading' ? <><Loader2 className="animate-spin mr-2" /> {t('contact_sending')}</> : t('contact_send_message')}
                            </button>
                        </div>
                    </form>
                )}
            </section>
            
            <section>
                <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-6 rounded-lg shadow-md flex items-start gap-4 border border-primary-200 dark:border-darkPrimary-700">
                    <Info className="w-8 h-8 text-primary-500 dark:text-darkPrimary-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg text-primary-800 dark:text-darkPrimary-200">{t('contact_disclaimer_title')}</h3>
                        <p className="text-sm text-primary-700 dark:text-darkPrimary-300 mt-1">{t('contact_disclaimer_message')}</p>
                    </div>
                </div>
            </section>

            <section className="bg-accent-100/30 dark:bg-darkAccent-900/30 p-8 rounded-lg shadow-inner-3d flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                     <HelpCircle className="w-12 h-12 text-accent-600 dark:text-darkAccent-400 flex-shrink-0" />
                     <div>
                        <h2 className="text-2xl font-bold">{t('contact_faq_title')}</h2>
                        <p className="text-primary-700 dark:text-darkPrimary-300 mt-1">{t('contact_faq_desc')}</p>
                     </div>
                </div>
                <Link to="/faq" className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-transform transform hover:scale-105 shadow-lg flex-shrink-0">
                    {t('contact_faq_button')}
                </Link>
            </section>

        </div>
    );
}