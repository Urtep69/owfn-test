import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { ArrowLeft, Heart, CheckCircle, Milestone, Newspaper, AlertTriangle } from 'lucide-react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES } from '../constants.ts';

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
    const { t, solana, currentLanguage, socialCases } = useAppContext();
    const params = useParams();
    const id = params?.['id'];
    const socialCase = socialCases.find(c => c.id === id);

    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');
    const [tokenPrice, setTokenPrice] = useState(0);
    
    const currentUserToken = useMemo(() => solana.userTokens.find(t => t.symbol === selectedToken), [solana.userTokens, selectedToken]);
    const percentages = [5, 10, 15, 25, 50, 75, 100];

    useEffect(() => {
        const fetchPrice = async () => {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[selectedToken];
            if (!mintAddress) {
                setTokenPrice(0);
                return;
            }
            try {
                const res = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
                const data = await res.json();
                if(data.data[mintAddress]) {
                    setTokenPrice(data.data[mintAddress].price);
                } else {
                    setTokenPrice(0);
                }
            } catch (e) {
                console.error("Failed to fetch price", e);
                setTokenPrice(0);
            }
        };
        fetchPrice();
    }, [selectedToken]);

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
                <Link to="/impact" className="text-accent hover:underline mt-4 inline-block">{t('back_to_all_cases')}</Link>
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
            <Link to={`/impact/category/${categorySlug}`} className="inline-flex items-center gap-2 text-accent hover:underline">
                <ArrowLeft size={16} /> {t('back_to_category_cases', { category: categoryName })}
            </Link>
            <div className="glassmorphism rounded-lg overflow-hidden">
                <img src={socialCase.imageUrl} alt={title} className="w-full h-64 md:h-96 object-cover" />
                <div className="p-6 md:p-10">
                    <span className="text-lg font-semibold text-accent mb-2 inline-block">{t(`category_${socialCase.category.toLowerCase().replace(' ', '_')}`, { defaultValue: socialCase.category })}</span>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
                    <p className="text-lg text-text-secondary leading-relaxed mb-8">{description}</p>
                    
                    <div className="mb-8">
                        <ProgressBar progress={progress} />
                        <div className="flex justify-between text-lg font-semibold mt-2">
                            <span><span className="font-bold text-accent">${socialCase.donated.toLocaleString()}</span> {t('funded')}</span>
                            <span><span className="font-normal text-text-secondary">{t('goal')}:</span> ${socialCase.goal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                     <div className="glassmorphism p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Newspaper /> {t('live_updates')}</h3>
                        <div className="space-y-4">
                            {mockUpdates.map(update => (
                                <div key={update.date} className="border-b border-border-color pb-4 last:border-b-0 last:pb-0">
                                    <p className="text-sm text-text-secondary font-semibold">{update.date}</p>
                                    <p className="text-text-primary mt-1">{t(update.key)}</p>
                                    {update.image && <img src={update.image} alt="Update" className="mt-2 rounded-lg" />}
                                </div>
                            ))}
                        </div>
                    </div>

                     {details && (
                        <div className="glassmorphism p-6 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4">{t('case_details_title')}</h3>
                            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{details}</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="lg:sticky top-24 space-y-8">
                        <div className="glassmorphism p-6 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Heart className="text-danger" />
                                <span>{t('support_this_cause')}</span>
                            </h3>
                            <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-md text-sm flex items-start space-x-2 mb-6">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{t('donation_solana_warning')}</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">{t('select_token')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {tokens.map(token => (
                                            <button
                                                key={token.symbol}
                                                onClick={() => setSelectedToken(token.symbol)}
                                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-accent bg-accent/10' : 'border-border-color bg-surface-2'}`}
                                            >
                                                <div className="w-8 h-8 mb-2">{token.icon}</div>
                                                <span className="font-semibold">{token.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                        
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">{t('amount')}</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full p-3 bg-surface-2 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent focus:outline-none border border-border-color"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {percentages.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handlePercentageClick(p)}
                                                disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                                className="flex-grow text-xs bg-surface-2 hover:bg-surface-3 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border-color"
                                            >
                                                {p === 100 ? 'MAX' : `${p}%`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            
                                {solana.connected && (
                                    <div className="animate-fade-in-up" style={{animationDuration: '300ms'}}>
                                        {currentUserToken ? (
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-text-primary">
                                                    {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 px-4 bg-surface-2 border border-border-color rounded-lg">
                                                <div className="flex items-center justify-center space-x-2 text-text-secondary">
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
                                    <div className="p-4 bg-surface-2 rounded-lg text-center animate-fade-in-up border border-border-color" style={{animationDuration: '300ms'}}>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                                        </p>
                                        <p className="text-md text-text-secondary font-semibold">
                                            ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </p>
                                    </div>
                                )}

                                <button onClick={handleDonate} disabled={solana.loading || !solana.connected || !(parseFloat(amount) > 0)} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {solana.loading ? t('processing') : (solana.connected ? t('donate') : t('connect_wallet'))}
                                </button>
                            </div>
                        </div>
                        <div className="glassmorphism p-6 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Milestone /> {t('funding_milestones')}</h3>
                             <div className="relative pl-4">
                                <div className="absolute top-0 left-4 h-full w-0.5 bg-surface-3"></div>
                                <div className="absolute top-0 left-4 h-full w-0.5 bg-accent transition-all duration-500" style={{ height: `${progress}%` }}></div>
                                {milestones.map(milestone => (
                                    <div key={milestone.percentage} className="flex items-start mb-4 relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center -ml-8 flex-shrink-0 z-10 ${progress >= milestone.percentage ? 'bg-accent' : 'bg-surface-3'}`}>
                                            <CheckCircle size={16} className="text-white"/>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-bold">{milestone.percentage}%</p>
                                            <p className="text-sm text-text-secondary">{t(milestone.key)}</p>
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