
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DISTRIBUTION_WALLETS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';
import { AlertTriangle, Info } from 'lucide-react';

const tokens = [
    { symbol: 'OWFN', icon: <OwfnIcon /> },
    { symbol: 'SOL', icon: <SolIcon /> },
    { symbol: 'USDC', icon: <UsdcIcon /> },
    { symbol: 'USDT', icon: <UsdtIcon /> },
];

export default function Donations() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');

    const currentUserToken = useMemo(() => solana.userTokens.find(t => t.symbol === selectedToken), [solana.userTokens, selectedToken]);

    const tokenPrice = useMemo(() => currentUserToken?.pricePerToken ?? 0, [currentUserToken]);

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
            // Format to a reasonable precision and remove trailing zeros
            setAmount(parseFloat(newAmount.toFixed(8)).toString());
        }
    };

    const handleDonate = async () => {
        if (!solana.connected) {
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
            alert(t('donation_success_alert', result.params));
            setAmount('');
        } else {
            alert(t(result.messageKey, result.params));
        }
    };
    
    const buttonText = useMemo(() => {
        if (solana.loading) return t('processing');
        if (!solana.connected) return t('connect_wallet');
        return t('donate');
    }, [solana.connected, solana.loading, t]);

    const percentages = [5, 10, 15, 25, 50, 75, 100];

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary">{t('make_donation')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground-muted">
                    {t('donation_desc')}
                </p>
            </div>
            
            <div className="bg-surface p-8 md:p-12 rounded-2xl shadow-lg border border-border transform hover:scale-[1.02] transition-transform duration-300">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">{t('donation_message_title')}</h2>
                    <p className="text-foreground-muted leading-relaxed">{t('donation_message_p1')}</p>
                    <p className="text-foreground-muted leading-relaxed">
                        {t('donation_message_p2_part1')}
                        <span className="font-bold text-primary">
                            {t('donation_message_p2_project_name')}
                        </span>
                        {t('donation_message_p2_part2')}
                    </p>
                    <p className="text-foreground-muted leading-relaxed">{t('donation_message_p3')}</p>
                    <p className="font-bold text-foreground pt-2">{t('donation_message_thanks')}</p>
                </div>
            </div>

            <div className="bg-secondary/10 border-l-4 border-secondary text-secondary p-4 rounded-md shadow-md flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                    {t('donation_solana_warning')}
                </p>
            </div>
            
            <div className="bg-surface p-8 rounded-lg shadow-lg border border-border max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('donations_form_title')}</h2>

                <div className="bg-background/50 p-3 rounded-lg text-sm text-foreground-muted mb-6 flex items-start gap-2">
                    <Info size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <span>{t('donation_fee_info')}</span>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">{t('select_token')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {tokens.map(token => (
                                <button
                                    key={token.symbol}
                                    onClick={() => setSelectedToken(token.symbol)}
                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedToken === token.symbol ? 'border-primary bg-primary/10' : 'border-border'}`}
                                >
                                    <div className="w-8 h-8 mb-2">{token.icon}</div>
                                    <span className="font-semibold">{token.symbol}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-foreground-muted mb-1">{t('amount')}</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-3 bg-background rounded-lg text-lg font-semibold focus:ring-2 focus:ring-ring focus:outline-none border border-border"
                        />
                         <div className="flex flex-wrap gap-2 mt-3">
                            {percentages.map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePercentageClick(p)}
                                    disabled={!solana.connected || !currentUserToken || currentUserToken.balance <= 0}
                                    className="flex-grow text-xs bg-border/50 hover:bg-border py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <p className="text-xl font-bold text-foreground">
                                        {t('balance')}: {currentUserToken.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUserToken.symbol}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-3 px-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 text-secondary">
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
                        <div className="p-4 bg-background rounded-lg text-center animate-fade-in-up" style={{animationDuration: '300ms'}}>
                            <p className="text-2xl font-bold text-foreground">
                                {parseFloat(amount).toLocaleString(undefined, {maximumFractionDigits: 4})} {selectedToken}
                            </p>
                            <p className="text-md text-foreground-muted font-semibold">
                                ~ ${usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    )}
                     <button onClick={handleDonate} disabled={solana.loading || (solana.connected && !(parseFloat(amount) > 0))} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg text-xl hover:bg-primary/90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                         {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}