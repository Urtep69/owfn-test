import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Database, Shield, Code, Percent, Zap, Hand, UserCog, Ban, Star } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails, TokenExtension } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';

// Helper component for displaying data
const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-primary-200 dark:border-darkPrimary-700 last:border-b-0">
        <span className="text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-200 text-right break-all">{children}</div>
    </div>
);

// Helper component for authority rows
const AuthorityRow = ({ label, address }: { label: string, address?: string | null }) => (
    <InfoRow label={label}>
        {address ? (
            <AddressDisplay address={address} />
        ) : (
            <span className="text-green-500 dark:text-green-400 font-bold flex items-center justify-end gap-1.5">
                <Shield size={14} /> Revoked
            </span>
        )}
    </InfoRow>
);

// Helper for Token-2022 Extensions
const ExtensionDisplay = ({ extension }: { extension: TokenExtension }) => {
    const { extension: name, state } = extension;
    let content = null;
    switch (name) {
        case 'transferFeeConfig':
            const fee = (state.newerTransferFee?.transferFeeBasisPoints ?? state.olderTransferFee?.transferFeeBasisPoints ?? 0) / 100;
            const maxFee = Number(state.newerTransferFee?.maximumFee ?? state.olderTransferFee?.maximumFee ?? 0) / (10 ** state.mintDecimals);
            content = <><Percent size={14} /> Transfer Fee: {fee.toFixed(2)}% (Max: {maxFee.toLocaleString()})</>;
            break;
        case 'interestBearingConfig':
            const rate = state.rate / 100; // Assuming basis points
            content = <><Zap size={14} /> Interest Bearing: {rate.toFixed(2)}% APR</>;
            break;
        case 'defaultAccountState':
            content = <><Hand size={14} /> Default State: {state.state}</>;
            break;
        case 'permanentDelegate':
             content = <><UserCog size={14} /> Permanent Delegate</>;
             break;
        case 'nonTransferable':
            content = <><Ban size={14} /> Non-Transferable</>;
            break;
        default:
            content = <><Star size={14} /> {name}</>;
    }
    return <div className="text-xs bg-primary-100 dark:bg-darkPrimary-700 p-2 rounded-md flex items-center gap-2">{content}</div>;
};

export default function TokenDetail() {
    const { t } = useAppContext();
    const params = useParams();
    const [location] = useLocation();
    const mintAddress = params?.['mint'];
    
    // Logic to handle back link
    const query = new URLSearchParams(location.split('?')[1] || '');
    const fromPath = query.get('from') || '/dashboard';
    const backLinkText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');


    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mintAddress) {
            setLoading(false);
            setError('No mint address provided.');
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/token-info?mint=${mintAddress}`);
                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
                    throw new Error(errorBody.error || "Failed to fetch token data.");
                }
                const data: Partial<TokenDetails> = await response.json();
                setToken(data);
            } catch (err) {
                console.error("Failed to fetch token details:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mintAddress]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
            </div>
        );
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
    
    return (
        <div className="space-y-8 text-primary-900 dark:text-darkPrimary-100 animate-fade-in-up">
             <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div>
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-lg">{token.symbol}</p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Column 1 */}
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Database/>{t('tokenomics_details_title')}</h3>
                    <div className="space-y-1">
                        <InfoRow label={t('presale_token_address_label')}><AddressDisplay address={token.mintAddress!} type="token"/></InfoRow>
                        <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, {maximumFractionDigits: token.decimals}) ?? 'N/A'}</InfoRow>
                        <InfoRow label={t('token_decimals')}>{token.decimals}</InfoRow>
                         <InfoRow label="Creator"><AddressDisplay address={token.creatorAddress ?? 'Unknown'} /></InfoRow>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield/>Authorities</h3>
                    <div className="space-y-1">
                        <AuthorityRow label="Update Authority" address={token.updateAuthority} />
                        <AuthorityRow label="Mint Authority" address={token.mintAuthority} />
                        <AuthorityRow label="Freeze Authority" address={token.freezeAuthority} />
                    </div>
                </div>

                {/* Full Width */}
                <div className="md:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Code/>{t('token_standard')}</h3>
                    <div className="bg-primary-100 dark:bg-darkPrimary-700 p-3 rounded-md font-mono text-center font-bold text-lg">{token.tokenStandard}</div>
                    {token.tokenStandard === 'Token-2022' && token.tokenExtensions && token.tokenExtensions.length > 0 && (
                         <div className="mt-6 pt-4 border-t border-primary-200 dark:border-darkPrimary-700 space-y-2">
                            <h4 className="font-bold">Active Extensions:</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {token.tokenExtensions.map((ext, i) => <ExtensionDisplay key={i} extension={ext} />)}
                            </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}