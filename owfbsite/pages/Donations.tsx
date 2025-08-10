
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS, KNOWN_TOKEN_MINT_ADDRESSES } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { AlertTriangle } from 'lucide-react';

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
            // Format to a reasonable precision and remove trailing zeros
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
                <h1 className="text-4xl font-bold text-accent-400">{t('make_donation')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-400">
                    {t('donation_desc')}
                </p>
            </div>

            <div className="bg-accent-900/30 border-l-4 border-accent-500 text-accent-200 p-4 rounded-md shadow-md flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-accent-500 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                    {t('donation_solana_warning')}
                </p>
            </div>
            
            <div className="bg-primary-800 p-8 rounded-lg shadow-3d max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('donations_form_title')}</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-primary-400 mb-2">{t('select_token')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {tokens.map(token => (
                                <button
                                    key={token.symbol}
                                    onClick={() => setSelectedToken(token.symbol)}
                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-accent-500 bg-accent-900/50' : 'border-primary-600'}`}
                                >
                                    <div className="w-8 h-8 mb-2">{token.icon}</div>
                                    <span className="font-semibold">{token.symbol}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-primary-400 mb-1">{t('amount')}</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-3 bg-primary-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent-500 focus:outline-none"
                        />
                         <div className="flex flex-wrap gap-2 mt-3">
                            {percentages.map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePercentageClick(p)}
                                    disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                    className="flex-grow text-xs bg-primary-700/50 hover:bg-primary-700 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <p className="text-xl font-bold text-primary-200">
                                        {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-3 px-4 bg-accent-900/20 border border-accent-500/30 rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 text-accent-200">
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
                        <div className="p-4 bg-primary-700 rounded-lg text-center animate-fade-in-up" style={{animationDuration: '300ms'}}>
                            <p className="text-2xl font-bold text-primary-100">
                                {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                            </p>
                            <p className="text-md text-primary-300 font-semibold">
                                ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    )}
                     <button onClick={handleDonate} disabled={solana.loading || !solana.connected || !(parseFloat(amount) > 0)} className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-primary-950 font-bold py-3 rounded-lg text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                         {solana.loading ? t('processing') : (solana.connected ? t('donate') : t('connect_wallet'))}
                    </button>
                </div>
            </div>
        </div>
    );
}