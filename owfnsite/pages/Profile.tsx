import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, DollarSign, Gem, Loader2, Image as ImageIcon, Activity, Layers, ArrowUpRight, ArrowDownLeft, HelpCircle, ExternalLink } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { ImpactBadge, Nft, HumanizedTransaction } from '../types.ts';
import { PortfolioChart } from '../components/PortfolioChart.tsx';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';


// --- In-page Components for Profile Dashboard ---

const NftCard = ({ nft }: { nft: Nft }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <a href={nft.solscanUrl} target="_blank" rel="noopener noreferrer" className="block bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow">
            <div className="aspect-square w-full relative">
                {!imageLoaded && <div className="absolute inset-0 bg-primary-200 dark:bg-darkPrimary-600 animate-pulse"></div>}
                <img 
                    src={nft.imageUrl} 
                    alt={nft.name} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/300?text=${nft.name.charAt(0)}`; setImageLoaded(true); }}
                />
            </div>
            <div className="p-3">
                <p className="font-bold text-sm truncate group-hover:text-accent-600 dark:group-hover:text-darkAccent-400">{nft.name}</p>
                <p className="text-xs text-primary-500 dark:text-darkPrimary-400 truncate">{nft.collectionName || 'Unknown Collection'}</p>
            </div>
        </a>
    );
};

const TransactionRow = ({ tx }: { tx: HumanizedTransaction }) => {
    const getIcon = () => {
        switch(tx.type) {
            case 'send': return <ArrowUpRight className="w-5 h-5 text-red-500" />;
            case 'receive': return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            default: return <HelpCircle className="w-5 h-5 text-primary-500 dark:text-darkPrimary-400" />;
        }
    };
    return (
        <div className="flex items-center justify-between p-3 hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 rounded-md">
            <div className="flex items-center gap-3">
                <div className="bg-primary-100 dark:bg-darkPrimary-700 p-2 rounded-full">{getIcon()}</div>
                <div>
                    <p className="text-sm font-semibold">{tx.description}</p>
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{tx.timestamp.toLocaleString()}</p>
                </div>
            </div>
            <a href={tx.solscanUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-primary-500 dark:text-darkPrimary-400 hover:text-accent-600 dark:hover:text-darkAccent-400">
                <ExternalLink size={16}/>
            </a>
        </div>
    );
};


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, nfts, transactions, solDomain, loading, isAuthenticating } = solana;
    const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');

    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    if (isAuthenticating) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Loader2 className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">{t('authenticating')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('auth_prompt')}</p>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                    {t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <header className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-accent-600 dark:text-darkAccent-400">{solDomain ? `${solDomain}` : t('impact_dashboard_title')}</h1>
                        {address && <AddressDisplay address={address} />}
                    </div>
                    {loading ? (
                         <div className="h-10 bg-primary-200 dark:bg-darkPrimary-700 rounded w-48 animate-pulse"></div>
                    ) : (
                        <div className="text-right">
                             <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                             <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <main className="lg:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <div className="border-b border-primary-200 dark:border-darkPrimary-700 mb-4">
                        <nav className="flex space-x-4">
                             {[
                                { id: 'tokens', label: t('my_tokens'), icon: <Layers size={18} /> },
                                { id: 'nfts', label: 'NFTs', icon: <ImageIcon size={18} /> },
                                { id: 'activity', label: t('activity_tab'), icon: <Activity size={18} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-semibold transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-accent-500 text-accent-600 dark:border-darkAccent-400 dark:text-darkAccent-400'
                                            : 'border-transparent text-primary-500 dark:text-darkPrimary-400 hover:text-primary-800 dark:hover:text-darkPrimary-200'
                                    }`}
                                >{tab.icon} {tab.label}</button>
                            ))}
                        </nav>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-lg">{t('profile_loading_data')}</span>
                        </div>
                    ) : (
                        <div>
                            {activeTab === 'tokens' && (
                                userTokens.length > 0 ? (
                                     <div className="space-y-1">
                                        {userTokens.map(token => (
                                            <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                                <a className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors cursor-pointer">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 flex-shrink-0">{token.logo}</div>
                                                        <div>
                                                            <p className="font-bold text-sm">{token.symbol}</p>
                                                            <p className="text-xs text-primary-500 dark:text-darkPrimary-500">{token.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right font-mono text-sm">
                                                        <p className="font-semibold">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                                                        <p className="text-primary-500 dark:text-darkPrimary-500">@ ${token.pricePerToken.toPrecision(3)}</p>
                                                    </div>
                                                    <p className="text-right font-semibold font-mono text-sm">${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </a>
                                            </Link>
                                        ))}
                                    </div>
                                ) : <p className="text-center py-10">{t('profile_no_tokens')}</p>
                            )}
                             {activeTab === 'nfts' && (
                                nfts.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {nfts.map(nft => <NftCard key={nft.id} nft={nft}/>)}
                                    </div>
                                ) : <p className="text-center py-10">{t('profile_no_nfts')}</p>
                            )}
                             {activeTab === 'activity' && (
                                transactions.length > 0 ? (
                                    <div className="space-y-1">
                                        {transactions.map(tx => <TransactionRow key={tx.signature} tx={tx}/>)}
                                    </div>
                                ) : <p className="text-center py-10">{t('profile_no_activity')}</p>
                            )}
                        </div>
                    )}
                </main>

                <aside className="lg:col-span-1 space-y-8">
                     <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h3 className="text-lg font-bold mb-2">{t('portfolio_allocation')}</h3>
                         {loading ? (
                             <div className="h-64 bg-primary-200 dark:bg-darkPrimary-700 rounded animate-pulse"></div>
                         ) : (
                             <PortfolioChart tokens={userTokens}/>
                         )}
                    </div>
                     <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                        <h3 className="text-lg font-bold mb-4">{t('my_impact_stats')}</h3>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-accent-500 dark:text-darkAccent-400"/><span>{t('total_donated')}: $0.00</span></div>
                             <p className="text-xs text-center text-primary-500 dark:text-darkPrimary-400 p-2 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-md">{t('coming_soon_impact_tracking')}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}