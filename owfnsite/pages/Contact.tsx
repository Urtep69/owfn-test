import React, { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Link } from 'wouter';
import { Info, Handshake, Newspaper, Wrench, Loader2, CheckCircle, HelpCircle, Mail, Twitter, Send } from 'lucide-react';
import { DiscordIcon } from '../components/IconComponents.js';
import { PROJECT_LINKS } from '../lib/constants.js';

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
        <div className="bg-dextools-card border border-dextools-border p-6 rounded-md flex flex-col transition-all duration-300 hover:border-dextools-accent-blue">
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-dextools-background rounded-full text-dextools-accent-blue">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-dextools-text-primary">{title}</h3>
                    <p className="text-dextools-text-secondary break-all">{email}</p>
                </div>
            </div>
            <p className="text-dextools-text-secondary flex-grow mb-6">{description}</p>
            <button 
                onClick={() => onButtonClick(reasonKey)}
                className="mt-auto w-full bg-dextools-special text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
                <Mail size={18} />
                {t('send_direct_message')}
            </button>
        </div>
    );
};

const SocialLinkCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block bg-dextools-card border border-dextools-border p-6 rounded-md text-center transition-all duration-300 transform hover:scale-105 hover:border-dextools-accent-blue">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-dextools-background rounded-full text-dextools-accent-blue mx-auto">{icon}</div>
        <h3 className="text-xl font-bold text-dextools-text-primary mb-2">{title}</h3>
        <p className="text-sm text-dextools-text-secondary">{description}</p>
    </a>
);

export default function Contact() {
    const { t, currentLanguage } = useAppContext();
    const formRef = useRef<HTMLElement>(null);

    const reasonOptions = [ { key: 'general', labelKey: 'contact_reason_general' }, { key: 'partnership', labelKey: 'contact_reason_partnership' }, { key: 'press', labelKey: 'contact_reason_press' }, { key: 'support', labelKey: 'contact_reason_support' }, { key: 'feedback', labelKey: 'contact_reason_feedback' }, { key: 'other', labelKey: 'contact_reason_other' } ];
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState(reasonOptions[0].key);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleCardButtonClick = (reasonKey: string) => {
        setReason(reasonKey);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, reason, message, langCode: currentLanguage.code }) });
            const data = await response.json();
            setStatus(response.ok && data.success ? 'success' : 'error');
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('error');
        }
    };
    
    const contactMethods = [ { icon: <Info size={24} />, titleKey: 'contact_general_inquiries', descKey: 'contact_general_desc', email: 'info@owfn.org', reasonKey: 'general' }, { icon: <Handshake size={24} />, titleKey: 'contact_partnerships', descKey: 'contact_partnerships_desc', email: 'partnerships@owfn.org', reasonKey: 'partnership' }, { icon: <Newspaper size={24} />, titleKey: 'contact_press_media', descKey: 'contact_press_desc', email: 'press@owfn.org', reasonKey: 'press' }, { icon: <Wrench size={24} />, titleKey: 'contact_technical_support', descKey: 'contact_support_desc', email: 'support@owfn.org', reasonKey: 'support' } ];
    const socialLinks = [ { icon: <Twitter size={32} />, titleKey: 'contact_social_x_title', descKey: 'contact_social_x_desc', href: PROJECT_LINKS.x }, { icon: <Send size={32} />, titleKey: 'contact_social_telegram_channel_title', descKey: 'contact_social_telegram_channel_desc', href: PROJECT_LINKS.telegramChannel }, { icon: <Send size={32} />, titleKey: 'contact_social_telegram_group_title', descKey: 'contact_social_telegram_group_desc', href: PROJECT_LINKS.telegramGroup }, { icon: <DiscordIcon className="w-8 h-8" />, titleKey: 'contact_social_discord_title', descKey: 'contact_social_discord_desc', href: PROJECT_LINKS.discord } ];

    return (
        <div className="animate-fade-in space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('contact_title')}</h1>
                <p className="mt-4 text-lg text-dextools-text-secondary max-w-2xl mx-auto">{t('contact_subtitle')}</p>
            </div>
            <section><h2 className="text-3xl font-bold text-center mb-8 text-dextools-text-primary">{t('contact_how_can_we_help')}</h2><div className="grid md:grid-cols-2 gap-8">{contactMethods.map(method => (<ContactCard key={method.email} icon={method.icon} title={t(method.titleKey)} description={t(method.descKey)} email={method.email} reasonKey={method.reasonKey} onButtonClick={handleCardButtonClick} />))}</div></section>
            <section><h2 className="text-3xl font-bold text-center mb-8 text-dextools-text-primary">{t('contact_socials_title')}</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">{socialLinks.map(link => (<SocialLinkCard key={link.titleKey} icon={link.icon} title={t(link.titleKey)} description={t(link.descKey)} href={link.href} />))}</div></section>
            <section ref={formRef} className="bg-dextools-card border border-dextools-border p-8 rounded-md scroll-mt-24">
                <h2 className="text-3xl font-bold text-center mb-8 text-dextools-text-primary">{t('contact_form_title')}</h2>
                {status === 'success' ? (
                    <div className="text-center p-8 bg-dextools-accent-green/10 rounded-lg animate-fade-in">
                        <CheckCircle className="mx-auto w-16 h-16 text-dextools-accent-green mb-4" />
                        <h3 className="text-2xl font-bold text-dextools-accent-green">{t('contact_success_title')}</h3>
                        <p className="text-dextools-text-primary mt-2">{t('contact_success_message')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                        <p className="text-sm text-dextools-text-secondary -mb-2">{t('contact_required_fields')}</p>
                        <div><label htmlFor="name" className="block text-sm font-medium text-dextools-text-secondary">{t('contact_form_name')} <span className="text-dextools-accent-red">*</span></label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-dextools-background border border-dextools-border rounded-md shadow-sm focus:outline-none focus:ring-dextools-accent-blue focus:border-dextools-accent-blue" /></div>
                        <div><label htmlFor="email" className="block text-sm font-medium text-dextools-text-secondary">{t('contact_form_email')} <span className="text-dextools-accent-red">*</span></label><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-dextools-background border border-dextools-border rounded-md shadow-sm focus:outline-none focus:ring-dextools-accent-blue focus:border-dextools-accent-blue" /></div>
                        <div><label htmlFor="reason" className="block text-sm font-medium text-dextools-text-secondary">{t('contact_form_reason')} <span className="text-dextools-accent-red">*</span></label><select id="reason" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-dextools-background border border-dextools-border rounded-md shadow-sm focus:outline-none focus:ring-dextools-accent-blue focus:border-dextools-accent-blue">{reasonOptions.map(opt => <option key={opt.key} value={opt.key}>{t(opt.labelKey)}</option>)}</select></div>
                        <div><label htmlFor="message" className="block text-sm font-medium text-dextools-text-secondary">{t('contact_form_message')} <span className="text-dextools-accent-red">*</span></label><textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 bg-dextools-background border border-dextools-border rounded-md shadow-sm focus:outline-none focus:ring-dextools-accent-blue focus:border-dextools-accent-blue"></textarea></div>
                        {status === 'error' && (<p className="text-dextools-accent-red text-sm text-center">{t('contact_error_message')}</p>)}
                        <div><button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-dextools-special hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dextools-special disabled:opacity-50 disabled:cursor-not-allowed">{status === 'loading' ? <><Loader2 className="animate-spin mr-2" /> {t('contact_sending')}</> : t('contact_send_message')}</button></div>
                    </form>
                )}
            </section>
            <section><div className="bg-dextools-background p-6 rounded-md border border-dextools-border flex items-start gap-4"><Info className="w-8 h-8 text-dextools-text-secondary flex-shrink-0 mt-1" /><div><h3 className="font-bold text-lg text-dextools-text-primary">{t('contact_disclaimer_title')}</h3><p className="text-sm text-dextools-text-secondary mt-1">{t('contact_disclaimer_message')}</p></div></div></section>
            <section className="bg-dextools-special/10 p-8 rounded-md border border-dextools-special/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4"><HelpCircle className="w-12 h-12 text-dextools-accent-blue flex-shrink-0" /><div><h2 className="text-2xl font-bold text-dextools-text-primary">{t('contact_faq_title')}</h2><p className="text-dextools-text-secondary mt-1">{t('contact_faq_desc')}</p></div></div>
                <Link to="/faq" className="bg-dextools-special text-white font-bold py-3 px-8 rounded-full text-lg hover:opacity-90 transition-transform transform hover:scale-105 shadow-lg flex-shrink-0">{t('contact_faq_button')}</Link>
            </section>
        </div>
    );
}