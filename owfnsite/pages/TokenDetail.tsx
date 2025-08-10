

import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { 
    Star, Share2, Search, Settings2, Shield, BarChartHorizontal, LineChart, 
    CandlestickChart, Waves, PenLine, Text, MoreHorizontal, CheckCircle, XCircle, AlertCircle,
    ThumbsUp, ThumbsDown, ChevronDown, ExternalLink, Users, MessageSquare, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { MOCK_TOKEN_DETAILS, TOKEN_DETAILS, MOCK_LIVE_TRANSACTIONS } from '../constants.ts';
import type { LiveTransaction, TokenDetails, DextScore, TokenAudit, CommunityTrust } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';

// Mock data for new panels
const MOCK_TOP_HOLDERS = [
    { address: '7vAUf...dvDy', amount: 1200000000, percentage: 6.67, value: 147120000 },
    { address: 'HJBKh...X1k6', amount: 800000000, percentage: 4.44, value: 98080000 },
    { address: 'Raydi...NVde', amount: 540000000, percentage: 3.00, value: 66204000 },
    { address: 'EAS2A...j1fn', amount: 350000000, percentage: 1.94, value: 42910000 },
];

const MOCK_SENTIMENT_DATA = [
    { name: 'Positive', value: 75, color: '#22c55e' },
    { name: 'Neutral', value: 15, color: '#64748b' },
    { name: 'Negative', value: 10, color: '#ef4444' },
];

// --- Sub-components defined within the page for locality ---
const TopHoldersPanel = ({ t }: { t: (k: string) => string }) => (
    <div className="bg-primary-800 rounded-md p-3 space-y-2">
        <h4 className="text-sm font-bold flex items-center gap-2"><Users size={14}/>{t('top_holders')}</h4>
        <div className="text-xs space-y-1">
            {MOCK_TOP_HOLDERS.map(holder => (
                <div key={holder.address} className="grid grid-cols-3 gap-2 items-center">
                    <AddressDisplay address={holder.address} className="text-xs"/>
                    <span className="text-right font-mono">{(holder.amount / 1_000_000).toFixed(2)}M</span>
                    <span className="text-right font-mono">{holder.percentage.toFixed(2)}%</span>
                </div>
            ))}
        </div>
    </div>
);

const MarketSentimentPanel = ({ t }: { t: (k: string) => string }) => (
     <div className="bg-primary-800 rounded-md p-3 space-y-2">
        <h4 className="text-sm font-bold flex items-center gap-2"><MessageSquare size={14}/>{t('market_sentiment')}</h4>
        <div className="flex items-center justify-around h-24">
            <ResponsiveContainer width="40%" height="100%">
                 <PieChart>
                    <Pie data={MOCK_SENTIMENT_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5}>
                        {MOCK_SENTIMENT_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="text-xs space-y-1">
                {MOCK_SENTIMENT_DATA.map(entry => (
                     <div key={entry.name} className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                         <span>{entry.name}: {entry.value}%</span>
                     </div>
                ))}
            </div>
        </div>
    </div>
);

const TokenDetailHeader = ({ token }: { token: TokenDetails }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2 bg-primary-800 rounded-md">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">{token.logo}</div>
            <div>
                <h1 className="text-xl font-bold text-primary-100">{token.symbol === 'SOL' ? 'SOL' : `${token.symbol} / SOL`}</h1>
                <p className="text-sm text-primary-400">{token.name}</p>
            </div>
            <div className="flex items-center gap-2 text-primary-400">
                <button className="hover:text-yellow-400 transition-colors"><Star size={20} /></button>
                <button className="hover:text-primary-100 transition-colors"><Share2 size={20} /></button>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input 
                    type="text" 
                    placeholder="Search..."
                    className="bg-primary-700 border border-primary-600 rounded-md py-1.5 pl-9 pr-3 w-full focus:ring-accent-500 focus:border-accent-500"
                />
            </div>
            {token.audit && <button className="bg-accent-500 text-primary-950 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-accent-400 flex items-center gap-1">
                <Shield size={14} /> AUDIT: {token.audit.alerts}
            </button>}
            <button className="p-1.5 text-primary-400 hover:text-primary-100 transition-colors"><Settings2 size={20} /></button>
        </div>
    </div>
);

const InfoItem = ({ label, value, valueClassName = '' }: { label: string, value: React.ReactNode, valueClassName?: string }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-primary-400">{label}</span>
        <span className={`font-mono font-semibold text-primary-100 ${valueClassName}`}>{value}</span>
    </div>
);

const TokenInfoPanel = ({ token }: { token: TokenDetails }) => {
    const [activeTimespan, setActiveTimespan] = useState('24h');
    const totalSupply = token.symbol === 'OWFN' ? TOKEN_DETAILS.totalSupply : token.circulatingSupply;
    
    return (
        <div className="bg-primary-800 rounded-md p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Market Cap" value={`$${(token.marketCap / 1_000_000).toFixed(2)}M`} />
                {token.liquidity && <InfoItem label="Liquidity" value={`$${(token.liquidity / 1_000_000).toFixed(2)}M`} />}
                <InfoItem label="Circ. Supply" value={`${(token.circulatingSupply / 1_000_000_000).toFixed(2)}B`} />
                <InfoItem label="Holders" value={token.holders.toLocaleString()} />
                {token.totalMarketCap && <InfoItem label="Total Mktcap" value={`$${(token.totalMarketCap / 1_000_000).toFixed(2)}M`} />}
                <InfoItem label="24h Volume" value={`$${(token.volume24h / 1_000).toFixed(2)}K`} />
                <InfoItem label="Total Supply" value={`${(totalSupply / 1_000_000_000).toFixed(2)}B`} />
                {token.volatility && <InfoItem label="Volatility" value={`${(token.volatility * 100).toFixed(2)}%`} />}
                <InfoItem label="% Circ. Supply" value={`${((token.circulatingSupply / totalSupply) * 100).toFixed(2)}%`} />
                {token.totalTx24h && <InfoItem label="Total TX" value={token.totalTx24h.toLocaleString()} />}
                {token.pooledSol && <InfoItem label="Pooled SOL" value={token.pooledSol.toLocaleString()} />}
                {token.pooledToken && <InfoItem label={`Pooled ${token.symbol}`} value={`${(token.pooledToken / 1_000_000).toFixed(2)}M`} />}
                {token.pooledToken && <InfoItem label="% Pooled" value={`0.61%`} />}
                {token.poolCreated !== 'N/A' && <InfoItem label="Pool Created" value={token.poolCreated!} />}
            </div>
            <div className="border-t border-primary-700 pt-2">
                <div className="flex justify-around bg-primary-700 rounded-md p-1">
                    {['5m', '1h', '6h', '24h', '7d'].map(span => (
                        <button key={span} onClick={() => setActiveTimespan(span)} className={`px-3 py-1 text-xs rounded ${activeTimespan === span ? 'bg-accent-600 text-white' : 'text-primary-400 hover:bg-primary-600'}`}>
                            {span}
                        </button>
                    ))}
                </div>
            </div>
            <div className="border-t border-primary-700 pt-2 text-xs space-y-1">
                <InfoItem label="Txs" value="703" />
                <InfoItem label="Vol" value="$158.37K" />
                <InfoItem label="Makers" value="198" />
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <InfoItem label="Buys" value="399" valueClassName="text-green-500" />
                        <InfoItem label="Sells" value="304" valueClassName="text-red-500" />
                    </div>
                     <div className="w-1/2 h-2 bg-primary-700 rounded-full flex">
                        <div className="bg-green-500 h-full rounded-l-full" style={{width: '56%'}}></div>
                        <div className="bg-red-500 h-full rounded-r-full" style={{width: '44%'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DEXTscorePanel = ({ scoreData, t }: { scoreData: DextScore, t: (k: string) => string }) => {
    const scorePercentage = (scoreData.score / scoreData.maxScore) * 100;
    const gradientStyle = {
        background: `radial-gradient(circle at center, #1c1917 60%, transparent 61%), conic-gradient(#d2b48c ${scorePercentage}%, #44403c 0)`
    };

    return (
        <div className="bg-primary-800 rounded-md p-3 space-y-2">
            <h4 className="text-sm font-bold">{t('dextscore_title')}</h4>
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={gradientStyle}>
                    <span className="text-2xl font-bold">{scoreData.score}</span>
                    <span className="absolute bottom-3 text-xs text-primary-400">/ {scoreData.maxScore}</span>
                </div>
                <div>
                    <p className="text-xs text-primary-400">{t('project_reliability_score')}</p>
                    <div className="flex gap-2 mt-1">
                        {scoreData.points.map((pt, i) => <span key={i} className="font-mono">{pt}pt</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuditPanel = ({ audit, t }: { audit: TokenAudit, t: (k: string, r?: any) => string }) => {
    const auditItems = [
        { label: t('contract_verified'), value: audit.contractVerified },
        { label: t('honeypot'), value: !audit.isHoneypot },
        { label: t('freezable'), value: !audit.isFreezable },
        { label: t('mintable'), value: audit.isMintable, warning: true },
    ];

    return (
        <div className="bg-primary-800 rounded-md p-3 space-y-2">
            <h4 className="text-sm font-bold">{t('audit_title')}</h4>
            <a href="#" className="text-xs text-blue-400 hover:underline flex items-center gap-1">{t('verify_external_audits')} <ExternalLink size={12} /></a>
            <div className="space-y-1">
                {auditItems.map(item => (
                    <div key={item.label} className="flex justify-between items-center text-xs">
                        <span className="text-primary-400 flex items-center gap-1">
                            {item.label}
                            {item.warning && <AlertCircle size={12} className="text-yellow-400" />}
                        </span>
                        {item.value ? 
                            <CheckCircle size={14} className="text-green-500" /> : 
                            <XCircle size={14} className="text-red-500" />
                        }
                    </div>
                ))}
            </div>
            {audit.alerts > 0 && 
                <button className="bg-accent-500/20 text-accent-300 text-xs font-bold w-full py-1 rounded-md hover:bg-accent-500/30">
                    {t('check_audits', {count: audit.alerts})}
                </button>
            }
        </div>
    );
};

const CommunityTrustPanel = ({ trust, t }: { trust: CommunityTrust, t: (k: string, r?: any) => string }) => {
    const totalVotes = trust.positiveVotes + trust.negativeVotes;
    const positivePercentage = totalVotes > 0 ? (trust.positiveVotes / totalVotes) * 100 : 50;
    
    return (
        <div className="bg-primary-800 rounded-md p-3 space-y-2">
            <h4 className="text-sm font-bold">{t('community_trust_title')}</h4>
            <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-green-400">{(positivePercentage).toFixed(2)}%</span>
                <div className="flex gap-2 text-primary-400">
                    <div className="flex items-center gap-1"><ThumbsUp size={14} /> {trust.positiveVotes}</div>
                    <div className="flex items-center gap-1"><ThumbsDown size={14} /> {trust.negativeVotes}</div>
                </div>
            </div>
            <div className="w-full h-2 bg-red-500/50 rounded-full flex">
                <div className="bg-green-500 h-full rounded-l-full" style={{width: `${positivePercentage}%`}}></div>
            </div>
            <p className="text-xs text-primary-400 text-right">{t('of_trades', { total: trust.totalTrades.toLocaleString() })}</p>
        </div>
    );
};

const LiveTransactionsPanel = ({ transactions, tokenSymbol, t }: { transactions: LiveTransaction[], tokenSymbol: string, t: (k: string, r?: any) => string }) => (
    <div className="bg-primary-800 rounded-md p-3">
        <h4 className="text-sm font-bold mb-2">{t('live_transactions')}</h4>
        <div className="text-xs h-96 overflow-y-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-primary-400">
                        <th className="text-left py-1 pr-2">{t('time')}</th>
                        <th className="text-left py-1 pr-2">{t('type')}</th>
                        <th className="text-right py-1 pr-2">{t('price_usd')}</th>
                        <th className="text-right py-1 pr-2">{t('amount_token', {token: tokenSymbol})}</th>
                        <th className="text-right py-1 pr-2">{t('total_usd')}</th>
                        <th className="text-right py-1 pl-2">Maker</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id} className={`${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                            <td className="font-mono py-1 pr-2">{tx.time}</td>
                            <td className="font-semibold py-1 pr-2 uppercase">{t(tx.type)}</td>
                            <td className="text-right font-mono py-1 pr-2">${tx.price.toFixed(4)}</td>
                            <td className="text-right font-mono py-1 pr-2">{tx.amount.toFixed(2)}</td>
                            <td className="text-right font-mono py-1 pr-2">${tx.totalUsd?.toFixed(2)}</td>
                            <td className="text-right font-mono py-1 pl-2 text-blue-400"><a href="#">{tx.maker?.substring(0,5)}...</a></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default function TokenDetail() {
    const { t, currentLanguage } = useAppContext();
    const params = useParams();
    const symbol = params?.['symbol'];
    const [location] = useLocation();
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const from = searchParams.get('from');

    const chartToolbarIcons = [
        { icon: <LineChart size={18} /> }, { icon: <CandlestickChart size={18} /> }, { icon: <BarChartHorizontal size={18} /> },
        { icon: <Waves size={18} /> }, { icon: <PenLine size={18} /> }, { icon: <Text size={18} /> },
    ];

    const token = useMemo(() => MOCK_TOKEN_DETAILS[symbol as string], [symbol]);

    if (!token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                <Link to={from || '/dashboard'} className="text-accent-500 hover:underline mt-4 inline-block">{from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}</Link>
            </div>
        );
    }
    
    const description = token.description[currentLanguage.code] || token.description['en'] || '';

    return (
        <div className="animate-fade-in text-primary-100 -mt-8 -mx-8 p-1 bg-primary-950">
            <div className="bg-primary-900 rounded-lg p-2 space-y-2">
                <TokenDetailHeader token={token} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="lg:col-span-2 space-y-2">
                        <div className="bg-primary-800 rounded-md h-96 flex flex-col">
                             <div className="p-2 flex items-center justify-between border-b border-primary-700">
                                <div className="flex items-center gap-1 text-sm">
                                    <button className="px-2 py-1 bg-primary-700 rounded">Time</button>
                                    <button className="px-2 py-1 hover:bg-primary-700 rounded flex items-center gap-1">
                                        Charts <ChevronDown size={14} />
                                    </button>
                                    <button className="px-2 py-1 hover:bg-primary-700 rounded">Indicators</button>
                                </div>
                                <div className="flex items-center gap-1 text-primary-400">
                                    {chartToolbarIcons.map((item, i) => (
                                        <button key={i} className="p-1 hover:bg-primary-700 rounded">{item.icon}</button>
                                    ))}
                                    <button className="p-1 hover:bg-primary-700 rounded"><MoreHorizontal size={18} /></button>
                                </div>
                            </div>
                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-primary-500">Live Chart Placeholder</p>
                            </div>
                        </div>
                        <LiveTransactionsPanel transactions={MOCK_LIVE_TRANSACTIONS} tokenSymbol={token.symbol} t={t} />
                    </div>
                    <div className="space-y-2">
                        <TokenInfoPanel token={token} />
                        {token.dextScore && <DEXTscorePanel scoreData={token.dextScore} t={t} />}
                        {token.audit && <AuditPanel audit={token.audit} t={t} />}
                        {token.communityTrust && <CommunityTrustPanel trust={token.communityTrust} t={t} />}
                         {token.symbol === 'OWFN' && (
                             <>
                                <TopHoldersPanel t={t} />
                                <MarketSentimentPanel t={t} />
                             </>
                         )}
                    </div>
                </div>

                <div className="bg-primary-800 rounded-md p-3 mt-2">
                    <h3 className="text-sm font-bold mb-2">{t('token_description_title')}</h3>
                    <p className="text-xs text-primary-400">{description}</p>
                </div>
                 <Link to={from || '/dashboard'} className="inline-block text-sm text-accent-400 hover:underline p-2 mt-4">
                    &larr; {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                </Link>
            </div>
        </div>
    );
}