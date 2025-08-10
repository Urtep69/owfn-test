
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, TrendingUp, Gift, Database, HeartHandshake } from 'lucide-react';
import { MOCK_STAKING_INFO } from '../constants.ts';
import { OwfnIcon } from '../components/IconComponents.tsx';

const StatCard = ({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string, subtext?: string }) => (
    <div className="bg-primary-800 p-6 rounded-xl shadow-3d">
        <div className="flex items-center space-x-4">
            <div className="bg-primary-700/50 text-accent-400 rounded-lg p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm text-primary-400">{title}</p>
                <p className="text-2xl font-bold text-primary-100">{value}</p>
                 {subtext && <p className="text-xs text-primary-500">{subtext}</p>}
            </div>
        </div>
    </div>
);

const ConnectWalletPrompt = () => {
    const { t, solana } = useAppContext();
    return (
        <div className="text-center p-12 bg-primary-800 rounded-lg shadow-3d">
            <Wallet className="mx-auto w-16 h-16 text-accent-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('staking_connect_title')}</h2>
            <p className="text-primary-400 mb-6">{t('staking_connect_prompt')}</p>
            <button
                onClick={() => solana.connectWallet()}
                disabled={solana.loading}
                className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
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
            alert(t(result.messageKey));
        }
    };
    
    const handleClaim = async () => {
        const result = await solana.claimRewards();
         if (result.success) {
            alert(t(result.messageKey, result.params));
        } else {
            alert(t(result.messageKey));
        }
    }

    const setPercentage = (percentage: number) => {
        setAmount(((balance * percentage) / 100).toString());
    }

    return (
        <>
         <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-primary-800 p-8 rounded-lg shadow-3d">
                <div className="flex border-b border-primary-700 mb-6">
                    <button onClick={() => setActiveTab('stake')} className={`py-2 px-4 font-semibold ${activeTab === 'stake' ? 'border-b-2 border-accent-500 text-accent-400' : 'text-primary-500'}`}>{t('stake')}</button>
                    <button onClick={() => setActiveTab('unstake')} className={`py-2 px-4 font-semibold ${activeTab === 'unstake' ? 'border-b-2 border-accent-500 text-accent-400' : 'text-primary-500'}`}>{t('unstake')}</button>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="stake-amount" className="text-sm font-medium text-primary-400">{t('amount')}</label>
                        <span className="text-sm text-primary-400">{t('balance')}: {balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            id="stake-amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-3 bg-primary-700 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-accent-500 focus:outline-none pr-16"
                        />
                        <OwfnIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8"/>
                    </div>
                     <div className="flex justify-between mt-2 space-x-2">
                        {[25, 50, 75, 100].map(p => (
                            <button key={p} onClick={() => setPercentage(p)} className="flex-1 text-xs bg-primary-700/50 hover:bg-primary-700 py-1 rounded-md transition-colors">{p === 100 ? 'MAX' : `${p}%`}</button>
                        ))}
                    </div>
                    <button onClick={handleAction} disabled={solana.loading} className="mt-6 w-full bg-accent-500 text-primary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-600 transition-colors disabled:opacity-50">
                        {solana.loading ? t('processing') : (activeTab === 'stake' ? t('stake_owfn') : t('unstake_owfn'))}
                    </button>
                </div>
            </div>
             <div className="bg-primary-800 p-8 rounded-lg shadow-3d flex flex-col justify-center items-center text-center">
                 <Gift size={48} className="text-accent-500 mb-4" />
                 <h3 className="text-xl font-bold">{t('my_rewards')}</h3>
                 <p className="text-4xl font-bold my-2 text-accent-400">{solana.earnedRewards.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</p>
                 <button onClick={handleClaim} disabled={solana.loading || solana.earnedRewards <= 0} className="mt-4 w-full max-w-xs bg-accent-500 text-primary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-600 transition-colors disabled:opacity-50">
                    {solana.loading ? t('processing') : t('claim_rewards')}
                 </button>
            </div>
        </div>
         <div className="mt-8 bg-primary-800 p-8 rounded-lg shadow-3d">
            <div className="flex items-center gap-4 mb-4">
                <HeartHandshake className="w-10 h-10 text-rose-500"/>
                <div>
                    <h3 className="text-2xl font-bold">{t('impact_staking_title')}</h3>
                    <p className="text-primary-400">{t('impact_staking_desc')}</p>
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
                    className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl text-accent-500 w-20 text-center">{impactStakingPercentage}%</span>
            </div>
            <p className="text-sm text-center mt-2 text-primary-400">
                {t('donate_rewards_percentage', { percentage: impactStakingPercentage })}
            </p>
        </div>
        </>
    );
}

export default function Staking() {
    const { t, solana } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-400">{t('staking_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-400">
                    {t('staking_subtitle')}
                </p>
            </div>

            {solana.connected ? (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={<Database size={24} />} title={t('total_staked')} value={`${(MOCK_STAKING_INFO.totalStaked / 1_000_000_000).toFixed(2)}B OWFN`} />
                        <StatCard icon={<TrendingUp size={24} />} title={t('estimated_apy')} value={`${MOCK_STAKING_INFO.apy}%`} />
                        <StatCard icon={<OwfnIcon className="w-6 h-6" />} title={t('my_staked_balance')} value={`${solana.stakedBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} OWFN`} />
                    </div>
                    <StakingInterface />
                </>
            ) : (
                <ConnectWalletPrompt />
            )}
        </div>
    );
}
