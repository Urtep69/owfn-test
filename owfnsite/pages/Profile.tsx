import React, { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, HandHeart, Vote, Gem, Loader2, Image as ImageIcon, History, Layers } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, UserNFT, ParsedTransaction } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.tsx';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

const PIE_CHART_COLORS = ['#b89b74', '#9e825c', '#eac06a', '#f0d090', '#d2b48c', '#846944', '#6a502c', '#503814'];

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-sm p-2 border border-primary-200 dark:border-darkPrimary-600 rounded-lg shadow-lg text-primary-900 dark:text-darkPrimary-100">
          <p className="font-bold">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Value: $${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        </div>
      );
    }
    return null;
};

const NFTCard = ({ nft }: { nft: UserNFT }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow">
        <div className="aspect-square w-full bg-primary-200 dark:bg-darkPrimary-600 flex items-center justify-center overflow-hidden">
             {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
                <ImageIcon className="w-12 h-12 text-primary-400 dark:text-darkPrimary-500" />
            )}
        </div>
        <div className="p-3">
            <p className="font-bold text-sm truncate" title={nft.name}>{nft.name}</p>
            <p className="text-xs text-primary-500 dark:text-darkPrimary-400 truncate" title={nft.collectionName}>{nft.collectionName || 'Single Edition'}</p>
        </div>
    </div>
);

const TransactionRow = ({ tx }: { tx: ParsedTransaction }) => {
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() / 1000) - timestamp);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m ago`;
        return `${Math.floor(seconds)}s ago`;
    }

    return (
        <a 
            href={`https://solscan.io/tx/${tx.signature}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors"
        >
            <div className="flex justify-between items-center">
                <p className="text-sm text-primary-800 dark:text-darkPrimary-200 flex-1 pr-4">{tx.description || tx.type}</p>
                <div className="text-right">
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{new Date(tx.timestamp * 1000).toLocaleString()}</p>
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-400">{timeAgo(tx.timestamp)}</p>
                </div>
            </div>
        </a>
    );
}

export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, userNfts, userTransactions, solDomain, loading, loadingAdditionalData, userStats } = solana;
    const [activeTab, setActiveTab] = useState<'portfolio' | 'nfts' | 'history'>('portfolio');

    const totalUsdValue = useMemo(() => userTokens.reduce((sum, token) => sum + token.usdValue, 0), [userTokens]);

    const pieChartData = useMemo(() => {
        return userTokens
            .filter(token => token.usdValue > 0.01)
            .map((token, index) => ({
                name: token.symbol,
                value: token.usdValue,
                color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            }));
    }, [userTokens]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={loading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {loading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <header className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-200 to-accent-400 dark:from-darkAccent-700 dark:to-darkAccent-500 rounded-full flex-shrink-0"></div>
                <div>
                    <h1 className="text-3xl font-bold text-accent-600 dark:text-darkAccent-400">{solDomain || t('my_profile')}</h1>
                    {address && <AddressDisplay address={address} className="text-base" />}
                </div>
            </header>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <div className="border-b border-primary-200 dark:border-darkPrimary-700 mb-6">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('portfolio')} className={`px-3 py-2 font-semibold text-sm ${activeTab === 'portfolio' ? 'border-b-2 border-accent-500 text-accent-600' : 'text-primary-500'}`}><Layers className="inline-block mr-1.5" size={16}/>{t('my_tokens')}</button>
                        <button onClick={() => setActiveTab('nfts')} className={`px-3 py-2 font-semibold text-sm ${activeTab === 'nfts' ? 'border-b-2 border-accent-500 text-accent-600' : 'text-primary-500'}`}><ImageIcon className="inline-block mr-1.5" size={16}/>NFTs</button>
                        <button onClick={() => setActiveTab('history')} className={`px-3 py-2 font-semibold text-sm ${activeTab === 'history' ? 'border-b-2 border-accent-500 text-accent-600' : 'text-primary-500'}`}><History className="inline-block mr-1.5" size={16}/>{t('history')}</button>
                    </nav>
                </div>

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                    <div className="animate-fade-in-up space-y-6">
                        {loading ? (
                             <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-primary-100 dark:bg-darkPrimary-900/50 p-4 rounded-lg">
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                     <div className="bg-primary-100 dark:bg-darkPrimary-900/50 p-4 rounded-lg">
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('token_types')}</p>
                                        <p className="text-3xl font-bold">{userTokens.length}</p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-5 gap-6">
                                    <div className="lg:col-span-2 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                                    {pieChartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="lg:col-span-3">
                                         {userTokens.length > 0 ? (
                                            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                                                {userTokens.map(token => (
                                                    <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                                        <a className="grid grid-cols-2 gap-4 items-center p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50">
                                                            <div className="flex items-center space-x-3"><div className="w-8 h-8">{token.logo}</div><div><p className="font-bold">{token.symbol}</p><p className="text-xs text-primary-500">@ ${token.pricePerToken.toPrecision(3)}</p></div></div>
                                                            <div className="text-right"><p className="font-mono font-semibold">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p><p className="text-xs text-primary-500">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                                                        </a>
                                                    </Link>
                                                ))}
                                            </div>
                                         ) : (
                                            <p className="text-center py-8">{t('profile_no_tokens')}</p>
                                         )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                {/* NFTs Tab */}
                {activeTab === 'nfts' && (
                     <div className="animate-fade-in-up">
                        {loading ? (
                             <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                        ) : userNfts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {userNfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-primary-500 dark:text-darkPrimary-400">No NFTs found in this wallet.</p>
                        )}
                     </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                     <div className="animate-fade-in-up">
                        {loadingAdditionalData ? (
                             <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                        ) : userTransactions.length > 0 ? (
                            <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                                {userTransactions.map(tx => <TransactionRow key={tx.signature} tx={tx} />)}
                            </div>
                        ) : (
                             <p className="text-center py-8 text-primary-500 dark:text-darkPrimary-400">No recent transactions found.</p>
                        )}
                     </div>
                )}
            </div>
            
            <ComingSoonWrapper>
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4">{t('my_impact_stats')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${userStats.totalDonated.toFixed(2)}`} />
                        <StatCard icon={<HandHeart size={24} />} title={t('projects_supported')} value={userStats.projectsSupported} />
                        <StatCard icon={<Vote size={24} />} title={t('votes_cast')} value={userStats.votesCast} />
                    </div>
                </div>
            </ComingSoonWrapper>
        </div>
    );
}