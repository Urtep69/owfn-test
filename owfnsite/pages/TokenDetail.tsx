import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Database, Shield, DollarSign, FileText, Link as LinkIcon, Globe, Twitter, Send } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DiscordIcon } from '../components/IconComponents.tsx';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';


// --- Helper Functions & Components ---

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-xl shadow-3d">
        <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 rounded-lg p-3">{icon}</div>
            <div>
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
                </div>
            </div>
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-800 dark:text-darkPrimary-200">{icon}{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
        <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <div className="text-sm font-semibold text-primary-800 dark:text-darkPrimary-200 text-right break-all">{children}</div>
    </div>
);

const LinkButton = ({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-grow flex items-center justify-center gap-2 bg-primary-100 dark:bg-darkPrimary-700 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 text-primary-700 dark:text-darkPrimary-200 font-semibold py-2 px-3 rounded-md transition-colors">
        {icon}{text}
    </a>
);


// --- Main Component ---

export default function TokenDetail() {
    const { t } = useAppContext();
    const { connection } = useConnection();
    const params = useParams();
    const [location] = useLocation();
    const mintAddress = params?.['mint'];
    
    const query = new URLSearchParams(location.split('?')[1] || '');
    const fromPath = query.get('from') || '/dashboard';
    const backLinkText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');

    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const AuthorityRow = ({ label, address }: { label: string, address?: string | null }) => (
        <InfoRow label={label}>
            {address ? <AddressDisplay address={address} /> : <span className="text-green-500 font-bold flex items-center justify-end gap-1.5"><Shield size={14}/> {t('revoked')}</span>}
        </InfoRow>
    );

    useEffect(() => {
        if (!mintAddress) {
            setLoading(false);
            setError('No mint address provided.');
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true);
            setError(null);
            const responseData: Partial<TokenDetails> = { mintAddress };

            try {
                // Step 1: Fetch from Birdeye
                try {
                    const birdeyeResponse = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`);
                    if (birdeyeResponse.ok) {
                        const apiData = await birdeyeResponse.json();
                        if (apiData.success && apiData.data) {
                            const tokenData = apiData.data;
                            responseData.name = tokenData.name;
                            responseData.symbol = tokenData.symbol;
                            responseData.logo = tokenData.logoURI;
                            responseData.decimals = tokenData.decimals;
                            responseData.pricePerToken = tokenData.price || 0;
                            responseData.description = tokenData.description;
                            responseData.links = tokenData.links;
                        }
                    } else {
                        console.warn(`Birdeye API for ${mintAddress} failed with status ${birdeyeResponse.status}`);
                    }
                } catch (e) {
                    console.warn(`Could not fetch metadata from Birdeye for ${mintAddress}:`, e);
                }

                // Step 2: Fetch on-chain data
                try {
                    const mintPublicKey = new PublicKey(mintAddress);
                    const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);

                    if (accountInfo?.value) {
                        const programOwner = accountInfo.value.owner.toBase58();
                        if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                            responseData.tokenStandard = 'Token-2022';
                        } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                            responseData.tokenStandard = 'SPL Token';
                        }

                        const info = (accountInfo.value.data as ParsedAccountData)?.parsed?.info;

                        if (info && typeof info === 'object') {
                            if (typeof info.decimals === 'number') {
                                responseData.decimals = info.decimals; // On-chain is truth
                                if (info.supply) {
                                    try {
                                        const supplyBigInt = BigInt(info.supply);
                                        const divisor = 10n ** BigInt(info.decimals);
                                        responseData.totalSupply = Number(supplyBigInt) / Number(divisor);
                                    } catch (parseError) {
                                        responseData.totalSupply = 0;
                                    }
                                }
                            }
                            responseData.mintAuthority = info.mintAuthority ?? null;
                            responseData.freezeAuthority = info.freezeAuthority ?? null;
                        }
                    }
                } catch(e) {
                    console.warn(`Could not fetch on-chain account info for ${mintAddress}. Error:`, e);
                }

                // Step 3: Final Cleanup & Set State
                if (!responseData.name) responseData.name = 'Unknown Token';
                if (!responseData.symbol) responseData.symbol = `${mintAddress.slice(0,4)}...${mintAddress.slice(-4)}`;
                responseData.updateAuthority = null; // Assume null

                if (responseData.totalSupply === undefined && responseData.decimals === undefined) {
                     throw new Error(`Token data not found.`);
                }
                
                setToken(responseData);

            } catch (err) {
                console.error("Failed to fetch token details:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mintAddress, connection]);

    const getLinkIcon = (key: string) => {
        if (key.includes('twitter')) return <Twitter size={16} />;
        if (key.includes('telegram')) return <Send size={16} />;
        if (key.includes('discord')) return <DiscordIcon className="w-4 h-4" />;
        return <Globe size={16} />;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <Link to={fromPath} className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {backLinkText}
                </Link>
            </div>
        );
    }
    
    const isPriceAvailable = (token.pricePerToken ?? 0) > 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            <header className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-lg">${token.symbol}</p>
                </div>
            </header>

            {isPriceAvailable && (
                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title={t('pricePerToken', {defaultValue: 'Price'})} value={`$${token.pricePerToken?.toPrecision(4)}`} icon={<DollarSign />} />
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Market/Trading info cards removed as requested */}
                    <InfoCard title={t('on_chain_security')} icon={<Shield />}>
                        <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</InfoRow>
                        <InfoRow label={t('token_standard')}>{token.tokenStandard}</InfoRow>
                        <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} />
                        <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} />
                        <AuthorityRow label="Update Authority" address={token.updateAuthority} />
                    </InfoCard>
                </div>
                
                <div className="lg:col-span-1 space-y-8">
                    {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{token.description}</p>
                        </InfoCard>
                    )}
                    
                    {token.links && Object.entries(token.links).filter(([, href]) => href).length > 0 && (
                        <InfoCard title="Links" icon={<LinkIcon />}>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(token.links).map(([key, href]) => href && (
                                    <LinkButton key={key} href={href as string} icon={getLinkIcon(key)} text={key.charAt(0).toUpperCase() + key.slice(1)} />
                                ))}
                            </div>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    );
}