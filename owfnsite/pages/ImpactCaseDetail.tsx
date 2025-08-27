import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { ArrowLeft, Heart, CheckCircle, Milestone, Newspaper, AlertTriangle } from 'lucide-react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';

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
    const percentages = [5, 10, 15, 25, 50, 75, 100];

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
        if (!siws.isAuthenticated) {
            setWalletModalOpen(true);
            return;
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
        } else {
            alert(t(result.messageKey, result.params));
        }
    };
    
    const categorySlug = socialCase.category.toLowerCase().replace(/\s+/g, '-');
    const categoryName = t(`category_${socialCase.category.toLowerCase().replace(/\s+/g, '_')}`);

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link to={`/impact/category/${categorySlug}`} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {t('back_to_category_cases', { category: categoryName })}
            </Link>
            <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d-lg overflow-hidden">
                <img src={socialCase.imageUrl} alt={title} className="w-full h-64 md:h-96 object-cover" />
                <div className="p-6 md:p-10">
                    <span className="text-lg font-semibold text-accent-600 dark:text-darkAccent-500 mb-2 inline-block">{t(`category_${socialCase.category.toLowerCase().replace(' ', '_')}`, { defaultValue: socialCase.category })}</span>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
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
                     <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Newspaper /> {t('live_updates')}</h3>
                        <div className="space-y-4">
                            {mockUpdates.map(update => (
                                <div key={update.date} className="border-b border-primary-200 dark:border-darkPrimary-700 pb-4 last:border-b-0 last:pb-0">
                                    <p className="text-sm text-primary-500 dark:text-darkPrimary-400 font-semibold">{update.date}</p>
                                    <p className="text-primary-700 dark:text-darkPrimary-300 mt-1">{t(update.key)}</p>
                                    {update.image && <img src={update.image} alt="Update" className="mt-2 rounded-lg" />}
                                </div>
                            ))}
                        </div>
                    </div>

                     {details && (
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <h3 className="text-2xl font-bold mb-4">{t('case_details_title')}</h3>
                            <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed whitespace-pre-wrap">{details}</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="lg:sticky top-24 space-y-8">
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Heart className="text-red-500" />
                                <span>{t('support_this_cause')}</span>
                            </h3>
                            <div className="bg-accent-100/30 dark:bg-darkAccent-900/20 border border-accent-400/30 dark:border-darkAccent-500/30 text-accent-800 dark:text-darkAccent-200 p-3 rounded-md text-sm flex items-start space-x-2 mb-6">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{t('donation_solana_warning')}</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-2">{t('select_token')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {tokens.map(token => (
                                            <button
                                                key={token.symbol}
                                                onClick={() => setSelectedToken(token.symbol)}
                                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-accent-500 bg-accent-100/50 dark:bg-darkAccent-900/50' : 'border-primary-200 dark:border-darkPrimary-600'}`}
                                            >
                                                <div className="w-8 h-8 mb-2">{token.icon}</div>
                                                <span className="font-semibold">{token.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                        
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-primary-600 dark:text-darkPrimary-400 mb-1">{t('amount')}</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {percentages.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handlePercentageClick(p)}
                                                disabled={!siws.isAuthenticated || !currentUserToken || currentUserToken.balance <= 0}
                                                className="flex-grow text-xs bg-primary-200/50 hover:bg-primary-200 dark:bg-darkPrimary-700/50 dark:hover:bg-darkPrimary-700 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {p === 100 ? 'MAX' : `${p}%`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            
                                {siws.isAuthenticated && (
                                    <div className="animate-fade-in-up" style={{animationDuration: '300ms'}}>
                                        {currentUserToken ? (
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-primary-800 dark:text-darkPrimary-200">
                                                    {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 px-4 bg-accent-100/20 dark:bg-darkAccent-900/20 border border-accent-400/30 dark:border-darkAccent-500/30 rounded-lg">
                                                <div className="flex items-center justify-center space-x-2 text-accent-700 dark:text-darkAccent-200">
                                                    {React.cloneElement(tokens.find(t => t.symbol === selectedToken)!.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                                                    <p className="font-semibold">
                                                        {t('donation_no_token_balance', { symbol: selectedToken })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {parseFloat(amount) > 0 && (
                                    <div className="p-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-lg text-center animate-fade-in-up" style={{animationDuration: '300ms'}}>
                                        <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">
                                            {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                                        </p>
                                        <p className="text-md text-primary-700 dark:text-darkPrimary-300 font-semibold">
                                            ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </p>
                                    </div>
                                )}

                                <button onClick={handleDonate} disabled={solana.loading || !siws.isAuthenticated || !(parseFloat(amount) > 0)} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {solana.loading || siws.isLoading ? t('processing') : (siws.isAuthenticated ? t('donate') : t('connect_wallet'))}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Milestone /> {t('funding_milestones')}</h3>
                             <div className="relative pl-4">
                                <div className="absolute top-0 left-4 h-full w-0.5 bg-primary-200 dark:bg-darkPrimary-700"></div>
                                <div className="absolute top-0 left-4 h-full w-0.5 bg-accent-500 dark:bg-darkAccent-500 transition-all duration-500" style={{ height: `${progress}%` }}></div>
                                {milestones.map(milestone => (
                                    <div key={milestone.percentage} className="flex items-start mb-4 relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center -ml-8 flex-shrink-0 z-10 ${progress >= milestone.percentage ? 'bg-accent-500 dark:bg-darkAccent-500' : 'bg-primary-300 dark:bg-darkPrimary-600'}`}>
                                            <CheckCircle size={16} className="text-white"/>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-bold">{milestone.percentage}%</p>
                                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t(milestone.key)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
