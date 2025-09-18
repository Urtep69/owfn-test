import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { X, Loader2, CheckCircle, Upload } from 'lucide-react';

interface AddCaseModalProps {
    setIsOpen: (isOpen: boolean) => void;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({ setIsOpen }) => {
    const { t, solana } = useAppContext();
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [category, setCategory] = useState('Health');
    const [goal, setGoal] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactTelegram, setContactTelegram] = useState('');
    const [agreed, setAgreed] = useState(false);
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            setError(t('profile_add_case_agree_error'));
            return;
        }
        setStatus('loading');
        setError('');

        try {
            // In a real app, you'd upload the image to Vercel Blob first
            // and get a URL. We'll simulate this for now.
            // const imageUrl = imageFile ? await uploadToBlob(imageFile) : '';

            const response = await fetch('/api/cases/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: solana.address,
                    title, shortDescription, detailedDescription, category,
                    goal: parseFloat(goal),
                    // imageUrl, 
                    contactName, contactEmail, contactTelegram
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit case.');
            }

            setStatus('success');
            setTimeout(() => setIsOpen(false), 2000); // Close modal on success
        } catch (err: any) {
            setStatus('error');
            setError(err.message);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-primary-500 hover:text-primary-800 dark:text-darkPrimary-400 dark:hover:text-darkPrimary-100">
                    <X size={24} />
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-1">{t('profile_add_case_title')}</h2>
                    <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_add_case_subtitle')}</p>

                    {status === 'success' ? (
                        <div className="text-center py-10">
                            <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">{t('profile_add_case_success_title')}</h3>
                            <p>{t('profile_add_case_success_desc')}</p>
                        </div>
                    ) : (
                         <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                            {/* Case Details */}
                            <h3 className="font-semibold border-b pb-2">{t('profile_add_case_section1')}</h3>
                            <div>
                                <label htmlFor="title">{t('case_title')} *</label>
                                <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="short_desc">{t('profile_add_case_short_desc')} *</label>
                                <input id="short_desc" type="text" maxLength={200} value={shortDescription} onChange={e => setShortDescription(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="detail_desc">{t('case_details')} *</label>
                                <textarea id="detail_desc" value={detailedDescription} onChange={e => setDetailedDescription(e.target.value)} required rows={4} className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category">{t('category')} *</label>
                                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md">
                                        <option value="Health">{t('category_health')}</option>
                                        <option value="Education">{t('category_education')}</option>
                                        <option value="Basic Needs">{t('category_basic_needs')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="goal">{t('funding_goal_usd')} *</label>
                                    <input id="goal" type="number" min="1" value={goal} onChange={e => setGoal(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                                </div>
                            </div>
                             <div>
                                <label>{t('profile_add_case_image')}</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primary-300 dark:border-darkPrimary-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                        ) : (
                                            <Upload className="mx-auto h-12 w-12 text-primary-400" />
                                        )}
                                        <div className="flex text-sm text-primary-600 dark:text-darkPrimary-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-darkPrimary-800 rounded-md font-medium text-accent-600 hover:text-accent-500">
                                                <span>{t('profile_add_case_upload')}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg" />
                                            </label>
                                            <p className="pl-1">{t('profile_add_case_drag')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Contact Info */}
                            <h3 className="font-semibold border-b pb-2 pt-4">{t('profile_add_case_section2')}</h3>
                             <div>
                                <label htmlFor="contact_name">{t('profile_add_case_c_name')} *</label>
                                <input id="contact_name" type="text" value={contactName} onChange={e => setContactName(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="contact_email">{t('profile_add_case_c_email')} *</label>
                                    <input id="contact_email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="contact_telegram">{t('profile_add_case_c_telegram')} *</label>
                                    <input id="contact_telegram" type="text" value={contactTelegram} onChange={e => setContactTelegram(e.target.value)} required className="w-full p-2 mt-1 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                                </div>
                            </div>
                             {/* Agreement */}
                            <div className="pt-4">
                                <div className="flex items-start">
                                    <input id="agreement" name="agreement" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="h-4 w-4 text-accent-600 border-primary-300 rounded mt-1" />
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="agreement" className="font-medium">{t('profile_add_case_agree')} *</label>
                                    </div>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="pt-4">
                                <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-lg font-bold text-accent-950 bg-accent-400 hover:bg-accent-500 dark:text-darkPrimary-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 disabled:opacity-50">
                                    {status === 'loading' ? <Loader2 className="animate-spin" /> : t('profile_add_case_submit')}
                                </button>
                            </div>
                         </form>
                    )}
                </div>
            </div>
        </div>
    );
};