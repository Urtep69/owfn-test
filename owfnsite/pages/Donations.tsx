import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { AlertTriangle, Info } from 'lucide-react';

const tokens = [
    { symbol: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', icon: <SolIcon /> },
    { symbol: 'USDC', icon: <UsdcIcon /> },
    { symbol: 'USDT', icon: <UsdtIcon /> },
];

export default function Donations() {
    const { t, solana } = useAppContext();
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');
    const [tokenPrice, setTokenPrice] = useState(0);

    const currentUserToken = useMemo(() => solana.userTokens.find(t => t.symbol === selectedToken), [solana.userTokens, selectedToken]);

    useEffect(() => {
        const fetchPrice = async () => {
            if (currentUserToken && currentUserToken.pricePerToken > 0) {
                setTokenPrice(currentUserToken.pricePerToken);
                return;
            }

            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[selectedToken];
            if (!mintAddress || selectedToken === 'OWFN') {
                setTokenPrice(0);
                return;
            }

            try {
                const res = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
                if (!res.ok) {
                    throw new Error(`Jupiter API failed with status ${res.status}`);
                }
                const data = await res.json();
                if (data.data && data.data[mintAddress]) {
                    setTokenPrice(data.data[mintAddress].price);
                } else {
                    setTokenPrice(0);
                }
            } catch (e) {
                console.error(`Failed to fetch price for ${selectedToken}:`, e);
                setTokenPrice(0);
            }
        };

        fetchPrice();
    }, [selectedToken, currentUserToken]);

    const usdValue = useMemo(() => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || !tokenPrice || tokenPrice <= 0) {
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

    const handleDonate = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert(t('invalid_amount_generic'));
            return;
        }
        
        const result = await solana.sendTransaction(DISTRIBUTION_WALLETS.impactTreasury, numAmount, selectedToken);

        if (result.success) {
            alert(t('donation_success_alert', result.params));
            setAmount('');
        } else {
            alert(t(result.messageKey, result.params));
        }
    };
    
    const percentages = [5, 10, 15, 25, 50, 75, 100];

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-text-primary" style={{ textShadow: '0 0 10px var(--neon-cyan)' }}>{t('make_donation')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                    {t('donation_desc')}
                </p>
            </div>
            
            <div className="glass-card p-8 md:p-12 card-3d-hover">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-3xl font-bold text-text-primary">{t('donation_message_title')}</h2>
                    <p className="text-text-secondary leading-relaxed">{t('donation_message_p1')}</p>
                    <p className="text-text-secondary leading-relaxed">
                        {t('donation_message_p2_part1')}
                        <span className="font-bold text-neon-cyan">
                            {t('donation_message_p2_project_name')}
                        </span>
                        {t('donation_message_p2_part2')}
                    </p>
                    <p className="text-text-secondary leading-relaxed">{t('donation_message_p3')}</p>
                    <p className="font-bold text-text-primary pt-2">{t('donation_message_thanks')}</p>
                </div>
            </div>

            <div className="bg-neon-magenta/10 border-l-4 border-neon-magenta text-neon-magenta/80 p-4 rounded-md shadow-md flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-neon-magenta flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                    {t('donation_solana_warning')}
                </p>
            </div>
            
            <div className="glass-card p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('donations_form_title')}</h2>

                <div className="bg-dark-card/50 p-3 rounded-lg text-sm text-text-secondary mb-6 flex items-start gap-2">
                    <Info size={18} className="flex-shrink-0 mt-0.5 text-text-secondary/80" />
                    <span>{t('donation_fee_info')}</span>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('select_token')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {tokens.map(token => (
                                <button
                                    key={token.symbol}
                                    onClick={() => setSelectedToken(token.symbol)}
                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-neon-cyan bg-neon-cyan/10' : 'border-dark-border'}`}
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
                            className="w-full p-3 bg-dark-card rounded-lg text-lg font-semibold focus:ring-2 focus:ring-neon-cyan focus:outline-none border border-dark-border"
                        />
                         <div className="flex flex-wrap gap-2 mt-3">
                            {percentages.map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePercentageClick(p)}
                                    disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                    className="flex-grow text-xs bg-dark-card hover:bg-dark-border py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {p === 100 ? 'MAX' : `${p}%`}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {solana.connected && (
                        <div className="py-2 animate-fade-in-up" style={{animationDuration: '300ms'}}>
                            {currentUserToken ? (
                                 <div className="text-center">
                                    <p className="text-xl font-bold text-text-primary">
                                        {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-3 px-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 text-neon-cyan">
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
                        <div className="p-4 bg-dark-card/50 rounded-lg text-center animate-fade-in-up" style={{animationDuration: '300ms'}}>
                            <p className="text-2xl font-bold text-text-primary">
                                {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                            </p>
                            <p className="text-md text-text-secondary font-semibold">
                                ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    )}
                     <button onClick={handleDonate} disabled={solana.loading || !solana.connected || !(parseFloat(amount) > 0)} className="w-full neon-button-magenta font-bold py-3 rounded-full text-xl disabled:opacity-50">
                         {solana.loading ? t('processing') : (solana.connected ? t('donate') : t('connect_wallet'))}
                    </button>
                </div>
            </div>
        </div>
    );
}