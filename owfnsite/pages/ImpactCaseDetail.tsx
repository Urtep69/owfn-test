
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { ArrowLeft, Heart, CheckCircle, Milestone, Newspaper, AlertTriangle, MapPin, Users, Landmark } from 'lucide-react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import { ImageSlideshow } from '../components/ImageSlideshow.tsx';
import { CommentSection } from '../components/CommentSection.tsx';

const tokens = [
    { symbol: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', icon: <SolIcon /> },
    { symbol: 'USDC', icon: <UsdcIcon /> },
    { symbol: 'USDT', icon: <UsdtIcon /> },
];

const mockUpdates = [
    { date: '2024-07-15', key: 'case_update_1', image: 'https://picsum.photos/seed/materials/400/200' },
    { date: '2024-07-01', key: 'case_update_2' },
    { date: '2024-06-20', key: 'case_update_3' },
];

export default function ImpactCaseDetail() {
    const { t, solana, siws, currentLanguage, socialCases, setWalletModalOpen } = useAppContext();
    const params = useParams();
    const id = params?.['id'];
    const socialCase = socialCases.find(c => c.id === id);

    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');
    
    const currentUserToken = useMemo(() => solana.userTokens.find(t => t.symbol === selectedToken), [solana.userTokens, selectedToken]);
    const percentages = [25, 50, 75, 100];

    const tokenPrice = useMemo(() => currentUserToken?.pricePerToken ?? 0, [currentUserToken]);

    const usdValue = useMemo(() => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || !tokenPrice) {
            return 0;
        }
        return numAmount * tokenPrice;
    }, [amount, tokenPrice]);

    const handlePercentageClick = (percentage: number) => {
        if (currentUserToken && currentUserToken.balance > 0) {
            const newAmount = (currentUserToken.balance * percentage) / 100;
            setAmount(parseFloat(newAmount.toFixed(8)).toString());
        }
    };

    if (!socialCase) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('case_not_found')}</h2>
                <Link to="/impact" className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block">{t('back_to_all_cases')}</Link>
            </div>
        );
    }
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];
    const details = socialCase.details[currentLanguage.code] || socialCase.details['en'];
    
    const progress = (socialCase.donated / socialCase.goal) * 100;

    const milestones = [
        { percentage: 25, key: 'milestone_25' },
        { percentage: 50, key: 'milestone_50' },
        { percentage: 75, key: 'milestone_75' },
        { percentage: 100, key: 'milestone_100' },
    ];

    const handleDonate = async () => {
        if (!solana.connected) {
            setWalletModalOpen(true);
            return;
        }

        if (!siws.isAuthenticated) {
            const signedIn = await siws.signIn();
            if (!signedIn) return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert(t('invalid_amount_generic'));
            return;
        }

        const result = await solana.sendTransaction(DISTRIBUTION_WALLETS.impactTreasury, numAmount, selectedToken);
        
        if (result.success) {
            alert(t('case_donation_success_alert', { title }));
            setAmount('');
            // Here you would typically update the case's donated amount from a server
        } else {
            alert(t(result.messageKey, result.params));
        }
    };
    
    const categorySlug = socialCase.category.toLowerCase().replace(/\s+/g, '-');
    const categoryName = t(`category_${socialCase.category.toLowerCase().replace(/\s+/g, '_')}`);
    
    const buttonText = useMemo(() => {
        if (solana.loading || siws.isLoading) return t('processing');
        if (!solana.connected) return t('connect_wallet');
        if (!siws.isAuthenticated) return t('sign_in_to_donate');
        return t('donate');
    }, [solana.connected, solana.loading, siws.isAuthenticated, siws.isLoading, t]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link to={`/impact/category/${categorySlug}`} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {t('back_to_category_cases', { category: categoryName })}
            </Link>
            <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg overflow-hidden">
                <ImageSlideshow imageUrls={socialCase.imageUrls} altText={title} />
                <div className="p-6 md:p-10">
                    <span className="text-lg font-semibold text-accent-600 dark:text-darkAccent-500 mb-2 inline-block">{categoryName}</span>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-8 text-center">
                        <div className="bg-primary-50 dark:bg-darkPrimary-700/50 p-3 rounded-lg"><MapPin className="inline-block mr-2"/> {socialCase.region}, {socialCase.country}</div>
                        <div className="bg-primary-50 dark:bg-darkPrimary-700/50 p-3 rounded-lg"><Users className="inline-block mr-2"/> {socialCase.beneficiaryCount} {t('beneficiaries')}</div>
                        {socialCase.bankAccountIBAN && <div className="bg-primary-50 dark:bg-darkPrimary-700/50 p-3 rounded-lg"><Landmark className="inline-block mr-2"/> {t('bank_transfer_available')}</div>}
                    </div>

                    <p className="text-lg text-primary-700 dark:text-darkPrimary-300 leading-relaxed mb-8">{description}</p>
                    
                    <div className="mb-8">
                        <ProgressBar progress={progress} />
                        <div className="flex justify-between text-lg font-semibold mt-2">
                            <span><span className="font-bold text-accent-600 dark:text-darkAccent-400">${socialCase.donated.toLocaleString()}</span> {t('funded')}</span>
                            <span><span className="font-normal text-primary-600 dark:text-darkPrimary-400">{t('goal')}:</span> ${socialCase.goal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {details && (
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <h3 className="text-2xl font-bold mb-4">{t('case_details_title')}</h3>
                            <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed whitespace-pre-wrap">{details}</p>
                            {socialCase.bankAccountIBAN && (
                                <div className="mt-6 p-4 bg-primary-50 dark:bg-darkPrimary-700/50 rounded-lg border-l-4 border-accent-500">
                                    <h4 className="font-bold">{t('direct_bank_transfer')}</h4>
                                    <p className="font-mono text-lg mt-1">{socialCase.bankAccountIBAN}</p>
                                    <p className="text-xs mt-1 text-primary-500">{t('bank_transfer_verified_note')}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <CommentSection parentId={socialCase.id} title={t('messages_of_support')} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="lg:sticky top-24 space-y-8">
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Heart className="text-red-500" />
                                <span>{t('support_this_cause')}</span>
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-2">{t('select_token')}</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {tokens.map(token => (
                                            <button
                                                key={token.symbol}
                                                onClick={() => setSelectedToken(token.symbol)}
                                                className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-accent-500 bg-accent-100/50 dark:bg-darkAccent-900/50' : 'border-primary-200 dark:border-darkPrimary-600'}`}
                                            >
                                                <div className="w-6 h-6 mb-1">{token.icon}</div>
                                                <span className="font-semibold text-xs">{token.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                        
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <label htmlFor="amount" className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-1">{t('amount')}</label>
                                        {solana.connected && currentUserToken && <span className="text-xs">{t('balance')}: {currentUserToken.balance.toFixed(4)}</span>}
                                    </div>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {percentages.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handlePercentageClick(p)}
                                                disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                                className="flex-grow text-xs bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {p === 100 ? 'MAX' : `${p}%`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            
                                {parseFloat(amount) > 0 && (
                                    <div className="p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-center animate-fade-in-up" style={{animationDuration: '300ms'}}>
                                        <p className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100">
                                            {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                                        </p>
                                        <p className="text-sm text-primary-700 dark:text-darkPrimary-300 font-semibold">
                                            ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </p>
                                    </div>
                                )}

                                <button onClick={handleDonate} disabled={solana.loading || siws.isLoading || (solana.connected && siws.isAuthenticated && !(parseFloat(amount) > 0))} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                                     {buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}