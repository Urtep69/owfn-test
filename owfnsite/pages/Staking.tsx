import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, TrendingUp, Gift, Database, HeartHandshake } from 'lucide-react';
import { OwfnIcon } from '../components/IconComponents.tsx';

const StatCard = ({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string, subtext?: string }) => (
    <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center space-x-4">
            <div className="bg-slate-100 dark:bg-slate-700/50 text-primary-500 dark:text-primary-400 rounded-lg p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                 {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
        </div>
    </div>
);

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <Wallet className="mx-auto w-16 h-16 text-primary-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('staking_connect_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('staking_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md hover:shadow-glow-primary"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

const StakingInterface = () => {
    const { t, solana } = useAppContext();
    const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
    const [amount, setAmount] = useState('');
    const [impactStakingPercentage, setImpactStakingPercentage] = useState(0);
    
    const owfnToken = useMemo(() => solana.userTokens.find(t => t.symbol === 'OWFN'), [solana.userTokens]);
    const balance = activeTab === 'stake' ? owfnToken?.balance ?? 0 : solana.stakedBalance;

    const handleAction = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert(t('invalid_amount_generic'));
            return;
        }

        let result;
        if (activeTab === 'stake') {
            result = await solana.stakeTokens(numAmount);
        } else {
            result = await solana.unstakeTokens(numAmount);
        }
        
        if (result.success) {
            alert(t(result.messageKey, result.params));
            setAmount('');
        } else {
            // Error is handled inside the hook for now
        }
    };
    
    const handleClaim = async () => {
        const result = await solana.claimRewards();
         if (result.success) {
            alert(t(result.messageKey, result.params));
        } else {
            // Error is handled inside the hook for now
        }
    }

    const setPercentage = (percentage: number) => {
        setAmount(((balance * percentage) / 100).toString());
    }

    return (
        <>
         <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                    <button onClick={() => setActiveTab('stake')} className={`py-2 px-4 font-semibold ${activeTab === 'stake' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>{t('stake')}</button>
                    <button onClick={() => setActiveTab('unstake')} className={`py-2 px-4 font-semibold ${activeTab === 'unstake' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>{t('unstake')}</button>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="stake-amount" className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('amount')}</label>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('balance')}: {balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            id="stake-amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none pr-16"
                        />
                        <OwfnIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8"/>
                    </div>
                     <div className="flex justify-between mt-2 space-x-2">
                        {[25, 50, 75, 100].map(p => (
                            <button key={p} onClick={() => setPercentage(p)} className="flex-1 text-xs bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 py-1 rounded-md transition-colors">{p === 100 ? 'MAX' : `${p}%`}</button>
                        ))}
                    </div>
                    <button onClick={handleAction} disabled={solana.loading} className="mt-6 w-full bg-primary-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                        {solana.loading ? t('processing') : (activeTab === 'stake' ? t('stake_owfn') : t('unstake_owfn'))}
                    </button>
                </div>
            </div>
             <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col justify-center items-center text-center">
                 <Gift size={48} className="text-primary-500 mb-4" />
                 <h3 className="text-xl font-bold">{t('my_rewards')}</h3>
                 <p className="text-4xl font-bold my-2 text-primary-600 dark:text-primary-400">{solana.earnedRewards.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</p>
                 <button onClick={handleClaim} disabled={solana.loading || solana.earnedRewards <= 0} className="mt-4 w-full max-w-xs bg-primary-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                    {solana.loading ? t('processing') : t('claim_rewards')}
                 </button>
            </div>
        </div>
         <div className="mt-8 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
                <HeartHandshake className="w-10 h-10 text-rose-500"/>
                <div>
                    <h3 className="text-2xl font-bold">{t('impact_staking_title')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{t('impact_staking_desc')}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={impactStakingPercentage}
                    onChange={(e) => setImpactStakingPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="font-bold text-xl text-primary-600 dark:text-primary-500 w-20 text-center">{impactStakingPercentage}%</span>
            </div>
            <p className="text-sm text-center mt-2 text-slate-600 dark:text-slate-400">{t('donate_rewards_percentage', { percentage: impactStakingPercentage })}</p>
        </div>
        </>
    );
};

// FIX: The file was incomplete, causing a build error. This completes the file by adding the main Staking component and its default export.
export default function Staking() {
    const { t, solana } = useAppContext();
    
    if (!solana.connected) {
        return <ConnectWalletPrompt />;
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">{t('staking_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    {t('staking_subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    icon={<Database size={24} />} 
                    title={t('total_staked')} 
                    value={`${(123456789).toLocaleString()} OWFN`} 
                    subtext="≈ $1,234,567.89"
                />
                 <StatCard 
                    icon={<TrendingUp size={24} />} 
                    title={t('estimated_apy')} 
                    value="~5.00%" 
                    subtext="Including 2% base interest"
                />
                 <StatCard 
                    icon={<Wallet size={24} />} 
                    title={t('my_staked_balance')} 
                    value={`${solana.stakedBalance.toLocaleString()} OWFN`}
                />
            </div>
            
            <StakingInterface />

        </div>
    );
}
