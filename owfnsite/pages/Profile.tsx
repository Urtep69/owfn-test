
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
// FIX: Added Heart to the import list from lucide-react.
import { Wallet, DollarSign, HandHeart, Vote, Award, ShieldCheck, Gem, Loader2, Landmark, PlusCircle, History, Heart } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import type { ImpactBadge, UserProfileData, SocialCase, PresaleContribution, DatabaseDonation } from '../lib/types.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { ComingSoonWrapper } from '../components/ComingSoonWrapper.js';
import { formatNumber } from '../lib/utils.js';
import { AddCaseModal } from '../components/AddCaseModal.js';

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value: string | number, isLoading?: boolean }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            {isLoading ? (
                 <div className="h-7 w-24 bg-primary-200 dark:bg-darkPrimary-700 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-xl font-bold">{value}</p>
            )}
        </div>
    </div>
);

const QuickActionButton = ({ to, icon, label, onClick }: { to?: string, icon: React.ReactNode, label: string, onClick?: () => void }) => {
    const content = (
        <div className="flex flex-col items-center justify-center text-center gap-2 p-4 bg-primary-100 dark:bg-darkPrimary-700/50 rounded-lg shadow-md hover:bg-primary-200 dark:hover:bg-darkPrimary-700 hover:scale-105 transition-all duration-200 h-full">
            <div className="text-accent-500 dark:text-darkAccent-400">{icon}</div>
            <span className="font-semibold text-sm">{label}</span>
        </div>
    );

    if (to) {
        return <Link to={to} className="block">{content}</Link>;
    }
    return <button onClick={onClick} className="w-full h-full">{content}</button>;
};


export default function Profile() {
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, address, userTokens, loading: walletLoading } = solana;
    
    const [isAddCaseModalOpen, setAddCaseModalOpen] = useState(false);
    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        if (connected && address) {
            const fetchProfileData = async () => {
                setIsLoadingProfile(true);
                try {
                    const response = await fetch(`/api/profile/data?walletAddress=${address}`);
                    if (response.ok) {
                        const data: UserProfileData = await response.json();
                        setProfileData(data);
                    } else {
                        console.error("Failed to fetch profile data");
                    }
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                } finally {
                    setIsLoadingProfile(false);
                }
            };
            fetchProfileData();
        } else {
            setProfileData(null);
            setIsLoadingProfile(false);
        }
    }, [connected, address]);

    const totalUsdValue = useMemo(() => {
        if (!userTokens || userTokens.length === 0) return 0;
        return userTokens.reduce((sum, token) => sum + token.usdValue, 0);
    }, [userTokens]);

    const summaryStats = useMemo(() => {
        if (!profileData) return { totalPresaleSOL: 0, totalDonatedUSD: 0, casesSubmitted: 0 };
        const totalPresaleSOL = profileData.presaleContributions.reduce((sum, contrib) => sum + parseFloat(contrib.sol_amount), 0);
        const totalDonatedUSD = profileData.donations.reduce((sum, donation) => sum + (parseFloat(donation.usd_value_at_time || '0')), 0);
        return {
            totalPresaleSOL,
            totalDonatedUSD,
            casesSubmitted: profileData.submittedCases.length
        };
    }, [profileData]);

    if (!connected) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d animate-fade-in-up">
                <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{t('my_profile')}</h1>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('profile_connect_prompt')}</p>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    disabled={walletLoading}
                    className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                    {walletLoading ? t('connecting') : t('connect_wallet')}
                </button>
            </div>
        );
    }
    
    return (
        <>
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('impact_dashboard_title')}</h1>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('connected_as')}:</span>
                    {address && <AddressDisplay address={address} />}
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                <QuickActionButton to="/impact" icon={<Heart size={28} />} label={t('impact_portal')} />
                <QuickActionButton to="/governance" icon={<Vote size={28} />} label={t('governance')} />
                <QuickActionButton icon={<PlusCircle size={28} />} label={t('profile_add_case')} onClick={() => setAddCaseModalOpen(true)} />
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('my_tokens')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-primary-100 dark:bg-darkPrimary-900/50 rounded-lg">
                    <div>
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('token_types')}</p>
                        <p className="text-2xl font-bold">{walletLoading ? '-' : userTokens.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_value')}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {walletLoading ? '-' : `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                </div>
                
                {walletLoading ? (
                    <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t('profile_loading_tokens')}</span>
                    </div>
                ) : userTokens.length > 0 ? (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs text-primary-500 dark:text-darkPrimary-500 font-bold uppercase">
                            <span>{t('asset')}</span>
                            <span className="text-right">{t('balance')}</span>
                            <span className="text-right">{t('value_usd')}</span>
                        </div>
                        {userTokens.map(token => (
                           <Link key={token.mintAddress} to={`/dashboard/token/${token.mintAddress}?from=/profile`}>
                                <a className="grid grid-cols-3 gap-4 items-center p-4 rounded-lg hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50 transition-colors duration-200 cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">{token.logo}</div>
                                        <div>
                                            <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{token.symbol}</p>
                                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{token.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono"><p className="font-semibold text-primary-900 dark:text-darkPrimary-100">{formatNumber(token.balance)}</p></div>
                                    <div className="text-right font-semibold font-mono text-primary-900 dark:text-darkPrimary-100">${token.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </a>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8 text-primary-600 dark:text-darkPrimary-400"><p>{t('profile_no_tokens')}</p></div>
                )}
            </div>
            
             <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-4">{t('profile_contribution_history')}</h2>
                <div className="border-b border-primary-200 dark:border-darkPrimary-700">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('summary')} className={`py-3 px-1 border-b-2 font-semibold ${activeTab === 'summary' ? 'border-accent-500 text-accent-600' : 'border-transparent text-primary-500 hover:border-primary-300'}`}>{t('profile_tab_summary')}</button>
                        <button onClick={() => setActiveTab('presale')} className={`py-3 px-1 border-b-2 font-semibold ${activeTab === 'presale' ? 'border-accent-500 text-accent-600' : 'border-transparent text-primary-500 hover:border-primary-300'}`}>{t('presale')}</button>
                        <button onClick={() => setActiveTab('donations')} className={`py-3 px-1 border-b-2 font-semibold ${activeTab === 'donations' ? 'border-accent-500 text-accent-600' : 'border-transparent text-primary-500 hover:border-primary-300'}`}>{t('donations')}</button>
                    </nav>
                </div>
                <div className="pt-6">
                {isLoadingProfile ? (
                     <div className="text-center py-8 flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><span>{t('profile_loading_history')}</span></div>
                ) : (
                    <>
                        {activeTab === 'summary' && (
                            <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up">
                                <StatCard isLoading={isLoadingProfile} icon={<Landmark size={24} />} title={t('profile_total_presale')} value={`${summaryStats.totalPresaleSOL.toFixed(4)} SOL`} />
                                <StatCard isLoading={isLoadingProfile} icon={<DollarSign size={24} />} title={t('total_donated')} value={`$${summaryStats.totalDonatedUSD.toFixed(2)}`} />
                                <StatCard isLoading={isLoadingProfile} icon={<HandHeart size={24} />} title={t('profile_cases_submitted')} value={summaryStats.casesSubmitted} />
                            </div>
                        )}
                         {activeTab === 'presale' && (
                            <div className="animate-fade-in-up">
                               {profileData?.presaleContributions && profileData.presaleContributions.length > 0 ? (
                                    <div className="overflow-x-auto"><table className="w-full text-sm">
                                        <thead className="text-xs text-primary-500 uppercase bg-primary-100 dark:bg-darkPrimary-700"><tr>
                                            <th className="px-4 py-2 text-left">{t('date')}</th><th className="px-4 py-2 text-right">{t('sol_amount')}</th><th className="px-4 py-2 text-right">{t('owfn_received')}</th><th className="px-4 py-2 text-left">{t('transaction')}</th>
                                        </tr></thead>
                                        <tbody>
                                            {profileData.presaleContributions.map(c => (
                                                <tr key={c.id} className="border-b dark:border-darkPrimary-700">
                                                    <td className="px-4 py-2">{new Date(c.timestamp).toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{parseFloat(c.sol_amount).toFixed(4)}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{parseFloat(c.owfn_received_with_bonus).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                                    <td className="px-4 py-2"><AddressDisplay address={c.transaction_signature} type="tx"/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table></div>
                               ) : (<p>{t('profile_no_presale')}</p>)}
                            </div>
                        )}
                         {activeTab === 'donations' && (
                             <div className="animate-fade-in-up">
                                 {profileData?.donations && profileData.donations.length > 0 ? (
                                    <div className="overflow-x-auto"><table className="w-full text-sm">
                                        <thead className="text-xs text-primary-500 uppercase bg-primary-100 dark:bg-darkPrimary-700"><tr>
                                            <th className="px-4 py-2 text-left">{t('date')}</th><th className="px-4 py-2 text-right">{t('amount')}</th><th className="px-4 py-2 text-right">{t('value_usd')}</th><th className="px-4 py-2 text-left">{t('transaction')}</th>
                                        </tr></thead>
                                        <tbody>
                                           {profileData.donations.map(d => (
                                                <tr key={d.id} className="border-b dark:border-darkPrimary-700">
                                                    <td className="px-4 py-2">{new Date(d.timestamp).toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-right font-mono">{parseFloat(d.amount).toFixed(4)}</td>
                                                    <td className="px-4 py-2 text-right font-mono">${parseFloat(d.usd_value_at_time || '0').toFixed(2)}</td>
                                                    <td className="px-4 py-2"><AddressDisplay address={d.transaction_signature} type="tx"/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table></div>
                                 ) : (<p>{t('profile_no_donations')}</p>)}
                             </div>
                         )}
                    </>
                )}
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                 <h2 className="text-2xl font-bold mb-4">{t('profile_my_submitted_cases')}</h2>
                 {isLoadingProfile ? (
                     <div className="text-center py-8 flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><span>{t('profile_loading_cases')}</span></div>
                 ) : profileData?.submittedCases && profileData.submittedCases.length > 0 ? (
                    <div className="space-y-3">
                        {profileData.submittedCases.map(c => (
                            <div key={c.id} className="bg-primary-100 dark:bg-darkPrimary-700/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{c.title['en']}</p>
                                    <p className="text-xs text-primary-500">{new Date(c.created_at!).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-200 text-blue-800">{c.status}</span>
                            </div>
                        ))}
                    </div>
                 ) : (
                     <p className="text-primary-600 dark:text-darkPrimary-400">{t('profile_no_submitted_cases')}</p>
                 )}
            </div>

        </div>
        {isAddCaseModalOpen && <AddCaseModal setIsOpen={setAddCaseModalOpen} />}
        </>
    );
}
