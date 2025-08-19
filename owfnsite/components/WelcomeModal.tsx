import React from 'react';
import { Link } from 'wouter';
import { X, Rocket, FileText, Heart } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActionButton = ({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <Link to={to} onClick={onClick}>
        <a className="flex items-center justify-center gap-3 w-full p-4 rounded-lg bg-primary-100 dark:bg-darkPrimary-700/50 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-all duration-300 transform hover:scale-105">
            <span className="text-accent-500 dark:text-darkAccent-400">{icon}</span>
            <span className="font-bold text-primary-800 dark:text-darkPrimary-200">{label}</span>
        </a>
    </Link>
);

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
    const { t } = useAppContext();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDuration: '400ms' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
        >
            <div
                className="bg-white dark:bg-darkPrimary-800 rounded-2xl shadow-3d-lg w-full max-w-lg m-auto transform transition-transform duration-300 hover:scale-[1.02]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 text-center relative">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 rounded-full text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
                        aria-label="Close welcome message"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex justify-center mb-4">
                         <div className="p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-full shadow-inner-3d">
                            <OwfnIcon className="w-20 h-20" />
                        </div>
                    </div>
                    
                    <h2 id="welcome-modal-title" className="text-3xl font-extrabold text-primary-900 dark:text-darkPrimary-100 tracking-tight">
                        {t('welcome_modal_title')}
                    </h2>
                     <p className="text-3xl font-bold text-accent-600 dark:text-darkAccent-400 mb-4">{t('welcome_modal_subtitle')}</p>

                    <p className="text-primary-600 dark:text-darkPrimary-400 leading-relaxed mb-8">
                        {t('welcome_modal_text')}
                    </p>

                    <div className="space-y-3 mb-8">
                        <ActionButton to="/presale" icon={<Rocket size={20} />} label={t('welcome_modal_button_presale')} onClick={onClose} />
                        <ActionButton to="/whitepaper" icon={<FileText size={20} />} label={t('welcome_modal_button_whitepaper')} onClick={onClose} />
                        <ActionButton to="/impact" icon={<Heart size={20} />} label={t('welcome_modal_button_impact')} onClick={onClose} />
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-transform transform hover:scale-105 shadow-lg"
                    >
                        {t('welcome_modal_button_explore')}
                    </button>
                </div>
            </div>
        </div>
    );
};
